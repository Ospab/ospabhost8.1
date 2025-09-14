import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar user={null} logout={() => {}} />
      <main className="flex-grow p-10">
        <h1 className="text-4xl font-bold">Добро пожаловать в ospab.host</h1>
        <p className="mt-4 text-lg">Ваша панель управления VPS-хостингом</p>
      </main>
      <Footer />
    </div>
  );
}
