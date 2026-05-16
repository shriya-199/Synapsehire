import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../../features/auth/authSlice';

export function GoogleAuthButton({ role }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="mt-4">
      <GoogleLogin
        width="100%"
        onSuccess={async (response) => {
          const result = await dispatch(googleLogin({ credential: response.credential, role }));
          if (googleLogin.fulfilled.match(result)) navigate('/dashboard');
        }}
        onError={() => undefined}
      />
    </div>
  );
}
