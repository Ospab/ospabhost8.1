const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white p-4 text-center">
      © {new Date().getFullYear()} osapab.host. Все права защищены.
    </footer>
  );
};

export default Footer;
