import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ServerError() {
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, countdown]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCancelRedirect = () => {
    setAutoRedirect(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-2xl w-full mx-auto px-6 py-12 text-center">
        {/* 500 число */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-600 animate-pulse">
            500
          </h1>
        </div>

        {/* Иконка */}
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Текст */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Ошибка сервера
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          К сожалению, на сервере произошла ошибка. Мы уже работаем над её устранением.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Пожалуйста, попробуйте обновить страницу или вернитесь позже.
        </p>

        {/* Таймер автоперенаправления */}
        {autoRedirect && countdown > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Автоматическое перенаправление на главную страницу через{' '}
              <span className="font-bold text-xl text-blue-600">{countdown}</span> сек.
            </p>
            <button
              onClick={handleCancelRedirect}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Отменить
            </button>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Обновить страницу
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-red-600 text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors"
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
        </div>

        {/* Информация для пользователя */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Что можно сделать?
          </h3>
          <div className="text-left max-w-md mx-auto space-y-3">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Обновите страницу (Ctrl+R или F5)
              </p>
            </div>
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Очистите кэш браузера (Ctrl+Shift+Del)
              </p>
            </div>
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Попробуйте зайти позже (5-10 минут)
              </p>
            </div>
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Свяжитесь с поддержкой:{' '}
                <a
                  href="mailto:support@ospab.host"
                  className="text-red-600 hover:text-red-800 underline"
                >
                  support@ospab.host
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Код ошибки (для техподдержки) */}
        <div className="mt-8">
          <details className="text-left max-w-md mx-auto">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Техническая информация
            </summary>
            <div className="mt-3 p-4 bg-gray-100 rounded text-xs font-mono text-gray-700">
              <p>Error: 500 Internal Server Error</p>
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>Path: {window.location.pathname}</p>
              <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
