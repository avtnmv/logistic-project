import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import TransitionOverlay from './TransitionOverlay';
import FormMessage from './FormMessage';
import PasswordToggle from './PasswordToggle';
import { getGlobalTestDB, logTestData, verifyUserPassword, updateUserInDB } from '../data/testData';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import '../css/login.css';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showTransition, setShowTransition] = useState(false);
  const passwordToggle = usePasswordToggle();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showMessage, setShowMessage] = useState(false);

  const testDB = getGlobalTestDB();

  React.useEffect(() => {
    logTestData('ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ВХОДА');
    console.log('🔍 DEBUG Login: current location =', location);
    console.log('🔍 DEBUG Login: pathname =', location.pathname);
  }, [location]);

  const showFormMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text);
    setMessageType(type);
    setShowMessage(true);
    
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      showFormMessage('Введите номер телефона', 'error');
      return;
    }

    const phoneRegex = /^\+\d{1,4}\d{7,14}$/;
    if (!phoneRegex.test(phone)) {
      showFormMessage('Введите корректный номер телефона в международном формате (например: +380XXXXXXXXX, +998XXXXXXXXX, +1XXXXXXXXXX)', 'error');
      return;
    }

    if (!password.trim()) {
      showFormMessage('Введите пароль', 'error');
      return;
    }

    if (verifyUserPassword(phone, password, testDB)) {
      // Получаем данные пользователя из базы данных
      const userData = testDB.users[phone];
      if (userData) {
        // Обновляем пользователя в базе данных (если нужно)
        updateUserInDB(phone, userData);
        
        // Сохраняем данные пользователя в localStorage для текущей сессии
        const currentUserData = {
          id: userData.id,
          phone: userData.phone,
          firstName: userData.firstName || 'Пользователь',
          lastName: userData.lastName || '',
          email: userData.email || ''
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
      }
      
      showFormMessage('Вход выполнен успешно!', 'success');
      
      setShowTransition(true);
      
      setTimeout(() => {
        setShowTransition(false);
        navigate('/homepage');
      }, 1000);
    } else {
      showFormMessage('Неверный номер телефона или пароль', 'error');
    }
  };



  return (
    <>
      <Header />
      <TransitionOverlay isVisible={showTransition} />
      
      <main className="main container">
        <div className="main__container">
          <motion.div 
            className="form-container form-container--active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="20.833" fill="#EEF4F7"/>
              <path d="M26.736 31.076a.868.868 0 1 0 0 1.736h4.34c.96 0 1.736-.777 1.736-1.736V18.923c0-.959-.777-1.736-1.736-1.736h-4.34a.868.868 0 1 0 0 1.736h4.34v12.153z" fill="#4472B8"/>
              <path d="M28.224 25.608a.87.87 0 0 0 .248-.606v-.005a.87.87 0 0 0-.254-.611l-3.472-3.472a.868.868 0 1 0-1.228 1.227l1.99 1.99h-8.32a.868.868 0 1 0 0 1.737h8.32l-1.99 1.99a.868.868 0 1 0 1.228 1.227l3.471-3.471z" fill="#4472B8"/>
            </svg>

            <h2 className="form-container__title">Вход в систему</h2>
            <p className="form-container__description">Введите номер телефона и пароль для входа в систему</p>
            
            {/* Демо-данные для тестирования */}
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4472B8' }}>
                🚀 Демо-пользователь для тестирования:
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Номер:</strong> +1234567890
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Пароль:</strong> Demo123!
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px', marginBottom: '12px' }}>
                Скопируйте эти данные в поля ниже для быстрого входа
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setPhone('+1234567890')}
                  style={{
                    background: '#4472B8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Заполнить номер
                </button>
                <button
                  type="button"
                  onClick={() => setPassword('Demo123!')}
                  style={{
                    background: '#4472B8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Заполнить пароль
                </button>
              </div>
            </div>

            <FormMessage 
              message={message} 
              type={messageType} 
              isVisible={showMessage} 
            />

            <form className="form" onSubmit={handleSubmit}>
              <div className="form__group">
                <input 
                  type="tel" 
                  className="form__input" 
                  placeholder=" " 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (!target.value) {
                      target.value = "+";
                      setPhone("+");
                    }
                  }}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === 'Backspace' && target.value === '+') {
                      e.preventDefault();
                    }
                  }}
                  required 
                />
                <label htmlFor="phone" className="form__label">Номер телефона</label>
              </div>

              <div className="form__group">
                <input 
                  type={passwordToggle.isVisible ? 'text' : 'password'}
                  className="form__input" 
                  placeholder=" " 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <label htmlFor="password" className="form__label">Пароль</label>
                <PasswordToggle 
                  isVisible={passwordToggle.isVisible} 
                  onToggle={passwordToggle.toggle} 
                />
              </div>

              <button type="submit" className="form__button form__button--login">
                Войти
              </button>
            </form>

            <div className="form-container__footer">
              <p className="form-container__text">Забыли пароль?</p>
              <button 
                className="form__button form-container__button"
                onClick={() => {
                  console.log('🔍 DEBUG Login: Navigating to /forgot-password');
                  navigate('/forgot-password');
                }}
              >
                Восстановить пароль
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Login;
