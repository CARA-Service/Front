import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const { setUser } = useAuth();

  useEffect(() => {
    const processKakaoLogin = async () => {
      // URL에서 토큰과 사용자 정보 추출
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const isNewUser = params.get('isNewUser') === 'true';
      const userId = params.get('userId');
      
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      try {
        // 토큰 저장
        localStorage.setItem('token', token);
        
        // 사용자 정보 가져오기
        const response = await api.get('/api/v1/users/me');
        setUser(response.data);
        
        // 로그인 성공 후 리다이렉트
        if (isNewUser) {
          navigate('/welcome'); // 신규 사용자 환영 페이지
        } else {
          navigate('/'); // 메인 페이지
        }
      } catch (err) {
        console.error('카카오 로그인 처리 중 오류:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    processKakaoLogin();
  }, [location, navigate, setUser]);

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return <div className="loading-container">로그인 처리 중...</div>;
};

export default KakaoCallback;