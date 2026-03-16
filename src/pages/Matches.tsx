import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Profile, User } from '../types';
import { Sparkles, MapPin, Briefcase, ChevronRight } from 'lucide-react';

interface MatchProfile extends Profile {
  user_name: string;
  match_score: number;
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get current user's profile to understand requirements
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!myProfile) {
        setLoading(false);
        return; // User hasn't created a profile yet
      }

      // 2. Get all other active profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, users(name)') // Join with users table to get name
        .neq('user_id', user.id)
        .eq('is_active', true);

      if (profiles) {
        // 3. Simulate AI Matching Logic
        // In a real app, this would be a backend process or Edge Function calling an LLM
        const scoredMatches = profiles.map((p: any) => {
          let score = 60; // Base score
          
          // Simple rule-based scoring simulation
          const age = p.basic_info.age;
          const reqMinAge = myProfile.requirements.min_age;
          const reqMaxAge = myProfile.requirements.max_age;
          
          if (age >= reqMinAge && age <= reqMaxAge) score += 20;
          
          const height = p.basic_info.height;
          const reqMinHeight = myProfile.requirements.min_height;
          if (height >= reqMinHeight) score += 10;

          const education = p.basic_info.education;
          if (myProfile.requirements.education.includes(education)) score += 10;

          // Random variation to simulate "AI analysis" of text fields
          score += Math.floor(Math.random() * 10); 

          return {
            ...p,
            user_name: p.users?.name || '未知用户',
            match_score: Math.min(score, 99), // Cap at 99
          };
        });

        // Sort by score
        scoredMatches.sort((a, b) => b.match_score - a.match_score);
        setMatches(scoredMatches);
      }
      
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-pink-500" />
          AI 智能匹配推荐
        </h1>
        <p className="text-gray-500">基于您的要求和过往经历智能推荐</p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-xl text-gray-500">暂时没有找到匹配的对象，请完善简历或稍后再试。</p>
          <Link to="/profile/edit" className="text-pink-500 hover:text-pink-600 font-medium mt-4 inline-block">
            去完善简历
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((profile) => (
            <div key={profile.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{profile.user_name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">
                        {profile.basic_info.age}岁
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {profile.basic_info.gender === 'male' ? '男' : '女'}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-500">{profile.match_score}%</div>
                    <div className="text-xs text-gray-400">匹配度</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {profile.basic_info.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    {profile.basic_info.occupation}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 line-clamp-3 mb-6 h-20">
                  "{profile.relationship_history}"
                </div>

                <Link
                  to={`/profile/${profile.user_id}`}
                  className="block w-full text-center bg-white border border-pink-500 text-pink-500 hover:bg-pink-50 font-medium py-2 rounded-xl transition-colors group-hover:bg-pink-500 group-hover:text-white"
                >
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
