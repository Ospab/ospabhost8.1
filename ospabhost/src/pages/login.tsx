import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  login: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ login }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 text-white rounded">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />
        <button className="w-full bg-blue-600 py-2 rounded font-bold hover:bg-blue-700">
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;
