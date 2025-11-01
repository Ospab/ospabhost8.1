import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Отправка ошибки в сервис мониторинга
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Перенаправление на страницу 500 через 2 секунды
    setTimeout(() => {
      window.location.href = '/500';
    }, 2000);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
          <div className="max-w-md w-full mx-auto px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Произошла ошибка
            </h2>
            <p className="text-gray-600 mb-2">{this.state.error?.message}</p>
            <p className="text-sm text-gray-500">
              Перенаправление на страницу ошибки...
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
