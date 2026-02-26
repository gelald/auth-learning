import { useAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import CallbackPage from './pages/CallbackPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (auth.isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Layout>
                <ProductsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
