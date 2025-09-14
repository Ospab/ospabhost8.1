import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 text-center mt-10">
      <p>© {new Date().getFullYear()} ospab.host — All rights reserved</p>
    </footer>
  );
}
