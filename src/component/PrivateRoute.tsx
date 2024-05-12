import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';
import { TailSpin } from 'react-loader-spinner';

function PrivateRoute() {
  const { status } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (status === 'notSignedIn') {
      navigate('/login');
    }
  }, [status, navigate]);

  if (status === 'loading') {
    return(
        <div className="flex justify-center items-center h-screen">
          <TailSpin color="#a3e635" height={80} width={80} />
        </div>
      );
  }

  return status === 'signedIn' ? <Outlet /> : null;
}

export default PrivateRoute;
