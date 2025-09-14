import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // анимации

const Home: React.FC = () => {
  return (
    <div className="text-gray-800">
      <Navbar />

      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-36">
        <div className="container mx-auto text-center px-4">
          <motion.h1
            className="text-5xl font-bold mb-4 rounded-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            ospab.host — Надёжный VPS и хостинг
          </motion.h1>
          <motion.p
            className="text-xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Создавайте серверы, управляйте VPS и следите за метриками прямо из панели.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Link
              to="/login"
              className="bg-white text-blue-700 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-pink-500 hover:text-white transition-all"
            >
              Начать бесплатно
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают ospab.host</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "VPS на Proxmox",
                desc: "Мгновенное создание и управление VPS, автоматические snapshot'ы и бэкапы.",
              },
              {
                title: "Мониторинг и графики",
                desc: "Полная информация о нагрузке CPU, RAM и дисков в реальном времени через ЛК.",
              },
              {
                title: "Безопасность",
                desc: "SSL, защита API, role-based access и безопасное хранение данных.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-3xl shadow p-6 hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Прозрачные тарифы</h2>
          <p className="mb-8">Выбирайте тариф под свои задачи, платите только за то, что используете.</p>
          <Link
            to="/pricing"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow hover:bg-pink-500 transition-all"
          >
            Посмотреть тарифы
          </Link>
        </div>
      </section>


      {/* Call-to-action */}
  <section className="py-8 bg-indigo-700 text-white text-center rounded-t-3xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="mb-6">
            Создайте аккаунт и получите доступ к панели управления VPS уже сегодня.
          </p>
          <Link
            to="/login"
            className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-full shadow hover:bg-pink-500 hover:text-white transition-all"
          >
            Зарегистрироваться
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
