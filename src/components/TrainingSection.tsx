import React, { useState, useEffect } from 'react';
import { Dumbbell, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

function TrainingSection() {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedTraining, setSelectedTraining] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUserSelections();
  }, []);

  const loadUserSelections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: registration, error } = await supabase
        .from('registrations')
        .select('activity_level, training_preference')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.message !== 'No rows found') {
        throw error;
      }

      if (registration) {
        setSelectedActivity(registration.activity_level || '');
        setSelectedTraining(registration.training_preference || '');
      }
    } catch (error) {
      console.error('Error loading training preferences:', error);
      toast.error('Erro ao carregar suas preferências de treino');
    }
  };

  const saveSelection = async (field: string, value: string) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      if (saving) return;

      try {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Você precisa estar logado para salvar suas escolhas');
          return;
        }

        const updateData = {
          user_id: user.id,
          [field]: value,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('registrations')
          .upsert(updateData, {
            onConflict: 'user_id'
          });

        if (error) throw error;

        if (field === 'activity_level') {
          setSelectedActivity(value);
          toast.success('Nível de atividade salvo com sucesso');
        } else {
          setSelectedTraining(value);
          toast.success('Preferência de treino salva com sucesso');
        }
      } catch (error) {
        console.error('Error saving selection:', error);
        toast.error('Erro ao salvar sua escolha');
        loadUserSelections();
      } finally {
        setSaving(false);
      }
    }, 500);

    setSaveTimeout(timeout);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 py-6 px-6">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Dumbbell className="h-6 w-6 text-white" />
          <h2 className="text-2xl font-bold text-white">Treinos e Atividades</h2>
        </div>
        <p className="text-emerald-50 text-center">
          Personalize seu nível de atividade e preferências de treino
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Activity className="w-4 h-4 mr-2 text-emerald-600" />
              Nível de Atividade Física
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => saveSelection('activity_level', e.target.value)}
              disabled={saving}
              className="input-primary"
            >
              <option value="">Selecione seu nível de atividade</option>
              <option>Sedentário (pouca ou nenhuma atividade física)</option>
              <option>Levemente ativo (exercícios 1 a 3 vezes por semana)</option>
              <option>Moderadamente ativo (exercícios de 3 a 5 vezes por semana)</option>
              <option>Altamente ativo (exercícios de 5 a 7 dias por semana)</option>
              <option>Extremamente ativo (exercícios todos os dias e faz trabalho braçal)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Dumbbell className="w-4 h-4 mr-2 text-emerald-600" />
              Preferência de Treino
            </label>
            <select
              value={selectedTraining}
              onChange={(e) => saveSelection('training_preference', e.target.value)}
              disabled={saving}
              className="input-primary"
            >
              <option value="">Deseja incluir treino no seu plano?</option>
              <option>Sim, Treino na academia</option>
              <option>Sim, Treino em casa</option>
              <option>Não</option>
            </select>
          </div>
        </div>

        {saving && (
          <div className="text-sm text-gray-500 text-center">
            Salvando alterações...
          </div>
        )}

        <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-emerald-700 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Dicas para Melhores Resultados
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0">1</span>
              <span>Escolha um nível de atividade que reflita sua rotina atual, não a desejada</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0">2</span>
              <span>Considere sua experiência prévia com exercícios ao escolher o tipo de treino</span>
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs mr-2 flex-shrink-0">3</span>
              <span>Lembre-se que consistência é mais importante que intensidade</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TrainingSection;