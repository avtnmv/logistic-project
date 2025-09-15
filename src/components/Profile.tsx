import React, { useEffect, useState } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSidebar } from '../contexts/SidebarContext';
import VerificationForm, { VerificationFormData } from './VerificationForm';
import documentVerificationService from '../services/documentVerificationService';
import '../css/left-sidebar.css';
import '../css/homepage.css';

const Profile: React.FC = () => {
  const currentUser = useCurrentUser();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [userLocation, setUserLocation] = useState<string>('Определяется...');
  const [registrationDate, setRegistrationDate] = useState<string>('');
  const [showVerificationForm, setShowVerificationForm] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(245, 245, 245)';
    
    // Определяем местоположение
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Простая логика определения страны по координатам
          const { latitude, longitude } = position.coords;
          if (latitude > 35 && latitude < 45 && longitude > 55 && longitude < 75) {
            setUserLocation('Узбекистан');
          } else if (latitude > 45 && latitude < 55 && longitude > 20 && longitude < 40) {
            setUserLocation('Украина');
          } else if (latitude > 45 && latitude < 55 && longitude > 25 && longitude < 45) {
            setUserLocation('Молдова');
          } else {
            setUserLocation('Не определено');
          }
        },
        () => {
          setUserLocation('Не определено');
        }
      );
    } else {
      setUserLocation('Не поддерживается');
    }

    // Получаем дату регистрации из localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.createdAt) {
          setRegistrationDate(new Date(user.createdAt).toLocaleDateString('en-US'));
        } else {
          // Если даты нет, используем текущую дату
          setRegistrationDate(new Date().toLocaleDateString('en-US'));
        }
      } catch (e) {
        setRegistrationDate(new Date().toLocaleDateString('en-US'));
      }
    }

    return () => {
      document.body.style.backgroundColor = 'white';
    };
  }, []);

  // Отдельный useEffect для загрузки статуса верификации
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (currentUser?.id) {
        const status = await documentVerificationService.getVerificationStatus(currentUser.id);
        if (status) {
          setVerificationStatus(status.status);
        } else {
          setVerificationStatus('none');
        }
      } else {
        // Если пользователь не загружен, сбрасываем статус
        setVerificationStatus('none');
      }
    };
    
    checkVerificationStatus();
  }, [currentUser?.id]);

  const handleGetPremium = () => {
    alert('Функция получения премиум-доступа будет доступна в ближайшее время!');
  };

  const handleVerification = () => {
    setShowVerificationForm(true);
  };

  const handleVerificationSubmit = async (formData: VerificationFormData) => {
    try {
      if (!currentUser?.id) {
        alert('Ошибка: пользователь не найден');
        return;
      }

      const response = await documentVerificationService.submitVerification(currentUser.id, formData);
      
      if (response.success) {
        // Загружаем актуальный статус из localStorage
        const updatedStatus = await documentVerificationService.getVerificationStatus(currentUser.id);
        if (updatedStatus) {
          setVerificationStatus(updatedStatus.status);
        } else {
          setVerificationStatus('pending');
        }
        setShowVerificationForm(false);
      } else {
        alert(`Ошибка: ${response.message}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке верификации:', error);
      alert('Произошла ошибка при отправке документов. Попробуйте еще раз.');
    }
  };

  const handleVerificationClose = () => {
    setShowVerificationForm(false);
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
          {/* Первый блок - Верификация */}
          <div className="homepage-form-container">
            <div className="homepage-form-content">
              <div className="homepage-form-header-block">
                <div className="homepage-form-header-content">
                  <div className="verification-header">
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.654.498a.5.5 0 0 1 .692 0l3.899 3.731a.5.5 0 0 0 .464.124l5.243-1.281a.5.5 0 0 1 .598.345l1.512 5.181a.5.5 0 0 0 .34.34l5.18 1.512a.5.5 0 0 1 .346.598l-1.281 5.243a.5.5 0 0 0 .124.464l3.731 3.9a.5.5 0 0 1 0 .691l-3.73 3.9a.5.5 0 0 0-.125.464l1.281 5.242a.5.5 0 0 1-.345.599l-5.181 1.511a.5.5 0 0 0-.34.34l-1.511 5.181a.5.5 0 0 1-.6.346l-5.242-1.282a.5.5 0 0 0-.464.125l-3.9 3.73a.5.5 0 0 1-.69 0l-3.9-3.73a.5.5 0 0 0-.465-.125l-5.242 1.282a.5.5 0 0 1-.599-.346l-1.511-5.18a.5.5 0 0 0-.34-.34L3.417 31.55a.5.5 0 0 1-.346-.599l1.282-5.242a.5.5 0 0 0-.124-.465L.497 21.346a.5.5 0 0 1 0-.691l3.732-3.9a.5.5 0 0 0 .124-.464l-1.282-5.243a.5.5 0 0 1 .346-.598l5.181-1.512a.5.5 0 0 0 .34-.34l1.511-5.18a.5.5 0 0 1 .599-.346l5.242 1.281a.5.5 0 0 0 .465-.124z" fill="#3796F8"/>
                      <path d="M28.521 15.142a.87.87 0 0 1 .072 1.226l-9.259 10.416a.868.868 0 0 1-1.298 0l-4.63-5.208a.868.868 0 1 1 1.298-1.154l3.981 4.479 8.61-9.687a.87.87 0 0 1 1.226-.072" fill="#fff"/>
                    </svg>
                    <div>
                      <h2>Пройдите верификацию и выделяйтесь</h2>
                      <p>Верификация не обязательна — вы можете пользоваться платформой и без неё. Но проверенные участники получают значок доверия и приоритет у других пользователей.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="verification-blocks-row verification-blocks-spacing">
                <div className="verification-block">
                  <div className="verification-block-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#EDFFC6"/>
                      <path d="M12 5.667c.253 0 .483.143.597.369l1.719 3.438 3.78.55a.667.667 0 0 1 .37 1.137l-2.752 2.683.62 3.782a.667.667 0 0 1-.971.697L12 16.538l-3.362 1.785a.667.667 0 0 1-.97-.697l.618-3.782-2.751-2.683a.667.667 0 0 1 .37-1.137l3.78-.55 1.719-3.438A.67.67 0 0 1 12 5.667m0 2.157-1.278 2.558a.67.67 0 0 1-.5.361l-2.79.406 2.034 1.982c.155.152.227.37.192.585L9.2 16.515l2.488-1.32a.67.67 0 0 1 .625 0l2.487 1.32-.458-2.799a.67.67 0 0 1 .193-.585l2.033-1.982-2.789-.406a.67.67 0 0 1-.5-.361z" fill="#72AA0C"/>
                    </svg>
                    <h3>Получите значок «Верифицирован»</h3>
                  </div>
                  <p>Верификация не обязательна — вы можете пользоваться платформой и без неё. Но проверенные участники получают значок доверия и приоритет у других пользователей.</p>
                </div>

                <div className="verification-block">
                  <div className="verification-block-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#EDFFC6"/>
                      <path d="M12 5.667c.253 0 .483.143.597.369l1.719 3.438 3.78.55a.667.667 0 0 1 .37 1.137l-2.752 2.683.62 3.782a.667.667 0 0 1-.971.697L12 16.538l-3.362 1.785a.667.667 0 0 1-.97-.697l.618-3.782-2.751-2.683a.667.667 0 0 1 .37-1.137l3.78-.55 1.719-3.438A.67.67 0 0 1 12 5.667m0 2.157-1.278 2.558a.67.67 0 0 1-.5.361l-2.79.406 2.034 1.982c.155.152.227.37.192.585L9.2 16.515l2.488-1.32a.67.67 0 0 1 .625 0l2.487 1.32-.458-2.799a.67.67 0 0 1 .193-.585l2.033-1.982-2.789-.406a.67.67 0 0 1-.5-.361z" fill="#72AA0C"/>
                    </svg>
                    <h3>Приоритет в поиске и сделках</h3>
                  </div>
                  <p>В фильтрах заказов есть пункт «Только верифицированные». Вы будете попадать под этот фильтр, что увеличит шансы, что выберут именно ваш заказ.</p>
                </div>
              </div>
              
              <div className="verification-actions">
                {verificationStatus === 'none' && (
                  <button className="btn btn-primary verification-btn" onClick={handleVerification}>
                    Пройти верификацию
                  </button>
                )}
                {verificationStatus === 'pending' && (
                  <div className="verification-pending">
                    <div className="verification-pending-content">
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                      </div>
                      <div className="verification-pending-text">
                        <h4>Документы на рассмотрении</h4>
                        <p>Мы проверяем ваши документы. Это может занять 1-3 рабочих дня.</p>
                        <div className="progress-bar">
                          <div className="progress-fill"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {verificationStatus === 'approved' && (
                  <div className="verification-success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#EDFFC6"/>
                      <path d="M17.7763 7.50141C18.0514 7.74602 18.0762 8.1674 17.8316 8.44259L10.7205 16.4426C10.594 16.5849 10.4127 16.6663 10.2222 16.6663C10.0318 16.6663 9.85047 16.5849 9.72396 16.4426L6.1684 12.4426C5.92379 12.1674 5.94858 11.746 6.22376 11.5014C6.49895 11.2568 6.92033 11.2816 7.16495 11.5568L10.2222 14.9962L16.8351 7.55677C17.0797 7.28158 17.5011 7.2568 17.7763 7.50141Z" fill="#72AA0C"/>
                    </svg>
                    <span>Верификация пройдена успешно!</span>
                  </div>
                )}
                {verificationStatus === 'rejected' && (
                  <button className="btn btn-primary verification-btn" onClick={handleVerification}>
                    Повторить верификацию
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Форма верификации */}
          {showVerificationForm && (
            <VerificationForm
              onClose={handleVerificationClose}
              onSubmit={handleVerificationSubmit}
              isInline={true}
            />
          )}

          {/* Второй блок - Премиум подписка */}
          <div className="homepage-form-container">
            <div className="homepage-form-content">
              <div className="homepage-form-header-block">
                <div className="homepage-form-header-content">
                  <h2>Получить полный доступ</h2>
                  <p>Получите полный доступ к информации с нашим безлимитным пакетом — всего 9.99 USD в месяц</p>
                </div>
              </div>
              
              <div className="premium-section">
                <div className="premium-info">
                  <div className="premium-package">
                    <div className="premium-title">
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="60" height="60" rx="5" fill="#fff"/>
                        <path d="M20.667 40.667V38h18.667v2.667zm0-4.667-1.7-10.7a1 1 0 0 0-.15.018.7.7 0 0 1-.15.016 1.93 1.93 0 0 1-1.416-.584 1.94 1.94 0 0 1-.584-1.416q0-.833.584-1.416a1.93 1.93 0 0 1 1.416-.584q.83 0 1.417.584.587.583.583 1.416 0 .233-.05.433a3 3 0 0 1-.117.367L24.667 26l4.167-5.7a2.05 2.05 0 0 1-.6-.7 1.94 1.94 0 0 1-.234-.933q0-.834.584-1.417.585-.585 1.416-.583a1.94 1.94 0 0 1 1.418.584q.585.582.582 1.416 0 .5-.233.933a2.05 2.05 0 0 1-.6.7l4.167 5.7 4.166-1.866a3 3 0 0 1-.117-.367 1.7 1.7 0 0 1-.05-.433q0-.834.585-1.418.584-.583 1.416-.582a1.94 1.94 0 0 1 1.417.584q.585.582.583 1.416a1.95 1.95 0 0 1-.583 1.417q-.581.585-1.417.583a1 1 0 0 1-.15-.016 1 1 0 0 0-.15-.018l-1.7 10.7z" fill="#0F53FA"/>
                      </svg>
                      <div className="premium-title-content">
                        <h3>Yangi Osiyo Premium</h3>
                        <p>Полный доступ к всей информации в одном пакете</p>
                      </div>
                    </div>
                    <ul>
                      <li>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#EDFFC6"/>
                          <path d="M17.7763 7.50141C18.0514 7.74602 18.0762 8.1674 17.8316 8.44259L10.7205 16.4426C10.594 16.5849 10.4127 16.6663 10.2222 16.6663C10.0318 16.6663 9.85047 16.5849 9.72396 16.4426L6.1684 12.4426C5.92379 12.1674 5.94858 11.746 6.22376 11.5014C6.49895 11.2568 6.92033 11.2816 7.16495 11.5568L10.2222 14.9962L16.8351 7.55677C17.0797 7.28158 17.5011 7.2568 17.7763 7.50141Z" fill="#72AA0C"/>
                        </svg>
                        Добавление неограниченного количества грузов и транспорта
                      </li>
                      <li>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#EDFFC6"/>
                          <path d="M17.7763 7.50141C18.0514 7.74602 18.0762 8.1674 17.8316 8.44259L10.7205 16.4426C10.594 16.5849 10.4127 16.6663 10.2222 16.6663C10.0318 16.6663 9.85047 16.5849 9.72396 16.4426L10.7222 14.9962L16.8351 7.55677C17.0797 7.28158 17.5011 7.2568 17.7763 7.50141Z" fill="#72AA0C"/>
                        </svg>
                        Доступ к детальной информации о грузах и транспорте (включено 3 пользователя для бизнес-аккаунта)
                      </li>
                    </ul>
                  </div>
                  
                  <div className="premium-pricing">
                    <div className="price-block">
                      <div className="price">9.99$/месяц</div>
                      <p className="price-note">*Платёж будет списываться автоматически каждый месяц. Отменить подписку можно в любой момент.</p>
                    </div>
                    <button className="btn btn-primary premium-btn" onClick={handleGetPremium}>
                      Получить премиум
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Третий блок - Общая информация */}
          <div className="homepage-form-container">
            <div className="homepage-form-content">
              <div className="homepage-form-header-block">
                <div className="homepage-form-header-content">
                  <h2>Общая информация</h2>
                  <p>Здесь отображается основная информация о вашем профиле. Эти данные видны другим пользователям.</p>
                </div>
              </div>
              
              <div className="general-info-content">
                <div className="user-profile-section">
                  <div className="user-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#3796F8"/>
                    </svg>
                  </div>
                  <div className="user-details">
                    <div className="user-name-section">
                      <h3>{currentUser?.firstName ? currentUser.firstName.toUpperCase() : 'НЕ УКАЗАНО'} {currentUser?.lastName ? currentUser.lastName.toUpperCase() : ''}</h3>
                    </div>
                    <div className="user-info-row">
                      <span className="user-location">Местоположение: {userLocation}</span>
                      <span className="user-registration">Дата регистрации: {registrationDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Четвертый блок - Контактная информация */}
          <div className="homepage-form-container">
            <div className="homepage-form-content">
              <div className="homepage-form-header-block">
                <div className="homepage-form-header-content">
                  <h2>Контактная информация</h2>
                  <p>Основной E-mail используется для входа на сайт, а также для получения важных сообщений на почту.</p>
                </div>
              </div>
              
              <div className="contact-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Телефон</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      value={currentUser?.phone || ''} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>E-mail</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={currentUser?.email || ''} 
                      placeholder="Не указан"
                      readOnly 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-field">
                    <label>Имя</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={currentUser?.firstName || ''} 
                      placeholder="Не указано"
                      readOnly 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Фамилия</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={currentUser?.lastName || ''} 
                      placeholder="Не указано"
                      readOnly 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
