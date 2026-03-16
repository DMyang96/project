import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Search } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          像找工作一样<br />
          <span className="text-pink-500">严肃认真</span>地找对象
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          拒绝快餐式恋爱。在这里，我们通过详细的简历、AI智能匹配和严肃的邀约流程，帮你找到真正合适的人生伴侣。
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-pink-500/30"
          >
            开始寻爱之旅
          </Link>
          <Link
            to="/login"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-3 rounded-full text-lg font-semibold transition-all"
          >
            登录账号
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">严肃认证</h3>
          <p className="text-gray-500">
            详细的个人简历和严格的审核机制，确保每一位用户的真实性和诚意。
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">AI 智能匹配</h3>
          <p className="text-gray-500">
            基于深度学习的匹配算法，分析双方的经历、要求和价值观，推荐最契合的伴侣。
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">双向奔赴</h3>
          <p className="text-gray-500">
            互相投递简历，双方确认后才能开启邀约，让每一次见面都充满期待。
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
