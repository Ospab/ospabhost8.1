
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TariffsPage = () => {
	const [tariffs, setTariffs] = useState<Array<{id:number;name:string;price:number;description?:string}>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const navigate = useNavigate();


		useEffect(() => {
		const fetchTariffs = async () => {
			try {
				const res = await axios.get('https://ospab.host:5000/api/tariff');
				console.log('Ответ API тарифов:', res.data);
				if (Array.isArray(res.data)) {
					setTariffs(res.data);
				} else {
					setError('Некорректный формат данных тарифов');
					setTariffs([]);
				}
			} catch (err) {
				console.error('Ошибка загрузки тарифов:', err);
				setError('Ошибка загрузки тарифов');
				setTariffs([]);
			}
			setLoading(false);
		};
		fetchTariffs();
	}, []);

	const handleBuy = (tariffId: number) => {
		navigate(`/dashboard/checkout?tariff=${tariffId}`);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 lg:py-20">
			<div className="container mx-auto px-4">
						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 lg:mb-6 text-gray-900">Тарифы</h1>
								<p className="text-base lg:text-lg text-gray-600 text-center mb-8 lg:mb-10 max-w-2xl mx-auto">
									Выберите тариф для размещения сайта или сервера. ospab.host — надёжно и удобно!
								</p>
						{loading ? (
							<p className="text-lg text-gray-500 text-center">Загрузка...</p>
						) : error ? (
							<p className="text-lg text-red-500 text-center">{error}</p>
						) : tariffs.length === 0 ? (
							<p className="text-lg text-gray-500 text-center">Нет доступных тарифов.</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-20">
											{tariffs.map(tariff => (
												<div key={tariff.id} className="bg-white p-6 lg:p-12 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl text-left flex flex-col justify-between transition-transform hover:scale-105 duration-300 min-h-[280px] lg:min-h-[340px]">
													<div>
														<h2 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-3 lg:mb-4">{tariff.name}</h2>
														<p className="mb-3 lg:mb-4 text-3xl lg:text-5xl font-extrabold text-ospab-primary break-words">₽{tariff.price}<span className="text-base lg:text-xl font-normal text-gray-500">/мес</span></p>
														{tariff.description && (
															<ul className="text-sm lg:text-lg text-gray-700 mb-4 lg:mb-6 list-disc list-inside space-y-1">
																{tariff.description.split(',').map((desc, i) => (
																	<li key={i} className="break-words">{desc.trim()}</li>
																))}
															</ul>
														)}
													</div>
													<button
														className="mt-4 px-6 lg:px-8 py-3 lg:py-4 rounded-full text-white font-bold text-base lg:text-xl transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent w-full"
														onClick={() => handleBuy(tariff.id)}
													>
														Купить
													</button>
												</div>
											))}
							</div>
						)}
			</div>
		</div>
	);
};

export default TariffsPage;


