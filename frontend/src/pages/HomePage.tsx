import { useAuth } from 'react-oidc-context';

export default function HomePage() {
  const auth = useAuth();
  console.log(auth);

  return (
    <div className="home-content">
      {!auth.isAuthenticated ? (
        <>
          <h2>Welcome to OIDC Demo</h2>
          <p>A complete OIDC authentication example with React, SpringBoot, and Keycloak</p>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 className="card-title">Features</h3>
            <ul style={{ textAlign: 'left', lineHeight: '2', color: '#666' }}>
              <li>✅ PKCE Authentication Flow</li>
              <li>✅ JWT Token Validation</li>
              <li>✅ Real-time Token Introspection</li>
              <li>✅ Role-based Access Control (RBAC)</li>
              <li>✅ Complete CRUD Operations</li>
              <li>✅ React + SpringBoot + Keycloak</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={() => auth.signinRedirect()} style={{ marginTop: '24px' }}>
            Get Started - Login
          </button>
        </>
      ) : (
        <>
          <h2>Welcome back, {auth.user?.profile?.preferred_username}!</h2>
          <p>You have successfully authenticated with Keycloak</p>
          <div className="user-info">
            <h3>User Information</h3>
            <p><strong>Username:</strong> {auth.user?.profile?.preferred_username}</p>
            <p><strong>Email:</strong> {auth.user?.profile?.email}</p>
            <p><strong>Name:</strong> {auth.user?.profile?.name}</p>
            <p><strong>Roles:</strong> {JSON.stringify(auth.user?.profile?.roles)}</p>
            <p><strong>Token Type:</strong> {auth.user?.id_token ? 'ID Token + Access Token' : 'Access Token Only'}</p>
          </div>
          <div style={{ marginTop: '24px' }}>
            <a href="/products" className="btn btn-primary">
              Browse Products
            </a>
          </div>
        </>
      )}
    </div>
  );
}
