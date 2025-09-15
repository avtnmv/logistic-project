import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import FormMessage from './FormMessage';
import PasswordToggle from './PasswordToggle';
import { getGlobalTestDB, logTestData, isUserRegistered, updateUserPassword } from '../data/testData';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import '../css/login.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [currentPhone, setCurrentPhone] = useState('');
  const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showMessage, setShowMessage] = useState(false);
  const [isCodeCorrect, setIsCodeCorrect] = useState<boolean | null>(null);

  const passwordToggle = usePasswordToggle();
  const confirmPasswordToggle = usePasswordToggle();

  const testDB = getGlobalTestDB();

  React.useEffect(() => {
    logTestData('ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const showFormMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text);
    setMessageType(type);
    setShowMessage(true);
  };

  const handleGetCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPhone.trim()) {
      showFormMessage('Введите номер телефона', 'error');
      return;
    }

    const phoneRegex = /^\+\d{1,4}\d{7,14}$/;
    if (!phoneRegex.test(currentPhone)) {
      showFormMessage('Введите корректный номер телефона в международном формате (например: +380XXXXXXXXX, +998XXXXXXXXX, +1XXXXXXXXXX)', 'error');
      return;
    }

    if (!isUserRegistered(currentPhone, testDB)) {
      showFormMessage('Пользователь с этим номером не зарегистрирован. Сначала зарегистрируйтесь', 'error');
      return;
    }
    
    let code = testDB.codes[currentPhone];
    if (!code) {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      testDB.codes[currentPhone] = code;
    }
    
    console.log('');
    console.log('==================================================');
    console.log('                    КОД ДЛЯ ВВОДА: ' + code);
    console.log('==================================================');
    console.log('');
    console.log('📱 Номер телефона: ' + currentPhone);
    console.log('🔑 Код для ввода: ' + code);
    console.log('');
    console.log('💡 ПОДСКАЗКА: Используйте один из этих номеров для тестирования:');
    console.log('   +998901234567 → код: 1234');
    console.log('   +998901234568 → код: 5678');
    console.log('   +380635032027 → код: 9999');
    console.log('');
    console.log('🔍 ИЛИ используйте любой зарегистрированный номер - код будет сгенерирован автоматически');
    console.log('');
    
    showFormMessage('Код отправлен на ваш номер телефона', 'success');
    setCurrentStep('code');
    setCountdown(30);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = codeInputs.join('');
    
    if (code.length !== 4) {
      showFormMessage('Введите полный 4-значный код', 'error');
      return;
    }
    
    if (!/^\d{4}$/.test(code)) {
      showFormMessage('Код должен состоять только из цифр', 'error');
      return;
    }
    
    if (testDB.codes[currentPhone] === code) {
      setIsCodeCorrect(true);
      showFormMessage('Код подтвержден!', 'success');
      setTimeout(() => {
        setCurrentStep('password');
        setIsCodeCorrect(null);
      }, 1000);
    } else {
      setIsCodeCorrect(false);
      showFormMessage('Код неверный. Проверьте правильность ввода', 'error');
      setCodeInputs(['', '', '', '']);
      setTimeout(() => {
        setIsCodeCorrect(null);
      }, 2000);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      showFormMessage('Введите новый пароль', 'error');
      return;
    }
    
    if (!confirmPassword.trim()) {
      showFormMessage('Повторите новый пароль', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      showFormMessage('Пароль должен содержать минимум 6 символов', 'error');
      return;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      showFormMessage('Пароль должен содержать хотя бы одну заглавную букву', 'error');
      return;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showFormMessage('Пароль должен содержать хотя бы один специальный символ (!@#$%^&*(),.?":{}|<>)', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showFormMessage('Пароли не совпадают. Проверьте правильность ввода', 'error');
      return;
    }
    

    updateUserPassword(currentPhone, newPassword, testDB);
    
    showFormMessage('Пароль успешно изменен! Теперь вы можете войти в систему с новым паролем', 'success');
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    
    
    let code = testDB.codes[currentPhone];
    
    if (!code) {
      
      code = Math.floor(1000 + Math.random() * 9000).toString();
      testDB.codes[currentPhone] = code;
    }
    
    console.log('');
    console.log('==================================================');
    console.log('                ПОВТОРНАЯ ОТПРАВКА КОДА');
    console.log('==================================================');
    console.log('');
    console.log('📱 Номер телефона: ' + currentPhone);
    console.log('🔑 Код для ввода: ' + code);
    console.log('');
    console.log('✅ Код повторно отправлен на номер ' + currentPhone);
    console.log('');
    
    showFormMessage('Код был повторно отправлен на ваш номер телефона', 'success');
    setCountdown(30);
  };

  const handleChangePhone = () => {
    setCurrentStep('phone');
    setCurrentPhone('');
    setCodeInputs(['', '', '', '']);
    setCountdown(0);
    setIsCodeCorrect(null);
  };

  const handleCodeInputChange = (index: number, value: string) => {
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);
    
    
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    
    if (e.key === 'Backspace' && codeInputs[index] === '' && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        
        const newInputs = [...codeInputs];
        newInputs[index - 1] = '';
        setCodeInputs(newInputs);
      }
    }
    
    
    if (e.key === 'Backspace' && codeInputs[index] !== '') {
      if (e.repeat) {
        
        setCodeInputs(['', '', '', '']);
        const firstInput = document.querySelector(`input[data-index="0"]`) as HTMLInputElement;
        if (firstInput) firstInput.focus();
        
        e.preventDefault();
      }
    }
    

    if (e.key === 'Backspace' && index === 0 && codeInputs[index] === '') {
      setCodeInputs(['', '', '', '']);
      e.preventDefault();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    
    if (/^\d{4}$/.test(pastedData)) {
      const newInputs = pastedData.split('');
      setCodeInputs([...newInputs, '', '', '', ''].slice(0, 4));
    }
  };

  return (
    <>
      <Header />
      
      <main className="main container">
        <div className="main__container">
          <AnimatePresence mode="wait">
            {currentStep === 'phone' && (
              <motion.div 
                key="phone"
                className="form-container form-container--active"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="20.833" fill="#EEF4F7"/>
                  <path d="M26.736 31.076a.868.868 0 1 0 0 1.736h4.34c.96 0 1.736-.777 1.736-1.736V18.923c0-.959-.777-1.736-1.736-1.736h-4.34a.868.868 0 1 0 0 1.736h4.34v12.153z" fill="#4472B8"/>
                  <path d="M28.224 25.608a.87.87 0 0 0 .248-.606v-.005a.87.87 0 0 0-.254-.611l-3.472-3.472a.868.868 0 1 0-1.228 1.227l1.99 1.99h-8.32a.868.868 0 1 0 0 1.737h8.32l-1.99 1.99a.868.868 0 1 0 1.228 1.227l3.471-3.471z" fill="#4472B8"/>
                </svg>

                <h2 className="form-container__title">Восстановление пароля</h2>
                <p className="form-container__description">Укажите номер телефона, который вы использовали при регистрации. Мы отправим на него код для сброса пароля.</p>

                <FormMessage 
                  message={message} 
                  type={messageType} 
                  isVisible={showMessage} 
                />

                <form className="form" onSubmit={handleGetCode}>
                  <div className="form__group">
                    <input 
                      type="tel" 
                      className="form__input" 
                      placeholder=" " 
                      value={currentPhone}
                      onChange={(e) => setCurrentPhone(e.target.value)}
                      required 
                    />
                    <label className="form__label">Номер телефона</label>
                  </div>

                  <button type="submit" className="form__button form__button--login">
                    Получить код
                  </button>
                </form>

                <div className="form-container__footer">
                  <p className="form-container__text">Еще не зарегистрированы?</p>
                  <button 
                    className="form__button form-container__button"
                    onClick={() => navigate('/registration')}
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'code' && (
              <motion.div 
                key="code"
                className="form-container"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="20.833" fill="#EEF4F7"/>
                  <path d="M26.736 31.076a.868.868 0 1 0 0 1.736h4.34c.96 0 1.736-.777 1.736-1.736V18.923c0-.959-.777-1.736-1.736-1.736h-4.34a.868.868 0 1 0 0 1.736h4.34v12.153z" fill="#4472B8"/>
                  <path d="M28.224 25.608a.87.87 0 0 0 .248-.606v-.005a.87.87 0 0 0-.254-.611l-3.472-3.472a.868.868 0 1 0-1.228 1.227l1.99 1.99h-8.32a.868.868 0 1 0 0 1.737h8.32l-1.99 1.99a.868.868 0 1 0 1.228 1.227l3.471-3.471z" fill="#4472B8"/>
                </svg>

                <h2 className="form-container__title">Введите код</h2>
                <p className="form-container__description">Мы отправили код на номер <span>{currentPhone}</span></p>

                <FormMessage 
                  message={message} 
                  type={messageType} 
                  isVisible={showMessage} 
                />

                <form className="form" onSubmit={handleCodeSubmit}>
                  <div className="code-input-container" onPaste={handleCodePaste}>
                    {codeInputs.map((value, index) => (
                      <input
                        key={index}
                        type="text"
                        className={`code-input ${
                          isCodeCorrect === true ? 'code-input--correct' : 
                          isCodeCorrect === false ? 'code-input--incorrect' : ''
                        }`}
                        maxLength={1}
                        data-index={index}
                        value={value}
                        onChange={(e) => handleCodeInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        autoComplete="off"
                      />
                    ))}
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="form__button form__button--login">
                      Подтвердить
                    </button>
                    <button 
                      type="button" 
                      className="form__button form__button--secondary"
                      onClick={handleResendCode}
                      disabled={countdown > 0}
                    >
                      {countdown > 0 ? `Отправить код ещё раз (${countdown}s)` : 'Отправить код ещё раз'}
                    </button>
                    <button 
                      type="button" 
                      className="form__button form__button--secondary"
                      onClick={handleChangePhone}
                    >
                      Изменить номер телефона
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === 'password' && (
              <motion.div 
                key="password"
                className="form-container"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="20.833" fill="#EEF4F7"/>
                  <path d="M26.736 31.076a.868.868 0 1 0 0 1.736h4.34c.96 0 1.736-.777 1.736-1.736V18.923c0-.959-.777-1.736-1.736-1.736h-4.34a.868.868 0 1 0 0 1.736h4.34v12.153z" fill="#4472B8"/>
                  <path d="M28.224 25.608a.87.87 0 0 0 .248-.606v-.005a.87.87 0 0 0-.254-.611l-3.472-3.472a.868.868 0 1 0-1.228 1.227l1.99 1.99h-8.32a.868.868 0 1 0 0 1.737h8.32l-1.99 1.99a.868.868 0 1 0 1.228 1.227l3.471-3.471z" fill="#4472B8"/>
                </svg>

                <h2 className="form-container__title">Новый пароль</h2>
                <p className="form-container__description">Придумайте новый пароль для вашего аккаунта</p>

                <FormMessage 
                  message={message} 
                  type={messageType} 
                  isVisible={showMessage} 
                />

                <form className="form" onSubmit={handlePasswordSubmit}>
                  <div className="form__group">
                    <input 
                      type={passwordToggle.isVisible ? 'text' : 'password'}
                      className="form__input" 
                      placeholder=" " 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required 
                    />
                    <label className="form__label">Новый пароль</label>
                    <PasswordToggle 
                      isVisible={passwordToggle.isVisible} 
                      onToggle={passwordToggle.toggle} 
                    />
                  </div>

                  <div className="form__group">
                    <input 
                      type={confirmPasswordToggle.isVisible ? 'text' : 'password'}
                      className="form__input" 
                      placeholder=" " 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                    <label className="form__label">Повторите новый пароль</label>
                    <PasswordToggle 
                      isVisible={confirmPasswordToggle.isVisible} 
                      onToggle={confirmPasswordToggle.toggle} 
                    />
                  </div>

                  <button type="submit" className="form__button form__button--login">
                    Изменить пароль
                  </button>
                </form>

                <div className="form-container__footer">
                  <p className="form-container__text">Вспомнили пароль?</p>
                  <button 
                    className="form__button form-container__button"
                    onClick={() => navigate('/')}
                  >
                    Войти в систему
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ForgotPassword;
