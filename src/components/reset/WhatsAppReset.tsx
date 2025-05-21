import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface WhatsAppResetProps {
  onBack: () => void;
  onBackToLogin: () => void;
}

function WhatsAppReset({ onBack, onBackToLogin }: WhatsAppResetProps) {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const startTimer = () => {
    setTimeLeft(600); // 10 minutes
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('Por favor, insira seu número de WhatsApp');
      return;
    }

    try {
      setLoading(true);

      // Here we would integrate with WhatsApp Business API
      // For now, we'll simulate the code sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeSent(true);
      startTimer();
      toast.success('Código enviado para seu WhatsApp!');
    } catch (error: any) {
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Por favor, insira o código de verificação');
      return;
    }

    if (attempts >= 3) {
      toast.error('Número máximo de tentativas excedido. Solicite um novo código.');
      return;
    }

    try {
      setLoading(true);
      setAttempts(prev => prev + 1);

      // Here we would verify the code with WhatsApp Business API
      // For now, we'll simulate the verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      if (verificationCode === '123456') {
        toast.success('Código verificado com sucesso!');
        onBackToLogin();
      } else {
        throw new Error('Código inválido');
      }
    } catch (error: any) {
      toast.error('Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (codeSent) {
    return (
      <form className="space-y-6" onSubmit={handleVerifyCode}>
        <div className="bg-[#dcf8c6] p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Um código de verificação foi enviado para seu WhatsApp.
            Insira-o abaixo para redefinir sua senha.
          </p>
          {timeLeft > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Código expira em: {formatTime(timeLeft)}
            </p>
          )}
        </div>

        <input
          type="text"
          placeholder="Código de verificação"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />

        <div className="text-sm text-gray-500 text-center">
          Tentativas restantes: {3 - attempts}
        </div>

        <button
          type="submit"
          disabled={loading || timeLeft === 0 || attempts >= 3}
          className="w-full py-3 px-4 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
        </button>

        {(timeLeft === 0 || attempts >= 3) && (
          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setVerificationCode('');
              setAttempts(0);
            }}
            className="w-full py-3 px-4 border border-[#25D366] text-[#25D366] rounded-lg hover:shadow-md transition-shadow"
          >
            Solicitar Novo Código
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Voltar
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSendCode}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <img
            src="https://flagcdn.com/w20/br.png"
            alt="Brazil"
            className="w-5 h-auto"
          />
        </div>
        <input
          type="tel"
          placeholder="Número do WhatsApp"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-3 px-4 border border-[#25D366] text-[#25D366] rounded-lg hover:shadow-md transition-shadow"
      >
        Voltar
      </button>
    </form>
  );
}

export default WhatsAppReset;