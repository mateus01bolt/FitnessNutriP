import React, { useState, useEffect } from 'react';
import { Clock, Coffee } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

function DietAdditions() {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedChocolate, setSelectedChocolate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserSelections = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: registration } = await supabase
          .from('registrations')
          .select('meal_times, chocolate_preference')
          .eq('user_id', user.id)
          .maybeSingle();

        if (registration) {
          setSelectedTime(registration.meal_times || '');
          setSelectedChocolate(registration.chocolate_preference || '');
        }
      } catch (error) {
        console.error('Error loading diet preferences:', error);
      }
    };

    loadUserSelections();
  }, []);

  const saveSelection = async (field: string, value: string) => {
    if (saving) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para salvar suas escolhas');
        return;
      }

      const { data: existingReg } = await supabase
        .from('registrations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;

      if (existingReg) {
        const { error: updateError } = await supabase
          .from('registrations')
          .update({
            [field]: value,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('registrations')
          .insert([{
            user_id: user.id,
            [field]: value
          }]);
          
        error = insertError;
      }

      if (error) throw error;

      if (field === 'meal_times') {
        setSelectedTime(value);
        toast.success('Horários salvos com sucesso!');
      } else {
        setSelectedChocolate(value);
        toast.success('Preferência de chocolate salva com sucesso!');
      }
    } catch (error) {
      console.error('Error saving selection:', error);
      toast.error('Erro ao salvar sua escolha');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 py-6 px-6">
        <h2 className="text-2xl font-bold text-white text-center">Adicionais na Dieta</h2>
        <p className="text-emerald-50 text-center mt-2">
          Personalize horários e extras do seu plano
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-emerald-600" />
              Horários das Refeições
            </label>
            <select
              value={selectedTime}
              onChange={(e) => saveSelection('meal_times', e.target.value)}
              disabled={saving}
              className="input-primary"
            >
              <option value="">Escolha os horários das refeições</option>
              <option>Tenho meu próprio horário</option>
              <option>05:30, 08:30, 12:00, 15:00, 19:00</option>
              <option>06:00, 09:00, 12:00, 15:00, 19:00</option>
              <option>06:30, 09:30, 13:00, 16:00, 20:00</option>
              <option>07:00, 10:00, 12:30, 15:30, 19:30</option>
              <option>07:30, 10:30, 12:00, 15:00, 19:00</option>
              <option>08:00, 11:00, 13:00, 16:00, 20:30</option>
              <option>09:00, 11:00, 13:00, 16:00, 21:00</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Coffee className="w-4 h-4 mr-2 text-emerald-600" />
              Chocolate na Dieta
            </label>
            <select
              value={selectedChocolate}
              onChange={(e) => saveSelection('chocolate_preference', e.target.value)}
              disabled={saving}
              className="input-primary"
            >
              <option value="">Deseja incluir chocolate no plano?</option>
              <option>Não, obrigado</option>
              <option>Sim, um Bis</option>
              <option>Sim, um Prestígio</option>
              <option>Sim, um Trento</option>
              <option>Sim, um Baton</option>
              <option>Sim, um Chokito</option>
              <option>Sim, um Sonho de Valsa</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-emerald-700">Dicas para Horários</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              <span>Mantenha um intervalo de 2-3 horas entre as refeições</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              <span>Evite refeições pesadas próximo ao horário de dormir</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              <span>Escolha horários que se adequem à sua rotina diária</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DietAdditions;