import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Debug log to check user role
  console.log('AdminRoute - Current user:', user);

  // Check both user existence and admin role
  if (!user || user.role !== 'ADMIN') {
    console.log('Access denied: User is not admin');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
