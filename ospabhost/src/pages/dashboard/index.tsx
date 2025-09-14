import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Next-Gen VPS Hosting
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Deploy and manage virtual servers with ease. Powered by DigitalOcean and AWS.
        </p>
        <div className="space-x-4">
          <Button>Get Started</Button>
          {/* Для поддержки variant="secondary" нужно доработать компонент Button */}
          <Button>View Pricing</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
