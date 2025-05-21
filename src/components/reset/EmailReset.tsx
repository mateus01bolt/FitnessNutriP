import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface EmailResetProps {
  onBack: () => void;
  onBackToLogin: () => void;
}

function EmailReset({ onBack, onBackToLogin }: EmailResetProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const maxAttempts = 5;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    if (isBlocked) {
      toast.error(`Muitas tentativas. Tente novamente mais tarde.`);
      return;
    }

    try {
      setLoading(true);
      setAttempts(prev => prev + 1);

      if (attempts >= maxAttempts - 1) {
        setIsBlocked(true);
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
        }, 30 * 60 * 1000); // 30 minutes block
        throw new Error('Limite de tentativas excedido');
      }

      const trimmedEmail = email.trim();
      
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setResetSent(true);
      toast.success('Email de recuperação enviado com sucesso!');
      setAttempts(0); // Reset attempts after successful send
    } catch (error: any) {
      if (error.message === 'Limite de tentativas excedido') {
        toast.error('Muitas tentativas. Tente novamente em 30 minutos.');
      } else {
        console.error('Reset password error:', error);
        toast.error('Se o email existir, você receberá as instruções de recuperação.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Se o email estiver cadastrado, um link para redefinição de senha será enviado.
            O link expirará em 1 hora por motivos de segurança.
          </p>
          <p className="text-sm text-gray-500">
            Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
          </p>
        </div>
        <button
          onClick={() => {
            setResetSent(false);
            setEmail('');
          }}
          className="w-full py-3 px-4 border border-[#28a745] text-[#28a745] rounded-lg hover:shadow-md transition-shadow"
        >
          Tentar Novamente
        </button>
        <button
          onClick={onBackToLogin}
          className="w-full py-3 px-4 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors"
        >
          Voltar para Login
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleResetPassword}>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
        {attempts > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Tentativas restantes: {maxAttempts - attempts}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || isBlocked}
        className="w-full py-3 px-4 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ENVIANDO...' : 'ENVIAR INSTRUÇÕES'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 px-4 border border-[#28a745] text-[#28a745] rounded-lg hover:shadow-md transition-shadow"
      >
        Voltar
      </button>
    </form>
  );
}

export default EmailReset;