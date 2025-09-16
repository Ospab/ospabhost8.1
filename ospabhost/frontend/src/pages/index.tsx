import { Link } from 'react-router-dom';
import { FaServer, FaCloud, FaShieldAlt } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-100 to-white pt-24 pb-32">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter text-gray-900">
            Масштабируемый хостинг <br /> для ваших идей
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-gray-700">
            Запускайте, масштабируйте и управляйте своими проектами с надёжной и высокопроизводительной инфраструктурой.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full text-white font-bold text-lg transition-transform transform hover:scale-105 shadow-lg bg-ospab-primary hover:bg-ospab-accent"
            >
              Начать бесплатно
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-full text-gray-800 font-bold text-lg border-2 border-gray-400 transition-colors hover:bg-gray-200 hover:border-gray-300"
            >
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Наши возможности</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <FaServer className="text-5xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900">Высокая производительность</h3>
              <p className="mt-2 text-center text-gray-700">
                Оптимизированные серверы для максимальной скорости загрузки вашего сайта.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <FaCloud className="text-5xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900">Масштабируемость</h3>
              <p className="mt-2 text-center text-gray-700">
                Легко увеличивайте или уменьшайте ресурсы по мере роста вашего проекта.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <FaShieldAlt className="text-5xl text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900">Надежность и безопасность</h3>
              <p className="mt-2 text-center text-gray-700">
                Ваши данные и приложения всегда под надёжной защитой.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gray-800 py-20 px-4 text-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          Готовы начать?
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-400">
          Присоединяйтесь к тысячам разработчиков, которые доверяют нам.
        </p>
        <div className="mt-8">
          <Link
            to="/register"
            className="px-8 py-4 rounded-full text-white font-bold text-lg transition-transform transform hover:scale-105 shadow-lg bg-ospab-primary hover:bg-ospab-accent"
          >
            Начать бесплатно
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;