import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Добро пожаловать в личный кабинет!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Здесь будет информация о твоих проектах и статистика.
        </p>
        <div className="mt-8">
          <Link
            to="/logout"
            className="px-6 py-3 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent"
          >
            Выйти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;