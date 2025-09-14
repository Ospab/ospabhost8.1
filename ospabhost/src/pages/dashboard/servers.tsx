import Navbar from "../../components/Navbar";

const Servers: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-32 px-4 container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Мои VPS</h1>
        <div className="bg-white rounded-3xl shadow p-6">
          <p>Список серверов пока пуст...</p>
        </div>
      </section>
    </div>
  );
};

export default Servers;
