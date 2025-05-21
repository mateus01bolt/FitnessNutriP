import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string;
  status: string;
  description: string;
  icon?: React.ReactNode;
  isPrintMode?: boolean;
}

function MetricsCard({ title, value, status, description, icon, isPrintMode = false }: MetricsCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 ${
      !isPrintMode && 'hover:scale-102'
    } border border-purple-100`}>
      <div className={`bg-gradient-to-br from-purple-50 via-white to-purple-50 ${isPrintMode ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center space-x-2 mb-2">
          {icon && <div className="text-[#6a1b9a]">{icon}</div>}
          <h3 className={`text-[#6a1b9a] font-medium ${isPrintMode ? 'text-sm' : 'text-base'}`}>{title}</h3>
        </div>
        <div className={`flex items-baseline space-x-2 ${isPrintMode ? 'mb-1' : 'mb-2'}`}>
          <span className={`font-bold text-[#6a1b9a] ${isPrintMode ? 'text-xl' : 'text-2xl'}`}>{value}</span>
          <span className="text-[#8e24aa] font-medium text-sm">{status}</span>
        </div>
        <p className={`text-gray-600 ${isPrintMode ? 'text-xs' : 'text-sm'}`}>{description}</p>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#6a1b9a] via-[#8e24aa] to-[#6a1b9a]"></div>
    </div>
  );
}

export default MetricsCard;