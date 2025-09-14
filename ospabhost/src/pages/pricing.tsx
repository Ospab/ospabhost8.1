import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

export default function Pricing() {
  const plans = [
    { name: "Мини", price: "200 р/мес", features: ["1 vCPU", "1GB RAM", "25GB SSD"] },
    { name: "Стандарт", price: "500 р/мес", features: ["2 vCPU", "2GB RAM", "50GB SSD"] },
    { name: "Профессионал", price: "700 р/мес", features: ["4 vCPU", "8GB RAM", "100GB SSD"] },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
  <Navbar user={null} logout={() => {}} />

      <main className="flex-grow px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Выбери свой тариф</h1>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(plan => (
            <div key={plan.name} className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-3xl font-extrabold text-blue-600 mb-4">{plan.price}</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                {plan.features.map(f => <li key={f}>✅ {f}</li>)}
              </ul>
              <Button>Заказать</Button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
