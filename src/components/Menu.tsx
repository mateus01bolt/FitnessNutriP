import React from 'react';
import { X, Utensils, MessageCircle, LogOut, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

function Menu({ isOpen, onClose, userEmail }: MenuProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Erro ao fazer logout');
        return;
      }
      
      toast.success('Logout realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleNewDiet = () => {
    navigate('/');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="pt-12 pb-6 px-6 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold mb-1">Olá, Cliente 🍀</h2>
          <p className="text-gray-600 text-sm mb-1">{userEmail}</p>
          <p className="text-sm text-gray-500">Ticket: 0</p>
        </div>

        <div className="px-6 space-y-4">
          <button
            onClick={handleNewDiet}
            className="w-full flex items-center text-left px-4 py-3 rounded-lg bg-[#28a745] text-white hover:bg-[#218838] transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-3" />
            <span>Gerar Nova Dieta</span>
          </button>
          <button className="w-full flex items-center text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Utensils className="h-5 w-5 text-green-500 mr-3" />
            <span>Acessar Dieta</span>
          </button>
          <button className="w-full flex items-center text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="h-5 w-5 text-gray-500 mr-3" />
            <span>Fale conosco</span>
          </button>
        </div>

        <div className="px-6 py-6 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;