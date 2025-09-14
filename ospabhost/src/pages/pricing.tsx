import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

const Pricing: React.FC = () => {
  const plans = [
    { title: "Basic VPS", price: "$5/мес", features: ["1 CPU", "1 GB RAM", "20 GB SSD"] },
    { title: "Pro VPS", price: "$15/мес", features: ["2 CPU", "4 GB RAM", "50 GB SSD"] },
    { title: "Enterprise", price: "$30/мес", features: ["4 CPU", "8 GB RAM", "100 GB SSD"] },
  ];

  return (
    <div className="text-gray-800">
      <Navbar />

      <section className="py-24 bg-gray-100">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-12">Наши тарифы</h1>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-3xl shadow p-6 hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <h2 className="text-2xl font-bold mb-4">{plan.title}</h2>
                <p className="text-xl mb-4">{plan.price}</p>
                <ul className="mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="mb-1">{f}</li>
                  ))}
                </ul>
                <button className="bg-indigo-700 text-white py-2 px-6 rounded-full hover:bg-pink-500 transition-all">
                  Выбрать
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
