import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import PageLoader from './PageLoader';

function PrivateRoute() {
  const { status } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (status === 'notSignedIn') {
      navigate('/login');
    }
  }, [status, navigate]);

  if (status === 'loading') {
    return <PageLoader variant="center" label="Checking session..." />;
  }

  return status === 'signedIn' ? <Outlet /> : null;
}

export default PrivateRoute;
