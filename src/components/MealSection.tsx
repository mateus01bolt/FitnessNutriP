import React, { useState, useEffect } from 'react';
import { CheckCircle2, Trash2, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface MealSectionProps {
  title: string;
  options: string[][];
}

function MealSection({ title, options }: MealSectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get gradient based on meal type
  const getGradient = () => {
    switch (title) {
      case 'Café da manhã ☕':
        return 'from-emerald-500 to-green-400';
      case 'Almoço 🍽️':
        return 'from-green-500 to-emerald-400';
      case 'Janta 🍽️':
        return 'from-emerald-400 to-green-500';
      case 'Lanche da Manhã e Tarde 🥪':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-emerald-500 to-green-400';
    }
  };

  // Get section icon based on meal type
  const getSectionIcon = () => {
    switch (title) {
      case 'Café da manhã ☕':
        return <Coffee className="h-6 w-6 text-white" />;
      case 'Almoço 🍽️':
        return <Sun className="h-6 w-6 text-white" />;
      case 'Janta 🍽️':
        return <Moon className="h-6 w-6 text-white" />;
      case 'Lanche da Manhã e Tarde 🥪':
        return <Cookie className="h-6 w-6 text-white" />;
      default:
        return <Coffee className="h-6 w-6 text-white" />;
    }
  };

  // Get Twemoji icon URL based on food name
  const getTwemojiIcon = (foodName: string) => {
    const name = foodName.toLowerCase();
    let iconCode = '';

    // Updated mapping of food names to Twemoji icon codes
    if (name.includes('tapioca + frango')) iconCode = '1f95e';      // 🥞
    else if (name.includes('crepioca + queijo')) iconCode = '1f9c0'; // 🧀
    else if (name.includes('fruta')) iconCode = '1f34f';            // 🍏
    else if (name.includes('iogurte')) iconCode = '1f95b';          // 🥛
    else if (name.includes('café + leite')) iconCode = '2615';      // ☕
    else if (name.includes('café')) iconCode = '2615';              // ☕
    else if (name.includes('pão de queijo')) iconCode = '1f9c0';    // 🧀 Updated to cheese emoji
    else if (name.includes('pão + ovo')) iconCode = '1f373';        // 🍳
    else if (name.includes('pão + queijo')) iconCode = '1f35e';     // 🍞
    else if (name.includes('pão + presunto')) iconCode = '1f96a';   // 🥪
    else if (name.includes('sanduíche de frango')) iconCode = '1f96a'; // 🥪
    else if (name.includes('sanduíche de peru')) iconCode = '1f96a';   // 🥪
    else if (name.includes('frango')) iconCode = '1f357';           // 🍗
    else if (name.includes('patinho') || name.includes('alcatra')) iconCode = '1f969'; // 🥩
    else if (name.includes('carne moída')) iconCode = '1f9c6';      // 🧆
    else if (name.includes('mandioca')) iconCode = '1f954';         // 🥔
    else if (name.includes('porco')) iconCode = '1f416';            // 🐖
    else if (name.includes('batata-doce')) iconCode = '1f360';      // 🍠
    else if (name.includes('batata')) iconCode = '1f954';           // 🥔
    else if (name.includes('tilápia')) iconCode = '1f41f';          // 🐟
    else if (name.includes('merluza')) iconCode = '1f41f';          // 🐟
    else if (name.includes('salmão')) iconCode = '1f41f';          // 🐟
    else if (name.includes('arroz')) iconCode = '1f35a';            // 🍚
    else if (name.includes('feijão')) iconCode = '1f372';           // 🍲
    else if (name.includes('whey')) iconCode = '1f964';             // 🥤
    else if (name.includes('cuscuz')) iconCode = '1f35a';           // 🍚
    else if (name.includes('leite')) iconCode = '1f95b';            // 🥛
    else if (name.includes('rap10')) iconCode = '1f32f';            // 🌯
    else if (name.includes('ovo')) iconCode = '1f95a';              // 🥚
    else if (name.includes('inhame')) iconCode = '1f360';           // 🍠
    else if (name.includes('salada')) iconCode = '1f957';           // 🥗
    else if (name.includes('suco')) iconCode = '1f964';             // 🥤
    else if (name.includes('macarrão')) iconCode = '1f35d';         // 🍝
    else iconCode = '1f374';                                        // 🍽️ Default: fork and knife

    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${iconCode}.svg`;
  };

  // Add a new component for handling image loading
  const FoodIcon = ({ name }: { name: string }) => {
    const [error, setError] = useState(false);
    const iconUrl = getTwemojiIcon(name);

    if (error) {
      return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-xs text-gray-400">🍽️</span>
      </div>;
    }

    return (
      <img 
        src={iconUrl}
        alt={name}
        className="w-8 h-8"
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  };

  // Format food name for display
  const formatFoodName = (foodName: string) => {
    // Remove emoji if present
    const nameWithoutEmoji = foodName.split(' ').filter(word => !word.match(/[\u{1F300}-\u{1F9FF}]/u)).join(' ');
    
    // Fix specific cases
    if (nameWithoutEmoji.includes('Moída Carne')) return 'Carne Moída';
    
    return nameWithoutEmoji;
  };

  useEffect(() => {
    loadUserSelections();
  }, [title]);

  const loadUserSelections = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meal_selections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.message !== 'No rows found') {
        throw error;
      }

      if (data) {
        let selections: string[] = [];
        switch (title) {
          case 'Café da manhã ☕':
            selections = data.breakfast_items || [];
            break;
          case 'Almoço 🍽️':
            selections = data.lunch_items || [];
            break;
          case 'Lanche da Manhã e Tarde 🥪':
            selections = data.snack_items || [];
            break;
          case 'Janta 🍽️':
            selections = data.dinner_items || [];
            break;
        }
        setSelectedOptions(selections);
      }
    } catch (error) {
      console.error('Error loading selections:', error);
      toast.error('Erro ao carregar suas seleções');
    } finally {
      setLoading(false);
    }
  };

  const saveSelections = async (newSelections: string[]) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para salvar suas escolhas');
        return;
      }

      let updateField: string;
      switch (title) {
        case 'Café da manhã ☕':
          updateField = 'breakfast_items';
          break;
        case 'Almoço 🍽️':
          updateField = 'lunch_items';
          break;
        case 'Lanche da Manhã e Tarde 🥪':
          updateField = 'snack_items';
          break;
        case 'Janta 🍽️':
          updateField = 'dinner_items';
          break;
        default:
          throw new Error('Tipo de refeição inválido');
      }

      const { error } = await supabase
        .from('meal_selections')
        .upsert({
          user_id: user.id,
          [updateField]: newSelections
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      setSelectedOptions(newSelections);
      toast.success('Seleções salvas com sucesso!');
    } catch (error) {
      console.error('Error saving selections:', error);
      toast.error('Erro ao salvar suas escolhas');
    } finally {
      setSaving(false);
    }
  };

  const toggleOption = (option: string) => {
    if (saving) return;

    const newSelections = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    
    saveSelections(newSelections);
  };

  const selectAll = () => {
    if (saving) return;
    const allOptions = options.flat();
    saveSelections(allOptions);
  };

  const clearAll = () => {
    if (saving) return;
    saveSelections([]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className={`bg-gradient-to-r ${getGradient()} px-6 py-4 rounded-t-lg -mx-6 -mt-6 mb-6`}>
          <div className="flex items-center justify-center space-x-3">
            {getSectionIcon()}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${getGradient()} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSectionIcon()}
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              disabled={saving}
              className="px-4 py-2 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Selecionar Todos</span>
            </button>
            <button
              onClick={clearAll}
              disabled={saving}
              className="px-4 py-2 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {options.flat().map((option, index) => {
            const formattedName = formatFoodName(option);
            return (
              <button
                key={index}
                onClick={() => toggleOption(option)}
                disabled={saving}
                className={`relative p-4 rounded-lg transition-all duration-200 text-center group
                  ${selectedOptions.includes(option)
                    ? 'bg-green-50 border-2 border-green-500 shadow-md scale-[1.02]'
                    : 'bg-white border-2 border-gray-100 hover:border-green-200 hover:shadow-md'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectedOptions.includes(option) && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
                <div className="flex flex-col items-center justify-center min-h-[100px] space-y-3">
                  <FoodIcon name={formattedName} />
                  <span className="text-sm font-medium text-gray-700 line-clamp-2">
                    {formattedName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {saving && (
        <div className="px-6 pb-4 text-center text-sm text-gray-500">
          Salvando alterações...
        </div>
      )}
    </div>
  );
}

export default MealSection;