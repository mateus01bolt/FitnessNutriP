import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserData {
  weight?: number;
  height?: number;
  age?: number;
  goal?: string;
  calories_target?: string;
  gender?: string;
  activity_level?: string;
  training_preference?: string;
  meal_times?: string;
  chocolate_preference?: string;
}

interface MealSelections {
  breakfast_items?: string[];
  lunch_items?: string[];
  snack_items?: string[];
  dinner_items?: string[];
}

function PromoSection() {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mealSelections, setMealSelections] = useState<MealSelections | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let checkInterval: NodeJS.Timeout;

    const setupSubscriptions = async () => {
      try {
        const registrationSubscription = supabase
          .channel('registration-changes')
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'registrations',
              filter: `user_id=eq.${(await supabase.auth.getUser()).data.user?.id}`
            },
            () => {
              if (mounted) {
                loadAndValidateData();
              }
            }
          )
          .subscribe();

        const mealSelectionsSubscription = supabase
          .channel('meal-selections-changes')
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'meal_selections',
              filter: `user_id=eq.${(await supabase.auth.getUser()).data.user?.id}`
            },
            () => {
              if (mounted) {
                loadAndValidateData();
              }
            }
          )
          .subscribe();

        await loadAndValidateData();

        checkInterval = setInterval(() => {
          if (mounted) {
            loadAndValidateData();
          }
        }, 2000);

        return { registrationSubscription, mealSelectionsSubscription };
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        return null;
      }
    };

    let subscriptions: { 
      registrationSubscription: ReturnType<typeof supabase.channel>;
      mealSelectionsSubscription: ReturnType<typeof supabase.channel>;
    } | null = null;

    setupSubscriptions().then(subs => {
      subscriptions = subs;
    });

    return () => {
      mounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (subscriptions) {
        supabase.removeChannel(subscriptions.registrationSubscription);
        supabase.removeChannel(subscriptions.mealSelectionsSubscription);
      }
    };
  }, []);

  const validateForm = (registration: UserData | null, meals: MealSelections | null) => {
    const missingFields: string[] = [];
    const invalidMeals: string[] = [];
    const REQUIRED_MEAL_ITEMS = 6;

    if (!registration?.weight || registration.weight <= 0) 
      missingFields.push('Peso (deve ser maior que 0)');
    if (!registration?.height || registration.height <= 0) 
      missingFields.push('Altura (deve ser maior que 0)');
    if (!registration?.age || registration.age <= 0) 
      missingFields.push('Idade (deve ser maior que 0)');
    if (!registration?.goal) 
      missingFields.push('Objetivo');
    if (!registration?.calories_target) 
      missingFields.push('Meta Calórica');
    if (!registration?.gender) 
      missingFields.push('Gênero');
    if (!registration?.activity_level) 
      missingFields.push('Nível de Atividade');
    if (!registration?.training_preference) 
      missingFields.push('Preferência de Treino');
    if (!registration?.meal_times) 
      missingFields.push('Horários das Refeições');
    if (!registration?.chocolate_preference) 
      missingFields.push('Preferência de Chocolate');

    const validateMealItems = (items: string[] | undefined, mealName: string) => {
      if (!items || items.length === 0) {
        invalidMeals.push(`${mealName} (nenhum item selecionado)`);
      } else if (items.length < REQUIRED_MEAL_ITEMS) {
        invalidMeals.push(`${mealName} (mínimo ${REQUIRED_MEAL_ITEMS} itens, selecionados ${items.length})`);
      }
    };

    validateMealItems(meals?.breakfast_items, 'Café da Manhã');
    validateMealItems(meals?.lunch_items, 'Almoço');
    validateMealItems(meals?.snack_items, 'Lanche');
    validateMealItems(meals?.dinner_items, 'Jantar');

    return {
      isValid: missingFields.length === 0 && invalidMeals.length === 0,
      missingFields,
      invalidMeals
    };
  };

  const loadAndValidateData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsFormValid(false);
        setValidationMessage('Você precisa estar logado para continuar');
        setUserData(null);
        setMealSelections(null);
        setIsLoading(false);
        return;
      }

      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (registrationError) {
        throw new Error(`Erro ao carregar dados de registro: ${registrationError.message}`);
      }

      const { data: meals, error: mealsError } = await supabase
        .from('meal_selections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (mealsError) {
        throw new Error(`Erro ao carregar seleções de refeições: ${mealsError.message}`);
      }

      setUserData(registration);
      setMealSelections(meals);
      
      const validation = validateForm(registration, meals);
      setIsFormValid(validation.isValid);
      
      if (!validation.isValid) {
        let message = '';
        
        if (validation.missingFields.length > 0) {
          message = `Campos Incompletos:\n${validation.missingFields.map(field => `• ${field}`).join('\n')}`;
        }
        
        if (validation.invalidMeals.length > 0) {
          message = message ? 
            `${message}\n\nRefeições Incompletas:\n${validation.invalidMeals.map(meal => `• ${meal}`).join('\n')}` :
            `Refeições Incompletas:\n${validation.invalidMeals.map(meal => `• ${meal}`).join('\n')}`;
        }
        
        setValidationMessage(message);
      } else {
        setValidationMessage('');
      }
      
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in loadAndValidateData:', error.message);
        setIsFormValid(false);
        setValidationMessage(`Erro ao carregar dados: ${error.message}`);
        setUserData(null);
        setMealSelections(null);
        setIsLoading(false);
      }
    }
  };

  const handleButtonClick = () => {
    if (!isFormValid) {
      toast.error(validationMessage || 'Por favor, complete todos os campos necessários');
      return;
    }
    navigate('/plans');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full transform -translate-x-24 translate-y-24"></div>

        <div className="relative text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Menos que um lanche, mais que um investimento!
          </h2>
          <p className="text-2xl text-white/90 font-medium">
            Transforme sua alimentação por apenas <span className="text-yellow-300 font-bold">R$9,90</span>!
          </p>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <div className="flex items-start space-x-4 p-6 bg-emerald-50 rounded-xl">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-2">Pagamento Único</h3>
              <p className="text-emerald-600">Sem mensalidades ou cobranças recorrentes</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 bg-emerald-50 rounded-xl">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-2">Acesso Imediato</h3>
              <p className="text-emerald-600">Receba seu plano em até 5 minutos</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✨</span>
              </div>
            </div>
            <p className="text-yellow-800 font-semibold text-lg">
              Satisfação garantida ou seu dinheiro de volta!
            </p>
          </div>

          <button
            onClick={handleButtonClick}
            disabled={!isFormValid || isLoading}
            className={`w-full py-6 px-8 text-white text-xl font-bold rounded-xl
                     transition-all duration-300 transform hover:scale-[1.02] 
                     shadow-lg hover:shadow-xl active:scale-100
                     ${isFormValid && !isLoading
                       ? 'bg-yellow-500 hover:bg-yellow-600' 
                       : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {isLoading ? 'CARREGANDO...' : 'QUERO MINHA DIETA PERSONALIZADA!'}
          </button>
          
          {!isFormValid && validationMessage && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-600 text-sm whitespace-pre-line">
                {validationMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromoSection;