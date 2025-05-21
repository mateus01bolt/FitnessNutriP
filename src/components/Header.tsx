import React, { useState } from 'react';
import { Menu as MenuIcon, Leaf, MessageCircle } from 'lucide-react';
import Menu from './Menu';
import { supabase } from '../lib/supabase';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, []);

  return (
    <>
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="text-center -mt-6">
              <div className="bg-emerald-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:rotate-45 transition-transform duration-300">
                <Leaf className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-700 tracking-wider">FITNESS NUTRI</h1>
              <p className="text-sm text-emerald-600 mt-1 font-medium">
                Simples, rápido e saudável: monte sua dieta já!
              </p>
            </div>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-emerald-400" />
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center space-x-4">
            <button className="flex items-center px-6 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <MessageCircle className="h-5 w-5 text-emerald-600 mr-2" />
              <span className="text-emerald-600">Suporte</span>
            </button>
          </div>
        </div>
      </div>

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}

export default Header;