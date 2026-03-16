import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, LogOut } from 'lucide-react';
import { supabase } from '../supabase/client';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Heart className="h-8 w-8 text-pink-500 fill-current" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">SeriousDate</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/matches" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
                  匹配推荐
                </Link>
                <Link to="/applications" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
                  投递管理
                </Link>
                <Link to="/invitations" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
                  邀约记录
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                  <Link to="/profile/edit" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 font-medium transition-colors">
                    <User className="h-5 w-5" />
                    <span>我的简历</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">
                  登录
                </Link>
                <Link
                  to="/register"
                  className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} SeriousDate. 严肃认真的相亲平台.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
