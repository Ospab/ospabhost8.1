import React from 'react';

interface TicketsProps {
  tickets: unknown[];
}

const Tickets: React.FC<TicketsProps> = ({ tickets }) => {
  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Тикеты поддержки</h2>
      {tickets.length === 0 ? (
        <p className="text-lg text-gray-500">У вас пока нет открытых тикетов.</p>
      ) : (
        <p className="text-lg text-gray-500">Список ваших тикетов будет здесь...</p>
      )}
    </div>
  );
};

export default Tickets;