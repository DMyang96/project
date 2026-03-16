import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Profile, User } from '../types';
import { User as UserIcon, Heart, MapPin, Briefcase, GraduationCap, DollarSign, Send } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [applicationSent, setApplicationSent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch user info (name)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', id)
        .single();
      
      if (userData) {
        setUser(userData as any);
      }

      // Check if application already sent
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: appData } = await supabase
          .from('applications')
          .select('id')
          .eq('sender_id', currentUser.id)
          .eq('receiver_id', id)
          .single();
        
        if (appData) setApplicationSent(true);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  const handleSendApplication = async () => {
    setSending(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('applications')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: id,
            status: 'pending',
            message: '我对您的简历很感兴趣，希望能进一步了解。',
          },
        ]);

      if (error) throw error;
      setApplicationSent(true);
      alert('投递成功！等待对方回应。');
    } catch (error: any) {
      alert('投递失败: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-gray-500">未找到该用户的简历</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            {user?.name || '匿名用户'}
            <span className="text-sm font-normal bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
              {profile.basic_info.age}岁
            </span>
            <span className="text-sm font-normal bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
               {profile.basic_info.gender === 'male' ? '男' : '女'}
            </span>
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {profile.basic_info.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> {profile.basic_info.occupation}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" /> 
              {profile.basic_info.education === 'bachelor' ? '本科' : 
               profile.basic_info.education === 'master' ? '硕士' : 
               profile.basic_info.education === 'phd' ? '博士' : '其他'}
            </span>
             <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> {profile.basic_info.income}万/年
            </span>
          </div>
        </div>
        
        {!applicationSent ? (
          <button
            onClick={handleSendApplication}
            disabled={sending}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-pink-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            {sending ? '投递中...' : '投递简历'}
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-100 text-gray-500 px-6 py-3 rounded-full font-semibold cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            已投递
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              感情经历与观念
            </h2>
            <div className="prose prose-pink max-w-none text-gray-600 whitespace-pre-wrap">
              {profile.relationship_history}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">基本资料</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex justify-between">
                <span className="text-gray-400">身高</span>
                <span>{profile.basic_info.height}cm</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">年龄</span>
                <span>{profile.basic_info.age}岁</span>
              </li>
               <li className="flex justify-between">
                <span className="text-gray-400">学历</span>
                <span>
                   {profile.basic_info.education === 'bachelor' ? '本科' : 
                    profile.basic_info.education === 'master' ? '硕士' : 
                    profile.basic_info.education === 'phd' ? '博士' : '其他'}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">职业</span>
                <span>{profile.basic_info.occupation}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">择偶要求</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex justify-between">
                <span className="text-gray-400">年龄范围</span>
                <span>{profile.requirements.min_age} - {profile.requirements.max_age}岁</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">最低身高</span>
                <span>{profile.requirements.min_height}cm</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-gray-400">学历要求</span>
                <div className="flex flex-wrap gap-2">
                  {profile.requirements.education && profile.requirements.education.length > 0 ? (
                    profile.requirements.education.map((edu: string) => (
                      <span key={edu} className="bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded">
                         {edu === 'bachelor' ? '本科' : edu === 'master' ? '硕士' : edu === 'phd' ? '博士' : edu}
                      </span>
                    ))
                  ) : (
                    <span>不限</span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
