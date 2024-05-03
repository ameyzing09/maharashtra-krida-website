// src/components/PrivateRoute.js

import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

function PrivateRoute() {
  const { status } = useAuth();
  const navigate = useNavigate();
  console.log('authStatus - ', status) 
  useEffect(() => {
    if (status === 'notSignedIn') {
      navigate('/login');
    }
  }, [status, navigate]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Optionally render a spinner or similar here
  }

  return status === 'signedIn' ? <Outlet /> : null;
}

export default PrivateRoute;
