import React from 'react';

interface ServersProps {
  servers: unknown[];
}

const Servers: React.FC<ServersProps> = ({ servers }) => {
  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Серверы</h2>
      {servers.length === 0 ? (
        <p className="text-lg text-gray-500">У вас пока нет активных серверов.</p>
      ) : (
        <p className="text-lg text-gray-500">Список ваших серверов будет здесь...</p>
      )}
    </div>
  );
};

export default Servers;