import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import FormMessage from './FormMessage';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSidebar } from '../contexts/SidebarContext';
import '../css/left-sidebar.css';
import '../css/homepage.css';
import { getGlobalTestDB, updateUserEmail } from '../data/testData';

const Security: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [messageVisible, setMessageVisible] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(245, 245, 245)';
    return () => {
      document.body.style.backgroundColor = 'white';
    };
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser?.email]);

  const validateEmail = (value: string) => {
    const re = /^(?:[a-zA-Z0-9_'^&+\-])+(?:\.(?:[a-zA-Z0-9_'^&+\-])+)*@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;
    return re.test(value);
  };

  const handleSendCode = () => {
    if (!email.trim()) {
      setMessage('Пожалуйста, укажите E-mail');
      setMessageType('error');
      setMessageVisible(true);
      return;
    }

    if (!validateEmail(email.trim())) {
      setMessage('Некорректный E-mail. Проверьте адрес и попробуйте снова.');
      setMessageType('error');
      setMessageVisible(true);
      return;
    }

    // Имитация отправки кода подтверждения на email
    // Проверяем уникальность email среди всех пользователей
    const db = getGlobalTestDB();
    const normalized = email.trim().toLowerCase();
    const isTaken = Object.values(db.users).some(u => (u.email || '').toLowerCase() === normalized && u.phone !== currentUser?.phone);
    if (isTaken) {
      setMessage('Этот E-mail уже используется другим аккаунтом. Укажите другой адрес.');
      setMessageType('error');
      setMessageVisible(true);
      return;
    }

    // Генерируем простой 4-значный код для имитации
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    console.log(code);
    setMessage(`Код подтверждения отправлен на ${email}`);
    setMessageType('success');
    setMessageVisible(true);
    setIsCodeSent(true);
  };

  const handleChangePassword = () => {
    navigate('/forgot-password');
  };

  const handleConfirmEmail = () => {
    if (!verificationCode.trim()) {
      setMessage('Введите код подтверждения');
      setMessageType('error');
      setMessageVisible(true);
      return;
    }

    if (verificationCode !== generatedCode) {
      setMessage('Неверный код. Попробуйте еще раз.');
      setMessageType('error');
      setMessageVisible(true);
      return;
    }

    // Сохраняем email в базе и в currentUser
    const db = getGlobalTestDB();
    if (currentUser?.phone) {
      updateUserEmail(currentUser.phone, email, db);
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          localStorage.setItem('currentUser', JSON.stringify({ ...u, email }));
        } catch (e) {}
      }
      setMessage('E-mail подтвержден и сохранен.');
      setMessageType('success');
      setMessageVisible(true);
      setIsCodeSent(false);
      setVerificationCode('');
    }
  };

  return (
    <>
      <Header />
      <div className="homepage-container container">
        <LeftSidebar 
          currentUser={currentUser}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <div className="homepage-content">
          <div className="homepage-form-container">
            <div className="homepage-form-content">
              <div className="homepage-form-header-block" style={{ marginBottom: '16px' }}>
                <div className="homepage-form-header-content">
                  <h2>Хотите добавить E-mail?</h2>
                  <p>Основной номер телефона используется для входа в систему. После добавления E-mail вы также сможете использовать его для входа и получения важных уведомлений.</p>
                </div>
              </div>
              <div className="form-section">
                {currentUser?.email && !isEditingEmail ? (
                  <div className="form-row email-form-row">
                    <div className="form-field" style={{ maxWidth: '405px' }}>
                      <label>E-mail</label>
                      <input type="email" className="form-input" value={currentUser.email} readOnly />
                    </div>
                    <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button className="submit-transport-btn" onClick={() => { setIsEditingEmail(true); setIsCodeSent(false); setVerificationCode(''); }}>Изменить почту</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-row email-form-row">
                      <div className="form-field" style={{ maxWidth: '405px' }}>
                        <label>E-mail</label>
                        <input 
                          type="email" 
                          className="form-input" 
                          placeholder="example@email.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                          На указанный адрес будет отправлен код подтверждения. Используйте его для завершения добавления почты.
                        </div>
                      </div>
                      <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="submit-cargo-btn" onClick={handleSendCode}>Отправить код</button>
                      </div>
                    </div>

                    {isCodeSent && (
                      <div className="form-row email-form-row" style={{ marginTop: '16px' }}>
                        <div className="form-field" style={{ maxWidth: '405px' }}>
                          <label>Введите код</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="4-значный код" 
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                        </div>
                        <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <button className="submit-transport-btn" onClick={handleConfirmEmail}>Подтвердить</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <FormMessage message={message} type={messageType} isVisible={messageVisible} />
              </div>
            </div>
          </div>

          {/* Блок: Сменить пароль */}
          <div className="homepage-form-container">
            <div className="homepage-form-content">
              <h3>Хотите сменить пароль?</h3>
              <p style={{ marginTop: '8px' }}>
                Пароли хранятся в зашифрованном виде, поэтому мы не можем отобразить их в настройках. Если вы хотите изменить пароль, нажмите «Сменить пароль».
              </p>

              <div style={{ marginTop: '16px' }}>
                <button className="submit-transport-btn" onClick={handleChangePassword}>Сменить пароль</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Security;


