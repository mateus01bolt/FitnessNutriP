import React from 'react';
import { Salad } from 'lucide-react';
import EmailReset from './reset/EmailReset';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

function ResetPassword({ onBackToLogin }: ResetPasswordProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Salad className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Recuperar Senha</h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        <EmailReset 
          onBack={onBackToLogin}
          onBackToLogin={onBackToLogin}
        />
      </div>
    </div>
  );
}

export default ResetPassword;