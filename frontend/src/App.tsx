import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import OrderForm from './pages/OrderForm';
import ChangePassword from './pages/ChangePassword';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </AuthProvider>
  );
}
