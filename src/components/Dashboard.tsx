import React from 'react';
import Header from './Header';
import MeasurementsForm from './MeasurementsForm';
import MealSection from './MealSection';
import TrainingSection from './TrainingSection';
import DietAdditions from './DietAdditions';
import PromoSection from './PromoSection';
import InfoBlocks from './InfoBlocks';

function Dashboard() {
  const scrollToMeasurements = () => {
    const measurementsSection = document.getElementById('measurements-section');
    if (measurementsSection) {
      measurementsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7]">
      <Header />
      <div className="container mx-auto px-4 space-y-8 mt-8 pb-12">
        {/* Hero Section */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-emerald-400/90"></div>
          <div className="relative px-6 py-16 sm:px-12 sm:py-24">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Simples, rápido e saudável: monte sua dieta já!
              </h1>
              <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto">
                Transforme sua alimentação com um plano personalizado em minutos. 
                Sem complicação, sem espera.
              </p>
              <button
                onClick={scrollToMeasurements}
                className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Comece Agora
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-200 rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-200 rounded-full opacity-20"></div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">Rápido e Prático</h3>
            <p className="text-gray-600">
              Monte sua dieta personalizada em poucos minutos, sem complicação
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">Personalizado</h3>
            <p className="text-gray-600">
              Plano adaptado aos seus objetivos e preferências alimentares
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💪</span>
            </div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">Resultados Reais</h3>
            <p className="text-gray-600">
              Acompanhamento e suporte para garantir seu sucesso
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div id="measurements-section">
          <MeasurementsForm />
        </div>
        
        <div className="space-y-8">
          <MealSection
            title="Café da manhã ☕"
            options={[
              ["Tapioca + Frango 🥙", "Crepioca + Queijo 🥞", "Fruta 🍎"],
              ["Iogurte 🥛", "Café ☕", "Pão de Queijo 🧀"],
              ["Pão + Ovo 🥖", "Café + Leite ☕", "Cuscuz 🍚"],
              ["Pão + Queijo 🍞", "Pão + Presunto 🥓"]
            ]}
          />
          <MealSection
            title="Almoço 🍽️"
            options={[
              ["Frango 🍗", "Patinho 🥩", "Alcatra 🥩"],
              ["Carne Moída 🥩", "Mandioca 🥔", "Carne-Porco 🐖"],
              ["Batata-Doce 🍠", "Tilápia 🐟", "Merluza 🐟"],
              ["Salmão 🐟", "Arroz 🍚", "Feijão 🍲"],
              ["Salada 🥗", "Macarrão 🍝", "Ovo 🥚"],
              ["Inhame 🍠", "Cuscuz 🍚", "Batata 🥔"]
            ]}
          />
          <MealSection
            title="Lanche da Manhã e Tarde 🥪"
            options={[
              ["Whey 🥛", "Fruta 🍍", "Cuscuz 🍚"],
              ["Pão + Ovo 🥖", "Tapioca + Frango 🥙", "Crepioca + Queijo 🥞"],
              ["Leite 🥛", "Rap10 + Frango 🌯", "Ovo 🥚"],
              ["Sanduíche Frango 🥪", "Sanduíche de Peru 🥪", "Suco 🥤"]
            ]}
          />
          <MealSection
            title="Janta 🍽️"
            options={[
              ["Frango 🍗", "Patinho 🥩", "Alcatra 🥩"],
              ["Carne Moída 🥩", "Mandioca 🥔", "Carne-Porco 🐖"],
              ["Batata-Doce 🍠", "Tilápia 🐟", "Merluza 🐟"],
              ["Suco 🥤", "Arroz 🍚", "Feijão 🍲"],
              ["Salada 🥗", "Macarrão 🍝", "Ovo 🥚"],
              ["Inhame 🍠", "Cuscuz 🍚", "Batata 🥔"]
            ]}
          />
        </div>

        <TrainingSection />
        <DietAdditions />
        <PromoSection />
      </div>
    </div>
  );
}

export default Dashboard;