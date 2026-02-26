import { useAuth } from 'react-oidc-context';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const auth = useAuth();

  const handleLogin = () => {
    auth.signinRedirect();
  };

  const handleLogout = () => {
    auth.signoutRedirect();
  };

  const handleTokenCheck = async () => {
    try {
      const token = auth.user?.access_token;
      if (!token) {
        alert('No token available. Please login first.');
        return;
      }
      
      const response = await fetch('/api/introspect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      alert(`Token Status: ${result.active ? 'Active' : 'Inactive'}\n\n${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      alert(`Token validation failed: ${error.message}`);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>OIDC Demo</h1>
          <nav className="header-nav">
            {auth.isAuthenticated ? (
              <>
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>
                {(auth.user?.profile?.roles as unknown as string[])?.includes('admin') && (
                  <Link to="/users">Users</Link>
                )}
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  {auth.user?.profile?.preferred_username}
                </span>
                <button className="btn btn-secondary" onClick={handleTokenCheck}>
                  Check Token
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleLogin}>
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        {children}
      </main>
    </div>
  );
}
