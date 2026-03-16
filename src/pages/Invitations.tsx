import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Invitation, User } from '../types';
import { Calendar, MapPin, Clock, Plus, Check, X } from 'lucide-react';

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // New Invitation State
  const [newInvitation, setNewInvitation] = useState({
    target_user_id: '',
    meeting_type: 'coffee',
    proposed_time: '',
    location: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    // Fetch Invitations
    const { data: invData } = await supabase
      .from('invitations')
      .select(`
        *,
        sender:users!sender_id(name),
        receiver:users!receiver_id(name)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    setInvitations(invData || []);

    // Fetch Matches (for creating new invitation)
    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        *,
        user1:users!user1_id(name),
        user2:users!user2_id(name)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    
    if (matchesData) {
      const formattedMatches = matchesData.map((m: any) => {
        const isUser1 = m.user1_id === user.id;
        return {
          id: m.id,
          partner_id: isUser1 ? m.user2_id : m.user1_id,
          partner_name: isUser1 ? m.user2?.name : m.user1?.name,
        };
      });
      setMatches(formattedMatches);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('invitations')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: newInvitation.target_user_id,
            meeting_type: newInvitation.meeting_type,
            proposed_time: new Date(newInvitation.proposed_time).toISOString(),
            location: newInvitation.location,
            status: 'pending',
          }
        ]);

      if (error) throw error;
      
      setShowCreateModal(false);
      setNewInvitation({
        target_user_id: '',
        meeting_type: 'coffee',
        proposed_time: '',
        location: '',
      });
      fetchData();
      alert('邀约已发送！');
    } catch (error: any) {
      alert('发送失败: ' + error.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('操作失败: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-pink-500" />
          线下邀约
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-pink-500/30"
        >
          <Plus className="h-5 w-5" /> 发起邀约
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">暂无邀约记录</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {invitations.map((inv: any) => {
            const isSender = inv.sender_id === currentUser?.id;
            const partnerName = isSender ? inv.receiver?.name : inv.sender?.name;
            const meetingDate = new Date(inv.proposed_time);

            return (
              <div key={inv.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      与 {partnerName} 的{inv.meeting_type === 'coffee' ? '咖啡' : '晚餐'}之约
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'accepted' ? 'bg-green-100 text-green-600' :
                      inv.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {inv.status === 'pending' ? '待确认' :
                       inv.status === 'accepted' ? '已接受' : '已拒绝'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600 text-sm mt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-pink-500" />
                      {meetingDate.toLocaleDateString()} {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      {inv.location}
                    </div>
                  </div>
                </div>

                {!isSender && inv.status === 'pending' && (
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => handleUpdateStatus(inv.id, 'accepted')}
                      className="flex-1 md:flex-none bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" /> 接受
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(inv.id, 'rejected')}
                      className="flex-1 md:flex-none bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" /> 拒绝
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">发起邀约</h2>
            
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">您还没有匹配的对象，无法发起邀约。</p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-medium"
                >
                  关闭
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvitation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邀约对象</label>
                  <select
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    value={newInvitation.target_user_id}
                    onChange={(e) => setNewInvitation({ ...newInvitation, target_user_id: e.target.value })}
                  >
                    <option value="">请选择</option>
                    {matches.map((m) => (
                      <option key={m.id} value={m.partner_id}>{m.partner_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">见面类型</label>
                  <select
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    value={newInvitation.meeting_type}
                    onChange={(e) => setNewInvitation({ ...newInvitation, meeting_type: e.target.value })}
                  >
                    <option value="coffee">喝咖啡</option>
                    <option value="dinner">共进晚餐</option>
                    <option value="park">公园散步</option>
                    <option value="movie">看电影</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">建议时间</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    value={newInvitation.proposed_time}
                    onChange={(e) => setNewInvitation({ ...newInvitation, proposed_time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：星巴克（市中心店）"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    value={newInvitation.location}
                    onChange={(e) => setNewInvitation({ ...newInvitation, location: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-pink-500/30"
                  >
                    发送邀约
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;
