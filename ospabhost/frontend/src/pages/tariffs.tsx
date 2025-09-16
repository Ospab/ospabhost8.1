import { useState } from 'react';

const TariffsPage = () => {
  const [cpu, setCpu] = useState(1);
  const [ram, setRam] = useState(1);
  const [storage, setStorage] = useState(50);
  
  const cpuPrice = 500;
  const ramPrice = 300;
  const storagePrice = 5;

  const total = cpu * cpuPrice + ram * ramPrice + storage * storagePrice;

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">Выберите подходящий тариф</h1>
        
        {/* Basic Tariffs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Tariff Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center transition-transform hover:scale-105 duration-300">
            <h2 className="text-3xl font-bold text-gray-800">Базовый</h2>
            <p className="mt-4 text-4xl font-extrabold text-ospab-primary">₽1500<span className="text-lg font-normal text-gray-500">/мес</span></p>
            <ul className="mt-4 text-gray-600 space-y-2">
              <li>1 ядро CPU</li>
              <li>2 ГБ RAM</li>
              <li>100 ГБ SSD</li>
              <li>Неограниченный трафик</li>
            </ul>
            <button className="mt-8 px-6 py-3 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent">
              Выбрать
            </button>
          </div>
          
          {/* Tariff Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-4 border-ospab-primary transition-transform hover:scale-105 duration-300">
            <h2 className="text-3xl font-bold text-gray-800">Профессиональный</h2>
            <p className="mt-4 text-4xl font-extrabold text-ospab-primary">₽4000<span className="text-lg font-normal text-gray-500">/мес</span></p>
            <ul className="mt-4 text-gray-600 space-y-2">
              <li>4 ядра CPU</li>
              <li>8 ГБ RAM</li>
              <li>250 ГБ SSD</li>
              <li>Приоритетная поддержка</li>
            </ul>
            <button className="mt-8 px-6 py-3 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent">
              Выбрать
            </button>
          </div>
          
          {/* Tariff Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center transition-transform hover:scale-105 duration-300">
            <h2 className="text-3xl font-bold text-gray-800">Бизнес</h2>
            <p className="mt-4 text-4xl font-extrabold text-ospab-primary">₽8000<span className="text-lg font-normal text-gray-500">/мес</span></p>
            <ul className="mt-4 text-gray-600 space-y-2">
              <li>8 ядер CPU</li>
              <li>16 ГБ RAM</li>
              <li>500 ГБ SSD</li>
              <li>24/7 Мониторинг</li>
            </ul>
            <button className="mt-8 px-6 py-3 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent">
              Выбрать
            </button>
          </div>
        </div>

        {/* Server Constructor Section */}
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Соберите свой сервер</h2>
          <div className="space-y-6">
            {/* CPU Slider */}
            <div>
              <label htmlFor="cpu" className="block text-lg font-medium text-gray-700">Ядра CPU: {cpu}</label>
              <input
                type="range"
                id="cpu"
                min="1"
                max="16"
                value={cpu}
                onChange={(e) => setCpu(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">Цена: ₽{cpu * cpuPrice}</p>
            </div>
            
            {/* RAM Slider */}
            <div>
              <label htmlFor="ram" className="block text-lg font-medium text-gray-700">Оперативная память (ГБ): {ram}</label>
              <input
                type="range"
                id="ram"
                min="1"
                max="32"
                value={ram}
                onChange={(e) => setRam(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">Цена: ₽{ram * ramPrice}</p>
            </div>
            
            {/* Storage Slider */}
            <div>
              <label htmlFor="storage" className="block text-lg font-medium text-gray-700">Диск (ГБ): {storage}</label>
              <input
                type="range"
                id="storage"
                min="50"
                max="2000"
                step="50"
                value={storage}
                onChange={(e) => setStorage(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">Цена: ₽{storage * storagePrice}</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-2xl font-bold text-gray-800">Итого: ₽{total}<span className="text-lg font-normal text-gray-500">/мес</span></p>
            <button className="mt-4 px-8 py-4 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent">
              Собрать сервер
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffsPage;