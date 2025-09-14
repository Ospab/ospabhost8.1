import { Link, Routes, Route } from "react-router-dom";
import Servers from "./servers";
import Billing from "./billing";
import Support from "./support";

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Личный кабинет</h1>
      <div className="flex space-x-4 mb-4">
        <Link className="underline" to="servers">Сервера</Link>
        <Link className="underline" to="billing">Биллинг</Link>
        <Link className="underline" to="support">Поддержка</Link>
      </div>
      <Routes>
        <Route path="servers" element={<Servers />} />
        <Route path="billing" element={<Billing />} />
        <Route path="support" element={<Support />} />
        <Route path="/" element={<div>Выберите раздел</div>} />
      </Routes>
    </div>
  );
};

export default Dashboard;
