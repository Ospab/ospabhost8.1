const notificationsList = [
	{
		title: "Создание сервера",
		description: "Вы получите уведомление при успешном создании нового сервера или контейнера.",
	},
	{
		title: "Списание оплаты за месяц",
		description: "Напоминание о предстоящем списании средств за продление тарифа.",
	},
	{
		title: "Истечение срока действия тарифа",
		description: "Уведомление о необходимости продлить тариф, чтобы избежать отключения.",
	},
	{
		title: "Ответ на тикет",
		description: "Вы получите уведомление, когда оператор ответит на ваш тикет поддержки.",
	},
	{
		title: "Поступление оплаты",
		description: "Уведомление о зачислении средств на ваш баланс.",
	},
];

const Notifications = () => {
	return (
		<div className="p-8 bg-white rounded-3xl shadow-xl max-w-xl mx-auto mt-6">
			<h2 className="text-2xl font-bold mb-6">Типы уведомлений</h2>
			<ul className="space-y-6">
				{notificationsList.map((n, idx) => (
					<li key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
						<div className="font-semibold text-lg text-ospab-primary mb-1">{n.title}</div>
						<div className="text-gray-700 text-sm">{n.description}</div>
					</li>
				))}
			</ul>
			<div className="text-gray-400 text-sm mt-8">Настройка каналов уведомлений (email, Telegram) появится позже.</div>
		</div>
	);
};

export default Notifications;
