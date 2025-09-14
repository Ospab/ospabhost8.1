import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Index() {
  return (
    <div>
      <Navbar />
      <main className="p-10">
        <h1 className="text-4xl font-bold">Welcome to ospab.host</h1>
        <p className="mt-4 text-lg">Your VPS hosting control panel</p>
      </main>
      <Footer />
    </div>
  );
}
