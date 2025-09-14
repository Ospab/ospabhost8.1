import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div className="text-gray-800 min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 px-4 container mx-auto">
        <h1 className="text-4xl font-bold mb-6">Личный кабинет</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/dashboard/servers"
            className="bg-white rounded-3xl p-6 shadow hover:shadow-2xl transition-all text-center"
          >
            Мои серверы
          </Link>
          <Link
            to="/dashboard/billing"
            className="bg-white rounded-3xl p-6 shadow hover:shadow-2xl transition-all text-center"
          >
            Баланс и платежи
          </Link>
          <Link
            to="/dashboard/support"
            className="bg-white rounded-3xl p-6 shadow hover:shadow-2xl transition-all text-center"
          >
            Поддержка
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
