// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * 🎓 MICROSOFT-GRADE ERROR HANDLING: Error Boundary
 *
 * Catches JavaScript errors anywhere in the component tree
 * Prevents entire app from crashing
 *
 * Features:
 * - Error logging
 * - User-friendly error UI
 * - Recovery options
 * - Development vs production modes
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.MODE === 'development';

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-error-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-neutral-900 text-center mb-3">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-neutral-600 text-center mb-8">
                We encountered an unexpected error. Don't worry, your data is safe.
                {isDevelopment && ' Check the console for more details.'}
              </p>

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <div className="mb-6 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">Error Details:</h3>
                  <p className="text-sm text-error-600 font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-900">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-neutral-600 overflow-auto max-h-48 bg-neutral-100 p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  <RefreshCw size={20} />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
                >
                  <Home size={20} />
                  Go to Dashboard
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg transition-colors font-medium"
                >
                  Reload Page
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
                <p className="text-sm text-neutral-600">
                  If this problem persists, please{' '}
                  <a
                    href="mailto:support@internshipconnect.com"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * 🎓 USAGE EXAMPLES:
 *
 * 1. Wrap entire app:
 *
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <BrowserRouter>
 *         <Routes>...</Routes>
 *       </BrowserRouter>
 *     </ErrorBoundary>
 *   );
 * }
 *
 * 2. Wrap specific sections:
 *
 * <ErrorBoundary>
 *   <DashboardLayout />
 * </ErrorBoundary>
 *
 * 3. Multiple boundaries for granular control:
 *
 * <ErrorBoundary>
 *   <Header />
 *   <ErrorBoundary>
 *     <MainContent />
 *   </ErrorBoundary>
 *   <Footer />
 * </ErrorBoundary>
 */
