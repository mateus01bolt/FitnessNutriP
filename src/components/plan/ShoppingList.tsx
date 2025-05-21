import React from 'react';

interface UserRegistration {
  weight: number;
  height: number;
  age: number;
  goal: string;
  calories_target: string;
  gender: 'male' | 'female';
}

interface ShoppingListProps {
  userRegistration: UserRegistration;
}

interface Category {
  name: string;
  items: Array<{
    name: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

function ShoppingList({ userRegistration }: ShoppingListProps) {
  const generateCategories = (): Category[] => {
    const baseCategories: Category[] = [
      {
        name: 'Proteínas',
        items: [
          { name: 'Peito de Frango', priority: 'high' },
          { name: 'Ovos', priority: 'high' },
          { name: 'Whey Protein', priority: 'high' },
          { name: 'Carne Vermelha Magra', priority: 'medium' },
          { name: 'Atum em Água', priority: 'medium' },
          { name: 'Tilápia', priority: 'medium' }
        ]
      },
      {
        name: 'Carboidratos',
        items: [
          { name: 'Arroz Integral', priority: 'high' },
          { name: 'Batata Doce', priority: 'high' },
          { name: 'Aveia', priority: 'high' },
          { name: 'Massa Integral', priority: 'medium' },
          { name: 'Pão Integral', priority: 'medium' },
          { name: 'Quinoa', priority: 'low' }
        ]
      },
      {
        name: 'Gorduras Saudáveis',
        items: [
          { name: 'Azeite de Oliva Extra Virgem', priority: 'high' },
          { name: 'Abacate', priority: 'high' },
          { name: 'Castanha do Pará', priority: 'high' },
          { name: 'Amêndoas', priority: 'medium' },
          { name: 'Chia', priority: 'medium' },
          { name: 'Linhaça', priority: 'medium' }
        ]
      },
      {
        name: 'Vegetais e Frutas',
        items: [
          { name: 'Brócolis', priority: 'high' },
          { name: 'Espinafre', priority: 'high' },
          { name: 'Banana', priority: 'high' },
          { name: 'Maçã', priority: 'medium' },
          { name: 'Cenoura', priority: 'medium' },
          { name: 'Tomate', priority: 'medium' },
          { name: 'Laranja', priority: 'medium' },
          { name: 'Limão', priority: 'low' }
        ]
      },
      {
        name: 'Temperos e Condimentos',
        items: [
          { name: 'Sal Marinho', priority: 'high' },
          { name: 'Pimenta do Reino', priority: 'high' },
          { name: 'Alho', priority: 'high' },
          { name: 'Cebola', priority: 'high' },
          { name: 'Orégano', priority: 'medium' },
          { name: 'Manjericão', priority: 'medium' },
          { name: 'Curry', priority: 'low' },
          { name: 'Açafrão', priority: 'low' }
        ]
      }
    ];

    // Adjust items based on user goal
    switch (userRegistration.goal) {
      case 'massa':
        return baseCategories.map(category => {
          if (category.name === 'Proteínas') {
            category.items = category.items.map(item => ({
              ...item,
              priority: item.name.includes('Frango') || 
                       item.name.includes('Ovos') || 
                       item.name.includes('Whey') ? 'high' : item.priority
            }));
          }
          return category;
        });

      case 'emagrecer':
        return baseCategories.map(category => {
          if (category.name === 'Vegetais e Frutas') {
            category.items = category.items.map(item => ({
              ...item,
              priority: 'high'
            }));
          }
          return category;
        });

      case 'definicao':
        return baseCategories.map(category => {
          if (category.name === 'Proteínas') {
            category.items = category.items.map(item => ({
              ...item,
              priority: item.name.includes('Frango') || item.name.includes('Atum') ? 'high' : item.priority
            }));
          }
          return category;
        });

      default:
        return baseCategories;
    }
  };

  const categories = generateCategories();

  return (
    <div className="space-y-6">
      {categories.map((category, idx) => (
        <div key={idx}>
          <h3 className="font-semibold mb-3">{category.name}</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[70%]" />
                <col className="w-[30%]" />
              </colgroup>
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-center">Prioridade</th>
                </tr>
              </thead>
              <tbody>
                {category.items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="text-sm">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-center">
                      <span className={`inline-block min-w-[80px] px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Dicas de Compras</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Priorize alimentos frescos e da estação</li>
          <li>Compare preços entre marcas</li>
          <li>Verifique as datas de validade</li>
          <li>Compre primeiro os itens de alta prioridade</li>
          {userRegistration.goal === 'massa' && (
            <li>Mantenha estoque extra de proteínas e carboidratos</li>
          )}
          {userRegistration.goal === 'emagrecer' && (
            <li>Priorize vegetais e proteínas magras</li>
          )}
          {userRegistration.goal === 'definicao' && (
            <li>Foque em alimentos com alto valor nutricional</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default ShoppingList;