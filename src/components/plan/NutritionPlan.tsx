import React, { useState } from 'react';
import { ChevronDown, Droplet, Utensils, Activity, Scale } from 'lucide-react';
import MetricsCard from './MetricsCard';

interface UserRegistration {
  weight: number;
  height: number;
  age: number;
  goal: string;
  calories_target: string;
  gender: 'male' | 'female';
  activity_level?: string;
  meal_times?: string;
  chocolate_preference?: string;
}

interface NutritionPlanProps {
  userRegistration: UserRegistration;
  isPrintMode?: boolean;
}

interface Meal {
  id: string;
  title: string;
  time: string;
  icon: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  options: {
    title: string;
    items: string[];
  }[];
}

function NutritionPlan({ userRegistration, isPrintMode = false }: NutritionPlanProps) {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const calculateBMR = () => {
    const { weight, height, age, gender } = userRegistration;
    
    // Fórmula de Harris-Benedict para BMR
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    }
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const { activity_level } = userRegistration;
    
    // Multiplicadores baseados no nível de atividade
    let activityMultiplier = 1.2; // Sedentário (padrão)
    
    if (activity_level?.includes('Levemente ativo')) {
      activityMultiplier = 1.375;
    } else if (activity_level?.includes('Moderadamente ativo')) {
      activityMultiplier = 1.55;
    } else if (activity_level?.includes('Altamente ativo')) {
      activityMultiplier = 1.725;
    } else if (activity_level?.includes('Extremamente ativo')) {
      activityMultiplier = 1.9;
    }

    return Math.round(bmr * activityMultiplier);
  };

  const calculateTargetCalories = () => {
    const tdee = calculateTDEE();
    const { goal } = userRegistration;

    switch (goal) {
      case 'emagrecer':
        return Math.round(tdee - 500); // Déficit calórico para perda de peso
      case 'massa':
        return Math.round(tdee + 500); // Superávit calórico para ganho de massa
      case 'definicao':
        return Math.round(tdee - 300); // Déficit moderado para definição
      case 'definicao_massa':
        return Math.round(tdee + 200); // Leve superávit para definição com ganho
      case 'emagrecer_massa':
        return Math.round(tdee); // Manutenção para recomposição corporal
      default:
        return tdee; // Manutenção
    }
  };

  const getMealTimes = () => {
    if (!userRegistration.meal_times || userRegistration.meal_times === 'Tenho meu próprio horário') {
      return {
        breakfast: '07:00',
        morningSnack: '10:00',
        lunch: '13:00',
        afternoonSnack: '16:00',
        dinner: '19:00'
      };
    }

    const times = userRegistration.meal_times.split(', ');
    return {
      breakfast: times[0] || '07:00',
      morningSnack: times[1] || '10:00',
      lunch: times[2] || '13:00',
      afternoonSnack: times[3] || '16:00',
      dinner: times[4] || '19:00'
    };
  };

  const generateMeals = (targetCalories: number): Meal[] => {
    const mealTimes = getMealTimes();
    const meals = [
      {
        id: 'breakfast',
        title: 'Café da Manhã',
        time: mealTimes.breakfast,
        icon: '☕',
        calories: Math.round(targetCalories * 0.25),
        protein: '20g',
        carbs: '40g',
        fat: '10g',
        options: [
          {
            title: 'Proteínas',
            items: [
              '🥚 Ovos (2 unidades)',
              '🥛 Iogurte (200ml)',
              '🧀 Queijo (2 fatias)'
            ]
          },
          {
            title: 'Carboidratos',
            items: [
              '🥖 Pão Integral (2 fatias)',
              '🥣 Aveia (4 colheres)',
              '🥞 Tapioca (2 unidades)'
            ]
          },
          {
            title: 'Complementos',
            items: [
              '🍌 Banana (1 unidade)',
              '🍯 Mel (1 colher)',
              '🥜 Amendoim (1 punhado)'
            ]
          }
        ]
      },
      {
        id: 'morning-snack',
        title: 'Lanche da Manhã',
        time: mealTimes.morningSnack,
        icon: '🥪',
        calories: Math.round(targetCalories * 0.15),
        protein: '15g',
        carbs: '30g',
        fat: '8g',
        options: [
          {
            title: 'Proteínas',
            items: [
              '🥛 Whey Protein (1 scoop)',
              '🥜 Mix de Castanhas (30g)',
              '🧀 Queijo Cottage (100g)'
            ]
          },
          {
            title: 'Carboidratos',
            items: [
              '🍎 Maçã (1 unidade)',
              '🍌 Banana (1 unidade)',
              '🥣 Granola (2 colheres)'
            ]
          },
          {
            title: 'Complementos',
            items: [
              '🍯 Mel (1 colher)',
              '🥜 Pasta de Amendoim (1 colher)',
              '🫐 Frutas Vermelhas (100g)'
            ]
          }
        ]
      },
      {
        id: 'lunch',
        title: 'Almoço',
        time: mealTimes.lunch,
        icon: '🍽️',
        calories: Math.round(targetCalories * 0.35),
        protein: '35g',
        carbs: '50g',
        fat: '15g',
        options: [
          {
            title: 'Proteínas',
            items: [
              '🍗 Frango Grelhado (150g)',
              '🥩 Carne Magra (150g)',
              '🐟 Peixe (150g)'
            ]
          },
          {
            title: 'Carboidratos',
            items: [
              '🍚 Arroz Integral (5 colheres)',
              '🥔 Batata Doce (150g)',
              '🍝 Macarrão Integral (100g)'
            ]
          },
          {
            title: 'Vegetais',
            items: [
              '🥗 Salada Verde (à vontade)',
              '🥦 Legumes Cozidos (100g)',
              '🥕 Vegetais Crus (100g)'
            ]
          }
        ]
      },
      {
        id: 'afternoon-snack',
        title: 'Lanche da Tarde',
        time: mealTimes.afternoonSnack,
        icon: '🥪',
        calories: Math.round(targetCalories * 0.15),
        protein: '15g',
        carbs: '25g',
        fat: '8g',
        options: [
          {
            title: 'Proteínas',
            items: [
              '🥛 Whey Protein (1 scoop)',
              '🥜 Mix de Castanhas (30g)',
              '🧀 Queijo (2 fatias)'
            ]
          },
          {
            title: 'Carboidratos',
            items: [
              '🍎 Fruta (1 unidade)',
              '🥨 Biscoito Integral (4 unidades)',
              '🥜 Barra de Cereal (1 unidade)'
            ]
          },
          {
            title: 'Complementos',
            items: [
              '🍯 Mel (1 colher)',
              '🥜 Pasta de Amendoim (1 colher)',
              userRegistration.chocolate_preference ? `🍫 ${userRegistration.chocolate_preference}` : '🍫 Chocolate 70% (2 quadrados)'
            ]
          }
        ]
      },
      {
        id: 'dinner',
        title: 'Jantar',
        time: mealTimes.dinner,
        icon: '🍽️',
        calories: Math.round(targetCalories * 0.25),
        protein: '30g',
        carbs: '35g',
        fat: '12g',
        options: [
          {
            title: 'Proteínas',
            items: [
              '🍗 Frango Grelhado (120g)',
              '🐟 Peixe Assado (120g)',
              '🥚 Omelete (3 ovos)'
            ]
          },
          {
            title: 'Carboidratos',
            items: [
              '🍚 Arroz Integral (3 colheres)',
              '🥔 Batata Doce (100g)',
              '🥗 Quinoa (4 colheres)'
            ]
          },
          {
            title: 'Vegetais',
            items: [
              '🥦 Brócolis (100g)',
              '🥕 Legumes Cozidos (100g)',
              '🥗 Salada Verde (à vontade)'
            ]
          }
        ]
      }
    ];

    // Ajustar macronutrientes baseado no objetivo
    return meals.map(meal => {
      let proteinMultiplier = 1;
      let carbsMultiplier = 1;
      let fatMultiplier = 1;

      switch (userRegistration.goal) {
        case 'massa':
          proteinMultiplier = 1.3;
          carbsMultiplier = 1.2;
          break;
        case 'emagrecer':
          carbsMultiplier = 0.8;
          fatMultiplier = 0.8;
          break;
        case 'definicao':
          proteinMultiplier = 1.2;
          carbsMultiplier = 0.9;
          fatMultiplier = 0.9;
          break;
      }

      const baseProtein = parseInt(meal.protein);
      const baseCarbs = parseInt(meal.carbs);
      const baseFat = parseInt(meal.fat);

      return {
        ...meal,
        protein: `${Math.round(baseProtein * proteinMultiplier)}g`,
        carbs: `${Math.round(baseCarbs * carbsMultiplier)}g`,
        fat: `${Math.round(baseFat * fatMultiplier)}g`
      };
    });
  };

  const tdee = calculateTDEE();
  const targetCalories = calculateTargetCalories();
  const meals = generateMeals(targetCalories);

  return (
    <div className={`space-y-${isPrintMode ? '4' : '6'}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Calorias Diárias"
          value={`${targetCalories}`}
          status="kcal"
          description="Meta calórica diária baseada no seu objetivo"
          icon={<Scale className="h-5 w-5" />}
          isPrintMode={isPrintMode}
        />
        <MetricsCard
          title="Gasto Energético"
          value={`${tdee}`}
          status="kcal"
          description="Seu gasto energético total diário"
          icon={<Activity className="h-5 w-5" />}
          isPrintMode={isPrintMode}
        />
        <MetricsCard
          title="Água"
          value="2.5"
          status="litros"
          description="Consumo diário recomendado de água"
          icon={<Droplet className="h-5 w-5" />}
          isPrintMode={isPrintMode}
        />
        <MetricsCard
          title="Refeições"
          value="5"
          status="por dia"
          description="Distribuição ideal para seus objetivos"
          icon={<Utensils className="h-5 w-5" />}
          isPrintMode={isPrintMode}
        />
      </div>

      <div className={`space-y-${isPrintMode ? '2' : '4'}`}>
        {meals.map((meal) => (
          <div key={meal.id} className="meal-card bg-white rounded-lg shadow-md overflow-hidden border border-purple-100">
            <button
              onClick={() => !isPrintMode && setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
              className={`w-full ${isPrintMode ? 'px-4 py-3' : 'px-6 py-4'} flex items-center justify-between bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-purple-50 transition-all duration-300 ${isPrintMode ? 'cursor-default' : ''}`}
              aria-expanded={isPrintMode || expandedMeal === meal.id}
            >
              <div className="flex items-center space-x-4">
                <div className={`${isPrintMode ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-purple-100 flex items-center justify-center`}>
                  <span className={`${isPrintMode ? 'text-xl' : 'text-2xl'}`}>{meal.icon}</span>
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold text-[#6a1b9a] ${isPrintMode ? 'text-sm' : 'text-base'}`}>{meal.title}</h3>
                  <p className={`text-purple-600 ${isPrintMode ? 'text-xs' : 'text-sm'}`}>{meal.time}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="flex items-baseline space-x-1">
                    <p className={`font-bold text-[#6a1b9a] ${isPrintMode ? 'text-lg' : 'text-xl'}`}>
                      {meal.calories}
                    </p>
                    <span className={`text-purple-600 ${isPrintMode ? 'text-xs' : 'text-sm'}`}>kcal</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${isPrintMode ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">P: {meal.protein}</span>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">C: {meal.carbs}</span>
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">G: {meal.fat}</span>
                  </div>
                </div>
                {!isPrintMode && (
                  <ChevronDown className={`h-5 w-5 text-purple-400 transform transition-transform ${
                    expandedMeal === meal.id ? 'rotate-180' : ''
                  }`} />
                )}
              </div>
            </button>

            {(isPrintMode || expandedMeal === meal.id) && (
              <div className="border-t border-purple-100">
                <div className={`grid grid-cols-3 gap-4 ${isPrintMode ? 'p-3' : 'p-6'} bg-gradient-to-br from-purple-50 via-white to-purple-50`}>
                  {meal.options.map((option, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                      <h4 className={`font-medium text-[#6a1b9a] text-center ${isPrintMode ? 'mb-2 text-sm' : 'mb-3'}`}>
                        {option.title}
                      </h4>
                      <ul className={`space-y-${isPrintMode ? '1' : '2'}`}>
                        {option.items.map((item, itemIdx) => (
                          <li key={itemIdx} className={`text-center text-gray-600 ${isPrintMode ? 'text-xs' : 'text-sm'}`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NutritionPlan;