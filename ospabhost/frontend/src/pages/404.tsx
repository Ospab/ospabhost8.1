import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full mx-auto px-6 py-12 text-center">
        {/* 404 число */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 animate-bounce">
            404
          </h1>
        </div>

        {/* Иконка */}
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Текст */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Страница не найдена
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            На главную
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Назад
          </button>
        </div>

        {/* Дополнительные ссылки */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500 mb-4">
            Возможно, вы искали одну из этих страниц:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/tariffs"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Тарифы
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Личный кабинет
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/about"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              О нас
            </Link>
            <span className="text-gray-400">•</span>
            <a
              href="mailto:support@ospab.host"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Поддержка
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
