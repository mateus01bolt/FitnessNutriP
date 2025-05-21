import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { processPayment } from '../../lib/mercadopago';
import toast from 'react-hot-toast';

function PaymentStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentStatus = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const status = params.get('collection_status') || params.get('status');
        const paymentId = params.get('collection_id') || params.get('payment_id');
        const externalReference = params.get('external_reference');

        if (!status || !paymentId || !externalReference) {
          throw new Error('Missing payment information');
        }

        // Process the payment and update the database
        await processPayment(externalReference, paymentId, status);

        if (status === 'approved') {
          // Check if the user's profile has been updated
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('has_paid_plan')
            .eq('id', externalReference)
            .single();

          if (profileError) {
            throw profileError;
          }

          if (profile?.has_paid_plan) {
            toast.success('Pagamento aprovado! Redirecionando para seu plano...');
            // Redirect after a short delay
            setTimeout(() => {
              navigate('/plan', { replace: true });
            }, 2000);
          } else {
            throw new Error('Profile not updated after payment');
          }
        }
      } catch (error) {
        console.error('Error processing payment status:', error);
        setError('Erro ao processar status do pagamento. Por favor, entre em contato com o suporte.');
        toast.error('Erro ao processar pagamento');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentStatus();
  }, [location, navigate]);

  const getStatusContent = () => {
    const params = new URLSearchParams(location.search);
    const status = params.get('collection_status') || params.get('status');
    
    if (status === 'approved') {
      return {
        icon: <CheckCircle className="h-16 w-16 text-green-500" />,
        title: 'Pagamento Aprovado!',
        message: 'Seu plano foi ativado com sucesso. Você será redirecionado em alguns segundos...',
        buttonText: 'Ir para Meu Plano',
        buttonAction: () => navigate('/plan', { replace: true }),
        buttonColor: 'bg-green-500 hover:bg-green-600'
      };
    } else if (status === 'pending') {
      return {
        icon: <Clock className="h-16 w-16 text-yellow-500" />,
        title: 'Pagamento Pendente',
        message: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
        buttonText: 'Voltar para Home',
        buttonAction: () => navigate('/', { replace: true }),
        buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
      };
    } else {
      return {
        icon: <XCircle className="h-16 w-16 text-red-500" />,
        title: 'Pagamento não Aprovado',
        message: 'Houve um problema com seu pagamento. Por favor, tente novamente.',
        buttonText: 'Tentar Novamente',
        buttonAction: () => navigate('/plans', { replace: true }),
        buttonColor: 'bg-red-500 hover:bg-red-600'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-6">
          {content.icon}
          <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-gray-600">{content.message}</p>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            onClick={content.buttonAction}
            className={`w-full py-3 px-6 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${content.buttonColor}`}
          >
            <span>{content.buttonText}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentStatus;