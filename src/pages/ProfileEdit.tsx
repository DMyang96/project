import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Save, User, Heart, Search } from 'lucide-react';
import { Profile } from '../types';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [basicInfo, setBasicInfo] = useState({
    age: '',
    height: '',
    education: 'bachelor',
    occupation: '',
    income: '',
    location: '',
    gender: 'male',
  });
  
  const [relationshipHistory, setRelationshipHistory] = useState('');
  
  const [requirements, setRequirements] = useState({
    min_age: '',
    max_age: '',
    min_height: '',
    education: [] as string[],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setBasicInfo({
          ...data.basic_info,
          age: data.basic_info.age.toString(),
          height: data.basic_info.height.toString(),
        });
        setRelationshipHistory(data.relationship_history);
        setRequirements({
          ...data.requirements,
          min_age: data.requirements.min_age.toString(),
          max_age: data.requirements.max_age.toString(),
          min_height: data.requirements.min_height.toString(),
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const profileData = {
        user_id: userId,
        basic_info: {
          ...basicInfo,
          age: parseInt(basicInfo.age),
          height: parseInt(basicInfo.height),
        },
        relationship_history: relationshipHistory,
        requirements: {
          ...requirements,
          min_age: parseInt(requirements.min_age),
          max_age: parseInt(requirements.max_age),
          min_height: parseInt(requirements.min_height),
        },
        is_active: true,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;
      
      // Navigate to matches or show success
      navigate('/matches');
    } catch (error: any) {
      alert('保存失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRequirements(prev => {
      const newEducation = e.target.checked
        ? [...prev.education, value]
        : prev.education.filter(item => item !== value);
      return { ...prev, education: newEducation };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <User className="h-8 w-8 text-pink-500" />
        完善您的简历
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-pink-500" />
            基本资料
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.gender}
                onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.age}
                onChange={(e) => setBasicInfo({ ...basicInfo, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.height}
                onChange={(e) => setBasicInfo({ ...basicInfo, height: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学历</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.education}
                onChange={(e) => setBasicInfo({ ...basicInfo, education: e.target.value })}
              >
                <option value="high_school">高中及以下</option>
                <option value="associate">大专</option>
                <option value="bachelor">本科</option>
                <option value="master">硕士</option>
                <option value="phd">博士</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">职业</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.occupation}
                onChange={(e) => setBasicInfo({ ...basicInfo, occupation: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年收入 (万)</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.income}
                onChange={(e) => setBasicInfo({ ...basicInfo, income: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">所在城市</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={basicInfo.location}
                onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Relationship History Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            感情经历与观念
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              请详细描述您的感情经历、分手原因以及对未来感情的期待
            </label>
            <textarea
              required
              rows={6}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              placeholder="真诚的分享有助于找到更合适的人..."
              value={relationshipHistory}
              onChange={(e) => setRelationshipHistory(e.target.value)}
            />
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Search className="h-5 w-5 text-pink-500" />
            择偶要求
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最小年龄</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={requirements.min_age}
                onChange={(e) => setRequirements({ ...requirements, min_age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最大年龄</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={requirements.max_age}
                onChange={(e) => setRequirements({ ...requirements, max_age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最低身高 (cm)</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                value={requirements.min_height}
                onChange={(e) => setRequirements({ ...requirements, min_height: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最低学历要求</label>
              <div className="space-y-2 mt-2">
                {['bachelor', 'master', 'phd'].map((edu) => (
                  <label key={edu} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={edu}
                      checked={requirements.education.includes(edu)}
                      onChange={handleEducationChange}
                      className="rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-gray-700">
                      {edu === 'bachelor' ? '本科' : edu === 'master' ? '硕士' : '博士'}及以上
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-pink-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {saving ? '保存中...' : '保存简历'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
