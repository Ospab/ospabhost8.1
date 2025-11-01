import { Link } from 'react-router-dom';

import type { UserData, Ticket, Server } from './types';

interface SummaryProps {
  userData: UserData;
}

const Summary = ({ userData }: SummaryProps) => {
  // Фильтрация открытых тикетов и активных серверов
  const openTickets = Array.isArray(userData.tickets)
    ? userData.tickets.filter((t: Ticket) => t.status !== 'closed')
    : [];
  const activeServers = Array.isArray(userData.servers)
    ? userData.servers.filter((s: Server) => s.status === 'active')
    : [];

  return (
    <div className="p-4 lg:p-8 bg-white rounded-2xl lg:rounded-3xl shadow-xl">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-6">Сводка по аккаунту</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-100 p-4 lg:p-6 rounded-xl lg:rounded-2xl flex flex-col items-start">
          <p className="text-lg lg:text-xl font-medium text-gray-700">Баланс:</p>
          <p className="text-3xl lg:text-4xl font-extrabold text-ospab-primary mt-2 break-words">₽ {userData.balance?.toFixed ? userData.balance.toFixed(2) : Number(userData.balance).toFixed(2)}</p>
          <Link to="/dashboard/billing" className="text-sm text-gray-500 hover:underline mt-2">Пополнить баланс →</Link>
        </div>
        <div className="bg-gray-100 p-4 lg:p-6 rounded-xl lg:rounded-2xl flex flex-col items-start">
          <p className="text-lg lg:text-xl font-medium text-gray-700">Активные серверы:</p>
          <p className="text-3xl lg:text-4xl font-extrabold text-gray-800 mt-2">{activeServers.length}</p>
          <Link to="/dashboard/servers" className="text-sm text-gray-500 hover:underline mt-2">Управлять →</Link>
        </div>
        <div className="bg-gray-100 p-4 lg:p-6 rounded-xl lg:rounded-2xl flex flex-col items-start md:col-span-2 lg:col-span-1">
          <p className="text-lg lg:text-xl font-medium text-gray-700">Открытые тикеты:</p>
          <p className="text-3xl lg:text-4xl font-extrabold text-gray-800 mt-2">{openTickets.length}</p>
          <Link to="/dashboard/tickets" className="text-sm text-gray-500 hover:underline mt-2">Служба поддержки →</Link>
        </div>
      </div>
      <p className="text-base lg:text-lg text-gray-500">
        Добро пожаловать в ваш личный кабинет, {userData.user?.username || 'пользователь'}! Здесь вы можете быстро получить доступ к основным разделам.
      </p>
    </div>
  );
};

export default Summary;