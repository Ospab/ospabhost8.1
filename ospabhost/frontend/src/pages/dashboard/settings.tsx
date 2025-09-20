import React, { useState } from "react";

const Settings = () => {
  const [tab, setTab] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // TODO: получить email и username из API

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl max-w-xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Настройки аккаунта</h2>
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-semibold ${tab === 'email' ? 'bg-ospab-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setTab('email')}
        >
          Смена email
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg font-semibold ${tab === 'password' ? 'bg-ospab-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setTab('password')}
        >
          Смена пароля
        </button>
      </div>
      {tab === 'email' ? (
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Имя пользователя</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>
          <button type="button" className="bg-ospab-primary text-white px-6 py-2 rounded-lg font-bold">Сохранить email</button>
        </form>
      ) : (
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Новый пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Новый пароль" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <button type="button" className="bg-ospab-primary text-white px-6 py-2 rounded-lg font-bold">Сохранить пароль</button>
        </form>
      )}
    </div>
  );
};

export default Settings;