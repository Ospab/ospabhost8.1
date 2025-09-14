import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <input className="border p-3 w-full mb-4 rounded-lg" placeholder="Email" />
          <input className="border p-3 w-full mb-6 rounded-lg" placeholder="Password" type="password"/>
          <Button>Login</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
