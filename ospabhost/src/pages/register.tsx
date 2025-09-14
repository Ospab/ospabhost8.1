import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !password2) {
      alert("Заполните все поля");
      return;
    }
    if (password !== password2) {
      alert("Пароли не совпадают");
      return;
    }
    if (register(name, email, password, password2)) {
      navigate("/dashboard");
    } else {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="flex justify-center items-center h-screen">
        <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center">Регистрация</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-2 rounded-full hover:bg-pink-500 transition-all"
            >
              Зарегистрироваться
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
