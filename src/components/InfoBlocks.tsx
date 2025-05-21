import React from 'react';
import { Edit3, Download, Clock, HelpCircle } from 'lucide-react';

function InfoBlocks() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 py-6 px-6">
          <h2 className="text-2xl font-bold text-white text-center">Como Funciona</h2>
          <p className="text-emerald-50 text-center mt-2">
            Guia passo a passo para seu plano personalizado
          </p>
        </div>

        <div className="p-8 grid gap-6 md:grid-cols-3">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Edit3 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-2">Como Montar?</h3>
              <p className="text-gray-600 text-sm">
                Preencha suas informações como peso, altura, idade e preferências alimentares, 
                então clique em "Montar Minha Dieta" para gerar seu plano personalizado.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-2">Como Receber?</h3>
              <p className="text-gray-600 text-sm">
                Após o pagamento, aguarde até 5 minutos para que sua dieta seja gerada. 
                Você poderá visualizá-la online ou baixá-la em PDF para acesso offline.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-2">Benefícios</h3>
              <p className="text-gray-600 text-sm">
                Pagamento único via PIX ou cartão, sem assinatura recorrente. 
                Inclui consultas semanais com nutricionista e ajustes ilimitados.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-700">Perguntas Frequentes</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="font-medium text-emerald-700 mb-2">Posso alterar minha dieta depois?</p>
              <p className="text-sm text-gray-600">
                Sim! Você pode solicitar ajustes a qualquer momento através do suporte.
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="font-medium text-emerald-700 mb-2">Por quanto tempo posso usar?</p>
              <p className="text-sm text-gray-600">
                O acesso é vitalício! Você pode usar e ajustar seu plano sempre que precisar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoBlocks;