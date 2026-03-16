import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Application } from '../types';
import { Send, Inbox, Check, X, User } from 'lucide-react';

const Applications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('applications')
      .select(`
        *,
        sender:users!sender_id(
          name,
          profiles(basic_info)
        ),
        receiver:users!receiver_id(
          name,
          profiles(basic_info)
        )
      `);

    if (activeTab === 'received') {
      query = query.eq('receiver_id', user.id);
    } else {
      query = query.eq('sender_id', user.id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const handleAccept = async (appId: string, senderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', appId);

      if (updateError) throw updateError;

      // 2. Check if we should create a mutual application (simulate "apply back")
      // OR simply create a Match record if this action confirms the match
      
      // Let's create a match record directly for simplicity when accepted
      const { error: matchError } = await supabase
        .from('matches')
        .insert([
          {
            user1_id: senderId,
            user2_id: user.id,
            match_score: 100, // Manually matched
            match_reasons: { summary: '双方互相同意' }
          }
        ]);

      if (matchError) {
        // Ignore unique constraint error if match already exists
        if (!matchError.message.includes('unique')) throw matchError;
      }

      // Refresh list
      fetchApplications();
      alert('已接受申请！你们现在可以开始邀约了。');
    } catch (error: any) {
      alert('操作失败: ' + error.message);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', appId);

      if (error) throw error;
      fetchApplications();
    } catch (error: any) {
      alert('操作失败: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <Inbox className="h-8 w-8 text-pink-500" />
        投递管理
      </h1>

      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`pb-4 px-6 font-medium transition-colors relative ${
            activeTab === 'received'
              ? 'text-pink-500 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('received')}
        >
          我收到的
        </button>
        <button
          className={`pb-4 px-6 font-medium transition-colors relative ${
            activeTab === 'sent'
              ? 'text-pink-500 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          我投递的
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">暂时没有记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const isReceived = activeTab === 'received';
            const otherUser = isReceived ? app.sender : app.receiver;
            // Handle profile nested in user array or object
            const otherProfileRaw = otherUser?.profiles;
            const otherProfile = Array.isArray(otherProfileRaw) ? otherProfileRaw[0] : otherProfileRaw;
            const otherId = isReceived ? app.sender_id : app.receiver_id;

            return (
              <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {otherUser?.name || '未知用户'}
                      {otherProfile && (
                         <span className="text-sm font-normal text-gray-500">
                           {otherProfile.basic_info?.age}岁 · {otherProfile.basic_info?.location}
                         </span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    {app.message && (
                      <p className="text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg text-sm">
                        "{app.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isReceived && app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(app.id, app.sender_id)}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" /> 接受
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <X className="h-4 w-4" /> 拒绝
                      </button>
                    </>
                  )}
                  
                  {app.status !== 'pending' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {app.status === 'accepted' ? '已接受' : '已拒绝'}
                    </span>
                  )}

                  <Link
                    to={`/profile/${otherId}`}
                    className="text-pink-500 hover:text-pink-600 font-medium text-sm ml-2"
                  >
                    查看简历
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
