import Navbar from "../../components/Navbar";

const Billing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-32 px-4 container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Баланс и платежи</h1>
        <div className="bg-white rounded-3xl shadow p-6">
          <p>Информация о платежах появится здесь.</p>
        </div>
      </section>
    </div>
  );
};

export default Billing;
