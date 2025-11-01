import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Pagetempl from './components/pagetempl';
import DashboardTempl from './components/dashboardtempl';
import Homepage from './pages/index';
import Dashboard from './pages/dashboard/mainpage';
import Loginpage from './pages/login';
import Registerpage from './pages/register';
import TariffsPage from './pages/tariffs';
import Aboutpage from './pages/about';
import Privacy from './pages/privacy';
import Terms from './pages/terms';
import NotFound from './pages/404';
import ServerError from './pages/500';
import Privateroute from './components/privateroute';
import { AuthProvider } from './context/authcontext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// SEO конфиг для всех маршрутов
const SEO_CONFIG: Record<string, {
  title: string;
  description: string;
  keywords: string;
  og?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
}> = {
  '/': {
    title: 'Облачный хостинг и виртуальные машины',
    description: 'Ospab.host - надёжный облачный хостинг и виртуальные машины (VPS/VDS) в Великом Новгороде. Запускайте и масштабируйте проекты с высокой производительностью, 24/7 поддержкой и доступными ценами.',
    keywords: 'хостинг, облачный хостинг, VPS, VDS, виртуальные машины, дата-центр, Великий Новгород',
    og: {
      title: 'Ospab.host - Облачный хостинг',
      description: 'Запускайте и масштабируйте проекты с надёжной инфраструктурой',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/',
    },
  },
  '/about': {
    title: 'О компании',
    description: 'Узнайте о Ospab.host - первом облачном хостинге в Великом Новгороде. История создания, миссия и видение компании. Основатель Георгий Сыралёв.',
    keywords: 'об ospab, история хостинга, облачные решения, Великий Новгород',
    og: {
      title: 'О компании Ospab.host',
      description: 'История создания первого хостинга в Великом Новгороде',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/about',
    },
  },
  '/tariffs': {
    title: 'Тарифы и цены',
    description: 'Выберите подходящий тариф для вашего проекта. Облачный хостинг, VPS, VDS с гибкими тарифами и доступными ценами. Начните с облачного хостинга от Ospab.host.',
    keywords: 'цены на хостинг, тарифы, VPS цена, VDS цена, облачные решения, стоимость хостинга',
    og: {
      title: 'Тарифы Ospab.host',
      description: 'Выберите тариф для размещения сайта или сервера',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/tariffs',
    },
  },
  '/login': {
    title: 'Вход в аккаунт',
    description: 'Войдите в ваш личный кабинет Ospab.host. Управляйте серверами, тарифами и билетами поддержки. Быстрый вход в аккаунт хостинга.',
    keywords: 'вход в аккаунт, личный кабинет, ospab, вход в хостинг',
    og: {
      title: 'Вход в Ospab.host',
      description: 'Логин в личный кабинет',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/login',
    },
  },
  '/register': {
    title: 'Регистрация',
    description: 'Зарегистрируйтесь в Ospab.host и начните пользоваться облачным хостингом. Создайте аккаунт бесплатно за 2 минуты и получите бонус.',
    keywords: 'регистрация, создать аккаунт, ospab регистрация, регистрация хостинга',
    og: {
      title: 'Регистрация в Ospab.host',
      description: 'Создайте аккаунт и начните пользоваться хостингом',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/register',
    },
  },
  '/terms': {
    title: 'Условия использования',
    description: 'Условия использования сервиса Ospab.host. Ознакомьтесь с полными правилами и требованиями для пользователей хостинга.',
    keywords: 'условия использования, пользовательское соглашение, правила использования',
    og: {
      title: 'Условия использования Ospab.host',
      description: 'Полные условия использования сервиса',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/terms',
    },
  },
  '/privacy': {
    title: 'Политика конфиденциальности',
    description: 'Политика конфиденциальности Ospab.host. Узнайте как мы защищаем ваши персональные данные и информацию о приватности.',
    keywords: 'политика конфиденциальности, приватность, защита данных, GDPR',
    og: {
      title: 'Политика конфиденциальности Ospab.host',
      description: 'Узнайте о защите ваших данных',
      image: 'https://ospab.host/og-image.jpg',
      url: 'https://ospab.host/privacy',
    },
  },
};

// Компонент для обновления SEO при изменении маршрута
function SEOUpdater() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Получаем SEO данные для текущего маршрута, иначе используем дефолтные
    const seoData = SEO_CONFIG[pathname] || {
      title: 'Ospab.host - Облачный хостинг',
      description: 'Ospab.host - надёжный облачный хостинг и виртуальные машины в Великом Новгороде.',
      keywords: 'хостинг, облачный хостинг, VPS, VDS',
    };

    // Устанавливаем title
    document.title = `${seoData.title} - Ospab.host`;

    // Функция для установки или обновления meta тега
    const setMeta = (name: string, content: string, isProperty = false) => {
      let tag = document.querySelector(
        isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      ) as HTMLMetaElement | null;

      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }

      tag.setAttribute('content', content);
    };

    // Основные SEO теги
    setMeta('description', seoData.description);
    setMeta('keywords', seoData.keywords);

    // Canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', `https://ospab.host${pathname}`);

    // Open Graph теги
    if (seoData.og) {
      setMeta('og:type', 'website', true);
      setMeta('og:title', seoData.og.title, true);
      setMeta('og:description', seoData.og.description, true);
      setMeta('og:image', seoData.og.image, true);
      setMeta('og:url', seoData.og.url, true);
      setMeta('og:site_name', 'Ospab.host', true);
      setMeta('og:locale', 'ru_RU', true);

      // Twitter Card
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', seoData.og.title);
      setMeta('twitter:description', seoData.og.description);
      setMeta('twitter:image', seoData.og.image);
    }

    // Скроллим вверх при навигации
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <SEOUpdater />
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Routes>
              {/* Обычные страницы с footer */}
              <Route path="/" element={<Pagetempl><Homepage /></Pagetempl>} />
              <Route path="/tariffs" element={<Pagetempl><TariffsPage /></Pagetempl>} />
              <Route path="/about" element={<Pagetempl><Aboutpage /></Pagetempl>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Pagetempl><Loginpage /></Pagetempl>} />
              <Route path="/register" element={<Pagetempl><Registerpage /></Pagetempl>} />
              
              {/* Дашборд без footer */}
              <Route path="/dashboard/*" element={
                <DashboardTempl>
                  <Privateroute>
                    <Dashboard />
                  </Privateroute>
                </DashboardTempl>
              } />

              {/* Страницы ошибок */}
              <Route path="/500" element={<ServerError />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;