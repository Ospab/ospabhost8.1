import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold text-blue-400">
        ospab.host
      </Link>
      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <Link to="/pricing" className="hover:text-blue-400">Pricing</Link>
        <Link to="/login" className="hover:text-blue-400">Login</Link>
        <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
      </div>
    </nav>
  );
}
