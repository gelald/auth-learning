import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router-dom';

export default function CallbackPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <h2>Authentication Error</h2>
          <p>{auth.error.message}</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
}
