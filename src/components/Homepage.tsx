import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSidebar } from '../contexts/SidebarContext';
import '../css/left-sidebar.css';
import '../css/homepage.css';

const Homepage: React.FC = () => {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [activeForm, setActiveForm] = useState<'cards' | 'add-cargo' | 'add-transport'>('cards');

  // Обработка query параметров для определения активной формы
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const formParam = searchParams.get('form');
    
    if (formParam === 'cargo') {
      setActiveForm('add-cargo');
      // Сбрасываем состояния габаритов при переключении
      setShowCargoDimensions(false);
      setShowTransportDimensions(false);
    } else if (formParam === 'transport') {
      setActiveForm('add-transport');
      // Сбрасываем состояния габаритов при переключении
      setShowCargoDimensions(false);
      setShowTransportDimensions(false);
    } else {
      setActiveForm('cards');
    }
  }, [location.search]);
  const [loadingCity, setLoadingCity] = useState('');
  const [unloadingCity, setUnloadingCity] = useState('');
  const [showLoadingSuggestions, setShowLoadingSuggestions] = useState(false);
  const [showUnloadingSuggestions, setShowUnloadingSuggestions] = useState(false);
  
  // Состояния для дат загрузки
  const [loadingStartDate, setLoadingStartDate] = useState('');
  const [loadingEndDate, setLoadingEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  // Состояния для формы "Добавить груз"
  const [showCargoDimensions, setShowCargoDimensions] = useState(false);
  
  // Состояния для формы "Добавить транспорт"
  const [showTransportDimensions, setShowTransportDimensions] = useState(false);
  
  // Данные текущего пользователя
  const currentUser = useCurrentUser();
  
  // Состояние для select элементов (общие для обеих форм)
  const [selectedValues, setSelectedValues] = useState({
    loadingType: '',
    cargoType: '',
    vehicleType: '',
    reloadType: '',
    paymentMethod: '',
    paymentTerm: '',
    bargain: ''
  });
  
  // Состояния для всех полей форм
  const [formData, setFormData] = useState({
    // Общие поля
    loadingStartDate: '',
    loadingEndDate: '',
    loadingCity: '',
    unloadingCity: '',
    
    // Поля для груза
    cargoWeight: '',
    cargoVolume: '',
    vehicleCount: '',
    cargoLength: '',
    cargoWidth: '',
    cargoHeight: '',
    cargoPrice: '',
    cargoCurrency: 'USD',
    
    // Поля для транспорта
    transportWeight: '',
    transportVolume: '',
    transportLength: '',
    transportWidth: '',
    transportHeight: '',
    transportPrice: '',
    transportCurrency: 'USD',
    
    // Контактная информация
    additionalPhone: '',
    email: '',
    
    // Дополнительная информация
    additionalInfo: ''
  });
  
  // Состояние для карточки
  const [showCard, setShowCard] = useState(false);
  const [currentCard, setCurrentCard] = useState<any>(null);

  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [shakeFields, setShakeFields] = useState<{[key: string]: boolean}>({});
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

    // База данных городов
  const citiesDatabase = [
    'Киев, Украина',
    'Кишинев, Молдова',
    'Киров, Россия',
    'Кировоград, Украина',
    'Москва, Россия',
    'Санкт-Петербург, Россия',
    'Ташкент, Узбекистан',
    'Самарканд, Узбекистан',
    'Бухара, Узбекистан',
    'Алматы, Казахстан',
    'Астана, Казахстан',
    'Минск, Беларусь',
    'Вильнюс, Литва',
    'Рига, Латвия',
    'Таллин, Эстония'
  ];

  // Функция для расчета времени назад
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) {
      if (diffInMinutes === 1) return '1 минуту назад';
      if (diffInMinutes < 5) return `${diffInMinutes} минуты назад`;
      return `${diffInMinutes} минут назад`;
    }
    
    if (diffInHours < 24) {
      if (diffInHours === 1) return '1 час назад';
      if (diffInHours < 5) return `${diffInHours} часа назад`;
      return `${diffInHours} часов назад`;
    }
    
    if (diffInDays < 7) {
      if (diffInDays === 1) return '1 день назад';
      if (diffInDays < 5) return `${diffInDays} дня назад`;
      return `${diffInDays} дней назад`;
    }
    
    return date.toLocaleDateString('ru-RU');
  };

  // Функция для расчета расстояния между городами
  const calculateDistance = (city1: string, city2: string): number => {
    // Простая база данных расстояний между городами (в км)
    const distances: { [key: string]: { [key: string]: number } } = {
      'Кишинев': {
        'Кировоград': 850,
        'Киев': 650,
        'Москва': 1200,
        'Санкт-Петербург': 1800
      },
      'Кировоград': {
        'Кишинев': 850,
        'Киев': 250,
        'Москва': 800,
        'Санкт-Петербург': 1400
      },
      'Киев': {
        'Кишинев': 650,
        'Кировоград': 250,
        'Москва': 750,
        'Санкт-Петербург': 1350
      },
      'Москва': {
        'Кишинев': 1200,
        'Кировоград': 800,
        'Киев': 750,
        'Санкт-Петербург': 650
      }
    };

    // Если есть точное расстояние, возвращаем его
    if (distances[city1] && distances[city1][city2]) {
      return distances[city1][city2];
    }
    if (distances[city2] && distances[city2][city1]) {
      return distances[city2][city1];
    }

    // Если точного расстояния нет, возвращаем фиксированное значение
    return 500; // Фиксированное расстояние для неизвестных маршрутов
  };

  // Функция для переключения развернутого состояния карточки
  const toggleCardExpanded = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  // Функция для удаления карточки
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      setDeletingCardId(cardId);
      
      // Удаляем из localStorage
      const storageKey = `transportCards_${currentUser?.id}`;
      const userCards = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedCards = userCards.filter((card: any) => card.id !== cardId);
      localStorage.setItem(storageKey, JSON.stringify(updatedCards));
      
      // Также удаляем из общего хранилища
      const allCards = JSON.parse(localStorage.getItem('transportCards') || '[]');
      const updatedAllCards = allCards.filter((card: any) => card.id !== cardId);
      localStorage.setItem('transportCards', JSON.stringify(updatedAllCards));
      
      setTimeout(() => {
        setDeletingCardId(null);
        // Обновляем состояние для перерисовки без перезагрузки
        setActiveForm('cards');
      }, 300);
    }
  };

  // Функции для преобразования значений в понятные названия
  const getCargoTypeName = (value: string): string => {
    const cargoTypes: { [key: string]: string } = {
      'pallets': 'Груз на паллетах',
      'equipment': 'Оборудование',
      'construction': 'Стройматериалы',
      'metal': 'Металл',
      'metal-products': 'Металлопрокат',
      'pipes': 'Трубы',
      'food': 'Продукты',
      'big-bags': 'Груз в биг-бэгах',
      'container': 'Контейнер',
      'cement': 'Цемент',
      'bitumen': 'Битум',
      'fuel': 'ГСМ',
      'flour': 'Мука',
      'oversized': 'Негабарит',
      'cars': 'Автомобили',
      'lumber': 'Пиломатериалы',
      'concrete': 'Бетонные изделия',
      'furniture': 'Мебель',
      'other': 'Другой тип'
    };
    return cargoTypes[value] || value;
  };

  const getVehicleTypeName = (value: string): string => {
    const vehicleTypes: { [key: string]: string } = {
      'tent': 'Тент',
      'isotherm': 'Изотерм',
      'refrigerator': 'Рефрижератор',
      'flatbed': 'Бортовой',
      'car-carrier': 'Автовоз',
      'platform': 'Платформа',
      'cement-truck': 'Цементовоз',
      'bitumen-truck': 'Битумовоз',
      'fuel-truck': 'Бензовоз',
      'flour-truck': 'Муковоз',
      'tow-truck': 'Эвакуатор',
      'timber-truck': 'Лесовоз',
      'grain-truck': 'Зерновоз',
      'trailer': 'Трал',
      'dump-truck': 'Самосвал',
      'container-truck': 'Контейнеровоз',
      'oversized-truck': 'Негабарит',
      'bus': 'Автобус',
      'gas-truck': 'Газовоз',
      'other-truck': 'Другой тип'
    };
    return vehicleTypes[value] || value;
  };

  const getReloadTypeName = (value: string): string => {
    const reloadTypes: { [key: string]: string } = {
      'no-reload': 'Без догрузки (отдельное авто)',
      'possible-reload': 'Возможна дозагрузка'
    };
    return reloadTypes[value] || value;
  };

  // Изменяем цвет фона при входе в кабинет
  useEffect(() => {
    document.body.style.backgroundColor = '#F5F5F5';
    
    // Возвращаем белый фон при размонтировании компонента
    return () => {
      document.body.style.backgroundColor = 'white';
    };
  }, []);

  // Автоматически переключаемся на вкладку карточек при переходе на /my-transports
  useEffect(() => {
    if (location.pathname === '/my-transports') {
      setActiveForm('cards');
      return;
    }

    if (location.pathname === '/homepage') {
      const params = new URLSearchParams(location.search);
      const formParam = params.get('form');
      if (formParam === 'add-cargo') {
        setActiveForm('add-cargo');
        setShowCargoDimensions(false);
        setShowTransportDimensions(false);
      } else if (formParam === 'add-transport') {
        setActiveForm('add-transport');
        setShowCargoDimensions(false);
        setShowTransportDimensions(false);
      }
    }
  }, [location.pathname, location.search]);

  // Миграция существующих карточек при загрузке
  useEffect(() => {
    if (currentUser?.id) {
      // Миграция карточек
      
      const allCards = JSON.parse(localStorage.getItem('transportCards') || '[]');
      const userCards = allCards.filter((card: any) => card.userId === currentUser.id);
      
      if (userCards.length > 0) {
        // Сохраняем карточки пользователя в отдельное хранилище
        const storageKey = `transportCards_${currentUser.id}`;
        localStorage.setItem(storageKey, JSON.stringify(userCards));
        // Миграция завершена
      }
    }
  }, [currentUser]);

  // Обработка кликов вне поп-апа автокомплита
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.form-field')) {
        setShowLoadingSuggestions(false);
        setShowUnloadingSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // Функции для автокомплита
  const filterCities = (query: string) => {
    if (!query.trim()) return [];
    return citiesDatabase.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleCitySelect = (city: string, isLoading: boolean) => {
    if (isLoading) {
      setLoadingCity(city);
      setFormData(prev => ({ ...prev, loadingCity: city }));
      setShowLoadingSuggestions(false);
    } else {
      setUnloadingCity(city);
      setFormData(prev => ({ ...prev, unloadingCity: city }));
      setShowUnloadingSuggestions(false);
    }
  };

  // Обработчики для полей городов
  const handleLoadingCityChange = (value: string) => {
    setLoadingCity(value);
    setFormData(prev => ({ ...prev, loadingCity: value }));
    setShowLoadingSuggestions(value.length > 0);
    
    // Очищаем ошибку для этого поля
    if (validationErrors.loadingCity) {
      setValidationErrors(prev => ({ ...prev, loadingCity: false }));
    }
  };

  const handleUnloadingCityChange = (value: string) => {
    setUnloadingCity(value);
    setFormData(prev => ({ ...prev, unloadingCity: value }));
    setShowUnloadingSuggestions(value.length > 0);
    
    // Очищаем ошибку для этого поля
    if (validationErrors.unloadingCity) {
      setValidationErrors(prev => ({ ...prev, unloadingCity: false }));
    }
  };

  const handleClickOutside = () => {
    setShowLoadingSuggestions(false);
    setShowUnloadingSuggestions(false);
  };

  const handleSelectChange = (field: string, value: string) => {
    setSelectedValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку для этого поля
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };
  
  // Валидация дат загрузки
  const validateDates = (startDate: string, endDate: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start < today) {
      setDateError('Дата начала загрузки не может быть раньше сегодняшнего дня');
      return false;
    }
    
    if (end < start) {
      setDateError('Дата окончания загрузки не может быть раньше даты начала');
      return false;
    }
    
    setDateError('');
    return true;
  };
  
  // Обработчик изменения даты начала
  const handleStartDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, loadingStartDate: date }));
    if (formData.loadingEndDate && !validateDates(date, formData.loadingEndDate)) {
      setLoadingEndDate('');
      setFormData(prev => ({ ...prev, loadingEndDate: '' }));
    }
  };
  
  // Обработчик изменения даты окончания
  const handleEndDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, loadingEndDate: date }));
    if (formData.loadingStartDate) {
      validateDates(formData.loadingStartDate, date);
    }
  };
  
  // Валидация обязательных полей для груза
  const validateCargoForm = () => {
    const errors: {[key: string]: boolean} = {};
    const requiredFields = [
      'loadingStartDate',
      'loadingEndDate', 
      'loadingCity',
      'unloadingCity',
      'cargoWeight',
      'cargoVolume'
    ];
    
    // Проверяем поля формы
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData] === '') {
        errors[field] = true;
      }
    }
    
    // Проверяем select поля
    if (!selectedValues.loadingType) {
      errors['loadingType'] = true;
    }
    if (!selectedValues.cargoType) {
      errors['cargoType'] = true;
    }
    
    setValidationErrors(errors);
    
    // Если есть ошибки, запускаем анимацию тряски
    if (Object.keys(errors).length > 0) {
      setShakeFields(errors);
      setTimeout(() => setShakeFields({}), 600);
    }
    
    return Object.keys(errors).length === 0;
  };

  // Валидация обязательных полей для транспорта
  const validateTransportForm = () => {
    const errors: {[key: string]: boolean} = {};
    const requiredFields = [
      'loadingStartDate',
      'loadingEndDate',
      'loadingCity', 
      'unloadingCity',
      'transportWeight',
      'transportVolume'
    ];
    
    // Проверяем поля формы
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData] === '') {
        errors[field] = true;
      }
    }
    
    // Проверяем select поля
    if (!selectedValues.vehicleType) {
      errors['vehicleType'] = true;
    }
    
    setValidationErrors(errors);
    
    // Если есть ошибки, запускаем анимацию тряски
    if (Object.keys(errors).length > 0) {
      setShakeFields(errors);
      setTimeout(() => setShakeFields({}), 600);
    }
    
    return Object.keys(errors).length === 0;
  };

  // Создание карточки

  const createCard = (type: 'cargo' | 'transport') => {
    // Отладочная информация отключена
    
    // Проверяем, что пользователь авторизован
    if (!currentUser || !currentUser.id) {
      // Попробуем исправить пользователя, если у него нет ID
      if (currentUser && !currentUser.id) {
        // Исправляем пользователя
        const fixedUser = {
          ...currentUser,
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        // Обновляем в localStorage
        localStorage.setItem('currentUser', JSON.stringify(fixedUser));
        // Пользователь исправлен
        
        // Обновляем состояние
        window.location.reload(); // Перезагружаем страницу для применения изменений
        return;
      }
      
      alert('Пожалуйста, войдите в систему для создания заявки');
      // Пользователь не авторизован
      return;
    }
    
    // Проверяем валидацию в зависимости от типа карточки
    if (type === 'cargo' && !validateCargoForm()) {
      alert('Пожалуйста, заполните все обязательные поля для создания карточки груза');
      return;
    }
    
    if (type === 'transport' && !validateTransportForm()) {
      alert('Пожалуйста, заполните все обязательные поля для создания карточки транспорта');
      return;
    }

    // Создание карточки

    const cardData = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      createdAt: new Date().toISOString(),
      status: 'Активна',
      userId: currentUser?.id || '',
      ...formData,
      ...selectedValues,
      mainPhone: currentUser?.phone || '',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Пользователь'
    };
    
    setCurrentCard(cardData);
    setShowCard(true);
    
    // Сохраняем карточки для конкретного пользователя
    const storageKey = `transportCards_${currentUser.id}`;
    const existingCards = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Добавляем новую карточку
    existingCards.push(cardData);
    localStorage.setItem(storageKey, JSON.stringify(existingCards));
    
    // Также сохраняем в общий список для обратной совместимости
    const allCards = JSON.parse(localStorage.getItem('transportCards') || '[]');
    allCards.push(cardData);
    localStorage.setItem('transportCards', JSON.stringify(allCards));
    
    // Принудительно обновляем пользовательское хранилище
    const updatedUserCards = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify(updatedUserCards));
    
    // Карточка сохранена
    
    // Сброс формы
    setActiveForm('cards');
    setFormData({
      loadingStartDate: '',
      loadingEndDate: '',
      loadingCity: '',
      unloadingCity: '',
      cargoWeight: '',
      cargoVolume: '',
      vehicleCount: '',
      cargoLength: '',
      cargoWidth: '',
      cargoHeight: '',
      cargoPrice: '',
      cargoCurrency: 'USD',
      transportWeight: '',
      transportVolume: '',
      transportLength: '',
      transportWidth: '',
      transportHeight: '',
      transportPrice: '',
      transportCurrency: 'USD',
      additionalPhone: '',
      email: '',
      additionalInfo: ''
    });
    setSelectedValues({
      loadingType: '',
      cargoType: '',
      vehicleType: '',
      reloadType: '',
      paymentMethod: '',
      paymentTerm: '',
      bargain: ''
    });
    setShowCargoDimensions(false);
    setShowTransportDimensions(false);
    setLoadingCity('');
    setUnloadingCity('');
    setDateError('');
  };

  const renderContent = () => {
    switch (activeForm) {
              case 'add-cargo':
          return (
            <>
                                          <div className="homepage-form-header-block cargo-form-header">
                <div className="homepage-form-header-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#000000" fill="none">
                    <path d="M12 22c-.818 0-1.6-.33-3.163-.99C4.946 19.366 3 18.543 3 17.16V7m9 15c.818 0 1.6-.33 3.163-.99C19.054 19.366 21 18.543 21 17.16V7m-9 15V11.355M8.326 9.691 5.405 8.278C3.802 7.502 3 7.114 3 6.5s.802-1.002 2.405-1.778l2.92-1.413C10.13 2.436 11.03 2 12 2s1.871.436 3.674 1.309l2.921 1.413C20.198 5.498 21 5.886 21 6.5s-.802 1.002-2.405 1.778l-2.92 1.413C13.87 10.564 12.97 11 12 11s-1.871-.436-3.674-1.309M6 12l2 1m9-9L7 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                
                <div className="homepage-form-header-content">
                  <h2>Добавление заявки на перевозку груза</h2>
                  <p>Укажите, пожалуйста, пункты загрузки и выгрузки, параметры груза и контактную информацию.</p>
                </div>
              </div>
              
              <div className="homepage-form-container">
                <div className="homepage-form-content">
                <h3>Информация о грузе</h3>
                <p>Укажите как можно подробнее доступную информацию о грузе.</p>
                
                <div className="form-section">
                  <div className={`form-row ${validationErrors.loadingStartDate || validationErrors.loadingEndDate ? 'error' : ''}`}>
                    <div className="form-field">
                      <label>Дни загрузки</label>
                      <div className="date-range-input">
                        <input 
                          type="date" 
                          className={`form-input ${validationErrors.loadingStartDate ? 'error' : ''} ${shakeFields.loadingStartDate ? 'shake' : ''}`}
                          value={formData.loadingStartDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, loadingStartDate: e.target.value }));
                            if (formData.loadingEndDate) {
                              validateDates(e.target.value, formData.loadingEndDate);
                            }
                            // Очищаем ошибку для этого поля
                            if (validationErrors.loadingStartDate) {
                              setValidationErrors(prev => ({ ...prev, loadingStartDate: false }));
                            }
                          }}
                        />
                        <span>-</span>
                        <input 
                          type="date" 
                          className={`form-input ${validationErrors.loadingEndDate ? 'error' : ''} ${shakeFields.loadingEndDate ? 'shake' : ''}`}
                          value={formData.loadingEndDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, loadingEndDate: e.target.value }));
                            if (formData.loadingStartDate) {
                              validateDates(formData.loadingStartDate, e.target.value);
                            }
                            // Очищаем ошибку для этого поля
                            if (validationErrors.loadingEndDate) {
                              setValidationErrors(prev => ({ ...prev, loadingEndDate: false }));
                            }
                          }}
                        />
                      </div>
                      {dateError && <div className="error-message">{dateError}</div>}
                      {(validationErrors.loadingStartDate || validationErrors.loadingEndDate) && (
                        <div className="error-message">Пожалуйста, укажите даты загрузки</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Место загрузки</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Начните вводить название" 
                        value={loadingCity}
                        onChange={(e) => {
                          setLoadingCity(e.target.value);
                          setFormData(prev => ({ ...prev, loadingCity: e.target.value }));
                          setShowLoadingSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowLoadingSuggestions(loadingCity.length > 0)}
                      />
                      {showLoadingSuggestions && (
                        <div className="autocomplete-suggestions">
                          {filterCities(loadingCity).map((city, index) => (
                            <div 
                              key={index} 
                              className="suggestion-item"
                              onClick={() => handleCitySelect(city, true)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Место выгрузки</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Начните вводить название" 
                        value={unloadingCity}
                        onChange={(e) => {
                          setUnloadingCity(e.target.value);
                          setShowUnloadingSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowUnloadingSuggestions(unloadingCity.length > 0)}
                      />
                      {showUnloadingSuggestions && (
                        <div className="autocomplete-suggestions">
                          {filterCities(unloadingCity).map((city, index) => (
                            <div 
                              key={index} 
                              className="suggestion-item"
                              onClick={() => handleCitySelect(city, false)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <button className="add-location-btn">Добавить место загрузки</button>
                    </div>
                    <div className="form-field">
                      <button className="add-location-btn">Добавить место выгрузки</button>
                    </div>
                  </div>
                </div>
                
                <hr className="form-divider" />
                
                <div className="form-section">
                  <div className="form-row">
                    <div className={`form-field ${validationErrors.loadingType ? 'error' : ''}`}>
                      <label>Тип загрузки</label>
                      <select 
                        className={`form-input ${selectedValues.loadingType ? 'has-value' : ''} ${validationErrors.loadingType ? 'error' : ''} ${shakeFields.loadingType ? 'shake' : ''}`}
                        value={selectedValues.loadingType}
                        onChange={(e) => handleSelectChange('loadingType', e.target.value)}
                      >
                        <option value="" disabled>Выберите тип</option>
                        <option value="back">Задняя</option>
                        <option value="side">Боковая</option>
                        <option value="top">Верхняя</option>
                      </select>
                      {validationErrors.loadingType && (
                        <div className="error-message">Пожалуйста, выберите тип загрузки</div>
                      )}
                    </div>
                    <div className={`form-field ${validationErrors.cargoType ? 'error' : ''}`}>
                      <label>Тип груза</label>
                      <select 
                        className={`form-input ${selectedValues.cargoType ? 'has-value' : ''} ${validationErrors.cargoType ? 'error' : ''} ${shakeFields.cargoType ? 'shake' : ''}`}
                        value={selectedValues.cargoType}
                        onChange={(e) => handleSelectChange('cargoType', e.target.value)}
                      >
                        <option value="" disabled>Укажите что за груз</option>
                        <option value="pallets">Груз на паллетах</option>
                        <option value="equipment">Оборудование</option>
                        <option value="construction">Стройматериалы</option>
                        <option value="metal">Металл</option>
                        <option value="metal-products">Металлопрокат</option>
                        <option value="pipes">Трубы</option>
                        <option value="food">Продукты</option>
                        <option value="big-bags">Груз в биг-бэгах</option>
                        <option value="container">Контейнер</option>
                        <option value="cement">Цемент</option>
                        <option value="bitumen">Битум</option>
                        <option value="fuel">ГСМ</option>
                        <option value="flour">Мука</option>
                        <option value="oversized">Негабарит</option>
                        <option value="cars">Автомобили</option>
                        <option value="lumber">Пиломатериалы</option>
                        <option value="concrete">Бетонные изделия</option>
                        <option value="furniture">Мебель</option>
                        <option value="other">Другой тип</option>
                      </select>
                      {validationErrors.cargoType && (
                        <div className="error-message">Пожалуйста, выберите тип груза</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Тип автомобиля</label>
                      <select 
                        className={`form-input ${selectedValues.vehicleType ? 'has-value' : ''}`}
                        value={selectedValues.vehicleType}
                        onChange={(e) => handleSelectChange('vehicleType', e.target.value)}
                      >
                        <option value="" disabled>Выберите тип</option>
                        <option value="tent">Тент</option>
                        <option value="isotherm">Изотерм</option>
                        <option value="refrigerator">Рефрижератор</option>
                        <option value="flatbed">Бортовой</option>
                        <option value="car-carrier">Автовоз</option>
                        <option value="platform">Платформа</option>
                        <option value="cement-truck">Цементовоз</option>
                        <option value="bitumen-truck">Битумовоз</option>
                        <option value="fuel-truck">Бензовоз</option>
                        <option value="flour-truck">Муковоз</option>
                        <option value="tow-truck">Эвакуатор</option>
                        <option value="timber-truck">Лесовоз</option>
                        <option value="grain-truck">Зерновоз</option>
                        <option value="trailer">Трал</option>
                        <option value="dump-truck">Самосвал</option>
                        <option value="container-truck">Контейнеровоз</option>
                        <option value="oversized-truck">Негабарит</option>
                        <option value="bus">Автобус</option>
                        <option value="gas-truck">Газовоз</option>
                        <option value="other-truck">Другой тип</option>
                      </select>
                    </div>
                    <div className={`form-field ${validationErrors.cargoWeight ? 'error' : ''}`}>
                      <label>Вес груза</label>
                      <input 
                        type="number" 
                        className={`form-input ${validationErrors.cargoWeight ? 'error' : ''} ${shakeFields.cargoWeight ? 'shake' : ''}`}
                        placeholder="кг" 
                        value={formData.cargoWeight}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, cargoWeight: e.target.value }));
                          // Очищаем ошибку для этого поля
                          if (validationErrors.cargoWeight) {
                            setValidationErrors(prev => ({ ...prev, cargoWeight: false }));
                          }
                        }}
                      />
                      {validationErrors.cargoWeight && (
                        <div className="error-message">Пожалуйста, укажите вес груза</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className={`form-field ${validationErrors.cargoVolume ? 'error' : ''}`}>
                      <label>Объем груза</label>
                      <input 
                        type="number" 
                        className={`form-input ${validationErrors.cargoVolume ? 'error' : ''} ${shakeFields.cargoVolume ? 'shake' : ''}`}
                        placeholder="м³" 
                        value={formData.cargoVolume}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, cargoVolume: e.target.value }));
                          // Очищаем ошибку для этого поля
                          if (validationErrors.cargoVolume) {
                            setValidationErrors(prev => ({ ...prev, cargoVolume: false }));
                          }
                        }}
                      />
                      {validationErrors.cargoVolume && (
                        <div className="error-message">Пожалуйста, укажите объем груза</div>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Возможность дозагрузки</label>
                      <select 
                        className={`form-input ${selectedValues.reloadType ? 'has-value' : ''}`}
                        value={selectedValues.reloadType}
                        onChange={(e) => handleSelectChange('reloadType', e.target.value)}
                      >
                        <option value="" disabled>Возможность дозагрузки</option>
                        <option value="no-reload">Без догрузки (отдельное авто)</option>
                        <option value="possible-reload">Возможна дозагрузка</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Указать габариты груза</label>
                      <div 
                        className={`dimensions-trigger ${showCargoDimensions ? 'active' : ''}`}
                        onClick={() => setShowCargoDimensions(!showCargoDimensions)}
                      >
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Ввести длину, ширину и высоту" 
                          readOnly
                        />
                        <div className="dimensions-icon">
                          <div className="dimensions-circle"></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Количество автомобилей</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="шт" 
                        value={formData.vehicleCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleCount: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  {showCargoDimensions && (
                    <div className="form-row dimensions-row">
                      <div className="form-field">
                        <label>Длина груза</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите длину в метрах" 
                          value={formData.cargoLength}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoLength: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label>Ширина груза</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите ширину в метрах" 
                          value={formData.cargoWidth}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoWidth: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label>Высота груза</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите высоту в метрах" 
                          value={formData.cargoHeight}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoHeight: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <hr className="form-divider" />
                
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Стоимость</label>
                      <div className="currency-input">
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="0" 
                          value={formData.cargoPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoPrice: e.target.value }))}
                        />
                        <select 
                          className="currency-select"
                          value={formData.cargoCurrency}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoCurrency: e.target.value }))}
                        >
                          <option value="USD">USD</option>
                          <option value="RUB">RUB</option>
                          <option value="UZS">UZS</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Метод оплаты</label>
                      <select 
                        className={`form-input ${selectedValues.paymentMethod ? 'has-value' : ''}`}
                        value={selectedValues.paymentMethod}
                        onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                      >
                        <option value="" disabled>Выберите метод оплаты</option>
                        <option value="cashless">Безналичный</option>
                        <option value="card">На карту</option>
                        <option value="combined">Комбинированный</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Срок оплаты</label>
                      <select 
                        className={`form-input ${selectedValues.paymentTerm ? 'has-value' : ''}`}
                        value={selectedValues.paymentTerm}
                        onChange={(e) => handleSelectChange('paymentTerm', e.target.value)}
                      >
                        <option value="" disabled>Выберите срок оплаты</option>
                        <option value="unloading">При разгрузке</option>
                        <option value="prepayment">Предоплата</option>
                        <option value="deferred">Отсрочка платежа</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Торг</label>
                      <select 
                        className={`form-input ${selectedValues.bargain ? 'has-value' : ''}`}
                        value={selectedValues.bargain}
                        onChange={(e) => handleSelectChange('bargain', e.target.value)}
                      >
                        <option value="" disabled>Возможность торга</option>
                        <option value="yes">Возможен</option>
                        <option value="no">Нет</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <hr className="form-divider" />
                </div>
                
                <div className="form-section" style={{ marginTop: '32px' }}>
                  <h3>Выберите контакты, которые будут видны в заказе</h3>
                  <p>Здесь отображаются доступные контакты, добавленные вами в разделе "Профиль". Вы можете изменить или добавить их в личном кабинете.</p>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Основной телефон</label>
                      <input type="tel" className="form-input" value={currentUser?.phone || ''} readOnly />
                    </div>
                    <div className="form-field">
                      <label>Дополнительный телефон</label>
                      <input type="tel" className="form-input" />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>E-mail</label>
                      <input type="email" className="form-input" placeholder="example@email.com" />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <hr className="form-divider" />
                </div>
                

                
                <div className="form-section" style={{ marginTop: '32px' }}>
                  <div className="form-row">
                    <div className="form-field" style={{ width: '100%' }}>
                      <label>Дополнительная информация</label>
                      <textarea className="form-input" rows={4} placeholder="Введите дополнительную информацию..." />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <button className="submit-cargo-btn" onClick={() => createCard('cargo')}>
                    Добавить груз
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'add-transport':
        return (
          <>
            <div className="homepage-form-header-block transport-form-header">
              <div className="homepage-form-header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#000000" fill="none">
                  <circle cx="17" cy="18" r="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="7" cy="18" r="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M11 17h4M13.5 7h.943c1.31 0 1.966 0 2.521.315.556.314.926.895 1.667 2.056.52.814 1.064 1.406 1.831 1.931.772.53 1.14.789 1.343 1.204.195.398.195.869.195 1.811 0 1.243 0 1.864-.349 2.259l-.046.049c-.367.375-.946.375-2.102.375H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="m13 7 .994 2.486c.487 1.217.73 1.826 1.239 2.17.508.344 1.163.344 2.475.344H21M4.87 17c-1.353 0-2.03 0-2.45-.44C2 16.122 2 15.415 2 14V7c0-1.414 0-2.121.42-2.56S3.517 4 4.87 4h5.26c1.353 0 2.03 0 2.45.44C13 4.878 13 5.585 13 7v10H8.696" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              
              <div className="homepage-form-header-content">
                <h2>Добавление заявки на перевозку транспорта</h2>
                <p>Укажите, пожалуйста, пункты загрузки и выгрузки, параметры автомобиля и контактную информацию.</p>
              </div>
            </div>
            
            <div className="homepage-form-container">
              <div className="homepage-form-content">
                <h3>Информация о транспорте</h3>
                <p>Укажите как можно подробнее доступную информацию о транспорте.</p>
                
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Дни загрузки</label>
                      <div className="date-range-input">
                        <input 
                          type="date" 
                          className="form-input" 
                          value={formData.loadingStartDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, loadingStartDate: e.target.value }));
                            if (formData.loadingEndDate) {
                              validateDates(e.target.value, formData.loadingEndDate);
                            }
                          }}
                        />
                        <span>-</span>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={formData.loadingEndDate}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, loadingEndDate: e.target.value }));
                            if (formData.loadingStartDate) {
                              validateDates(formData.loadingStartDate, e.target.value);
                            }
                          }}
                        />
                      </div>
                      {dateError && <div className="error-message">{dateError}</div>}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Место загрузки</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Начните вводить название" 
                        value={loadingCity}
                        onChange={(e) => {
                          setLoadingCity(e.target.value);
                          setFormData(prev => ({ ...prev, loadingCity: e.target.value }));
                          setShowLoadingSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowLoadingSuggestions(loadingCity.length > 0)}
                      />
                      {showLoadingSuggestions && (
                        <div className="autocomplete-suggestions">
                          {filterCities(loadingCity).map((city, index) => (
                            <div 
                              key={index} 
                              className="suggestion-item"
                              onClick={() => handleCitySelect(city, true)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Место выгрузки</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Начните вводить название" 
                        value={unloadingCity}
                        onChange={(e) => {
                          setUnloadingCity(e.target.value);
                          setShowUnloadingSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowUnloadingSuggestions(unloadingCity.length > 0)}
                      />
                      {showUnloadingSuggestions && (
                        <div className="autocomplete-suggestions">
                          {filterCities(unloadingCity).map((city, index) => (
                            <div 
                              key={index} 
                              className="suggestion-item"
                              onClick={() => handleCitySelect(city, false)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <button className="add-location-btn">Добавить место загрузки</button>
                    </div>
                    <div className="form-field">
                      <button className="add-location-btn">Добавить место выгрузки</button>
                    </div>
                  </div>
                </div>
                
                <hr className="form-divider" />
                
                <div className="form-section">
                  <div className="form-row">
                    <div className={`form-field ${validationErrors.vehicleType ? 'error' : ''}`}>
                      <label>Тип автомобиля</label>
                      <select 
                        className={`form-input ${selectedValues.vehicleType ? 'has-value' : ''} ${validationErrors.vehicleType ? 'error' : ''} ${shakeFields.vehicleType ? 'shake' : ''}`}
                        value={selectedValues.vehicleType}
                        onChange={(e) => handleSelectChange('vehicleType', e.target.value)}
                      >
                        <option value="" disabled>Выберите тип</option>
                        <option value="tent">Тент</option>
                        <option value="isotherm">Изотерм</option>
                        <option value="refrigerator">Рефрижератор</option>
                        <option value="flatbed">Бортовой</option>
                        <option value="car-carrier">Автовоз</option>
                        <option value="platform">Платформа</option>
                        <option value="cement-truck">Цементовоз</option>
                        <option value="bitumen-truck">Битумовоз</option>
                        <option value="fuel-truck">Бензовоз</option>
                        <option value="flour-truck">Муковоз</option>
                        <option value="tow-truck">Эвакуатор</option>
                        <option value="timber-truck">Лесовоз</option>
                        <option value="grain-truck">Зерновоз</option>
                        <option value="trailer">Трал</option>
                        <option value="dump-truck">Самосвал</option>
                        <option value="container-truck">Контейнеровоз</option>
                        <option value="oversized-truck">Негабарит</option>
                        <option value="bus">Автобус</option>
                        <option value="gas-truck">Газовоз</option>
                        <option value="other-truck">Другой тип</option>
                      </select>
                      {validationErrors.vehicleType && (
                        <div className="error-message">Пожалуйста, выберите тип автомобиля</div>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Количество автомобилей</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Укажите количество" 
                        value={formData.vehicleCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, vehicleCount: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className={`form-field ${validationErrors.transportWeight ? 'error' : ''}`}>
                      <label>Масса (т)</label>
                      <input 
                        type="number" 
                        className={`form-input ${validationErrors.transportWeight ? 'error' : ''} ${shakeFields.transportWeight ? 'shake' : ''}`}
                        placeholder="Укажите вес" 
                        value={formData.transportWeight}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, transportWeight: e.target.value }));
                          // Очищаем ошибку для этого поля
                          if (validationErrors.transportWeight) {
                            setValidationErrors(prev => ({ ...prev, transportWeight: false }));
                          }
                        }}
                      />
                      {validationErrors.transportWeight && (
                        <div className="error-message">Пожалуйста, укажите массу транспорта</div>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Указать габариты груза</label>
                      <div className="dimensions-trigger" onClick={() => setShowTransportDimensions(!showTransportDimensions)}>
                        <input 
                          type="text" 
                          className={`form-input ${showTransportDimensions ? 'active' : ''}`}
                          placeholder="Ввести длину, ширину и высоту"
                          readOnly
                        />
                        <div className="dimensions-icon">
                          <div className={`dimensions-circle ${showTransportDimensions ? 'active' : ''}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {showTransportDimensions && (
                    <div className="form-row dimensions-row">
                      <div className="form-field">
                        <label>Длина груза</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите длину в метрах" 
                          value={formData.transportLength}
                          onChange={(e) => setFormData(prev => ({ ...prev, transportLength: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label>Ширина груза</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите ширину в метрах" 
                          value={formData.transportWidth}
                          onChange={(e) => setFormData(prev => ({ ...prev, transportWidth: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label>Высота груза</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите высоту в метрах" 
                          value={formData.transportHeight}
                          onChange={(e) => setFormData(prev => ({ ...prev, transportHeight: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="form-row">
                    <div className={`form-field ${validationErrors.transportVolume ? 'error' : ''}`}>
                      <label>Объём (м³)</label>
                      <input 
                        type="number" 
                        className={`form-input ${validationErrors.transportVolume ? 'error' : ''} ${shakeFields.transportVolume ? 'shake' : ''}`}
                        placeholder="Укажите объём" 
                        value={formData.transportVolume}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, transportVolume: e.target.value }));
                          // Очищаем ошибку для этого поля
                          if (validationErrors.transportVolume) {
                            setValidationErrors(prev => ({ ...prev, transportVolume: false }));
                          }
                        }}
                      />
                      {validationErrors.transportVolume && (
                        <div className="error-message">Пожалуйста, укажите объём транспорта</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <hr className="form-divider" />
                
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Стоимость</label>
                      <div className="currency-input">
                        <select 
                          className="currency-select"
                          value={formData.transportCurrency}
                          onChange={(e) => setFormData(prev => ({ ...prev, transportCurrency: e.target.value }))}
                        >
                          <option value="USD">USD</option>
                          <option value="RUB">RUB</option>
                          <option value="UZS">UZS</option>
                        </select>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="Укажите стоимость" 
                          value={formData.transportPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, transportPrice: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Метод оплаты</label>
                      <select 
                        className={`form-input ${selectedValues.paymentMethod ? 'has-value' : ''}`}
                        value={selectedValues.paymentMethod}
                        onChange={(e) => handleSelectChange('paymentMethod', e.target.value)}
                      >
                        <option value="" disabled>Выберите метод оплаты</option>
                        <option value="cashless">Безналичный</option>
                        <option value="card">На карту</option>
                        <option value="combined">Комбинированный</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Срок оплаты</label>
                      <select 
                        className={`form-input ${selectedValues.paymentTerm ? 'has-value' : ''}`}
                        value={selectedValues.paymentTerm}
                        onChange={(e) => handleSelectChange('paymentTerm', e.target.value)}
                      >
                        <option value="" disabled>Выберите срок оплаты</option>
                        <option value="unloading">При разгрузке</option>
                        <option value="prepayment">Предоплата</option>
                        <option value="deferred">Отсрочка платежа</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Торг</label>
                                              <select 
                          className={`form-input ${selectedValues.bargain ? 'has-value' : ''}`}
                          value={selectedValues.bargain}
                          onChange={(e) => handleSelectChange('bargain', e.target.value)}
                        >
                        <option value="" disabled>Возможность торга</option>
                        <option value="yes">Возможен</option>
                        <option value="no">Невозможен</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <hr className="form-divider" />
                </div>
                
                <div className="form-section" style={{ marginTop: '32px' }}>
                  <h3>Выберите контакты, которые будут видны в заказе</h3>
                  <p>Здесь отображаются доступные контакты, добавленные вами в разделе "Профиль". Вы можете изменить или добавить их в личном кабинете.</p>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Основной телефон</label>
                      <input type="tel" className="form-input" value={currentUser?.phone || ''} readOnly />
                    </div>
                    <div className="form-field">
                      <label>Дополнительный телефон</label>
                      <input type="tel" className="form-input" />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>E-mail</label>
                      <input type="email" className="form-input" placeholder="example@email.com" />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <hr className="form-divider" />
                </div>
                
                <div className="form-section" style={{ marginTop: '32px' }}>
                  <div className="form-row">
                    <div className="form-field" style={{ width: '100%' }}>
                      <label>Дополнительная информация</label>
                      <textarea className="form-input" rows={4} placeholder="Введите дополнительную информацию..." />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <button className="submit-transport-btn" onClick={() => createCard('transport')}>
                    Добавить автомобиль
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      
      default:
        return (
          <div className="cards-container">
            <h3>Мои перевозки</h3>
            <p>Здесь отображаются все созданные вами заявки на перевозку</p>
            
            {(() => {
              if (!currentUser?.id) {
                return (
                  <div className="no-cards">
                    <p>Пожалуйста, войдите в систему для просмотра ваших заявок.</p>
                  </div>
                );
              }
              
              // Загружаем карточки конкретного пользователя
              const storageKey = `transportCards_${currentUser.id}`;
              let userCards = JSON.parse(localStorage.getItem(storageKey) || '[]');
              
              // Если карточек нет в пользовательском хранилище, пробуем мигрировать
              if (userCards.length === 0) {
                // Попытка миграции карточек
                const allCards = JSON.parse(localStorage.getItem('transportCards') || '[]');
                
                // Пробуем найти карточки по userId
                let migratedCards = allCards.filter((card: any) => card.userId === currentUser.id);
                
                // Если не найдены по userId, пробуем по номеру телефона
                if (migratedCards.length === 0) {
                  // Поиск карточек по номеру телефона
                  migratedCards = allCards.filter((card: any) => card.mainPhone === currentUser.phone);
                }
                
                // Если все еще не найдены, пробуем по имени пользователя
                if (migratedCards.length === 0) {
                  // Поиск карточек по имени пользователя
                  const userName = `${currentUser.firstName} ${currentUser.lastName}`;
                  migratedCards = allCards.filter((card: any) => card.userName === userName);
                }
                
                if (migratedCards.length > 0) {
                  // Добавляем userId к найденным карточкам
                  const updatedCards = migratedCards.map((card: any) => ({
                    ...card,
                    userId: currentUser.id
                  }));
                  
                  localStorage.setItem(storageKey, JSON.stringify(updatedCards));
                  userCards = updatedCards;
                  // Миграция успешна
                }
              }
              
              // Отображение карточек
              
              // Отладочная информация уже выведена выше
              
              if (userCards.length === 0) {
                return (
                  <div className="no-cards">
                    <p>У вас пока нет созданных заявок. Создайте первую заявку, нажав "Добавить груз" или "Добавить транспорт" в левом меню.</p>
                  </div>
                );
              }
              
              return (
                <div className="cards-grid">
                  {userCards.map((card: any, index: number) => (
                    <div 
                      key={card.id} 
                      className={`transport-card ${deletingCardId === card.id ? 'deleting' : ''}`}
                    >
                      <div className="transport-card__content">
                        {/* Первый ряд - маршрут, тип, дата */}
                        <div className="transport-card__row">
                          <div className="transport-card__route-info">
                            <div className="transport-card__route">
                              {card.loadingCity} → {card.unloadingCity}
                            </div>
                            <div className="transport-card__type-badge">
                              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 .667A1.333 1.333 0 0 1 10.335 2v.667h1.013a1.33 1.33 0 0 1 1.041.5l.987 1.234c.189.236.292.53.292.833V8a1.333 1.333 0 0 1-1.333 1.334 2 2 0 1 1-4 0H5.667a2 2 0 1 1-4 0A1.333 1.333 0 0 1 .334 8V2A1.333 1.333 0 0 1 1.667.667zm-5.333 8a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333m6.667 0a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333M9.001 2H1.667v6h.51a2 2 0 0 1 2.894-.092L5.158 8h3.685l.077-.08.08-.077zm2.346 2h-1.013v3.334c.547 0 1.042.22 1.403.574l.088.092h.509V5.234z" fill="#FE6824"/>
                              </svg>
                              {card.type === 'cargo' ? 'Груз' : 'Транспорт'}
                            </div>
                            <div className="transport-card__date">
                              <div>Добавлено {card.createdAt ? new Date(card.createdAt).toLocaleDateString('ru-RU') : '09.01.2025'}</div>
                            </div>
                          </div>
                          <div className="transport-card__time-ago">
                            {card.createdAt ? getTimeAgo(card.createdAt) : 'только что'}
                          </div>
                        </div>

                        {/* Второй ряд - расстояние и габариты, оплата и сумма */}
                        <div className="transport-card__row transport-card__row--second">
                          <div className="transport-card__distance-dimensions">
                            <div className="transport-card__distance">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {calculateDistance(card.loadingCity, card.unloadingCity)} км
                            </div>
                            <div className="transport-card__dimensions">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {card.type === 'cargo' ? 
                                (card.cargoLength && card.cargoWidth && card.cargoHeight ? 
                                  `${card.cargoLength}м × ${card.cargoWidth}м × ${card.cargoHeight}м` : 
                                  '13.4м × 2.5м × 2.7м') :
                                (card.transportLength && card.transportWidth && card.transportHeight ? 
                                  `${card.transportLength}м × ${card.transportWidth}м × ${card.transportHeight}м` : 
                                  '13.4м × 2.5м × 2.7м')
                              }
                            </div>
                          </div>
                          <div className="transport-card__payment-price">
                            <div className={`transport-card__payment-badge ${
                              card.paymentMethod === 'cashless' ? 'transport-card__payment-badge--cashless' :
                              card.paymentMethod === 'card' ? 'transport-card__payment-badge--card' :
                              card.paymentMethod === 'combined' ? 'transport-card__payment-badge--combined' :
                              'transport-card__payment-badge--cashless'
                            }`}>
                              {card.paymentMethod === 'cashless' ? 'Наличные' : 
                               card.paymentMethod === 'card' ? 'На карту' : 
                               card.paymentMethod === 'combined' ? 'Комбинированный' : 'Наличные'}
                            </div>
                            <div className="transport-card__price">
                              {card.cargoPrice || card.transportPrice || '55'} {card.cargoCurrency === 'UAH' ? 'грн' : card.transportCurrency === 'UAH' ? 'грн' : 'грн'}
                            </div>
                          </div>
                        </div>

                        {/* Третий ряд - тип авто, масса, объем */}
                        <div className="transport-card__row">
                          <div className="transport-card__vehicle-info">
                            <div className="transport-card__vehicle-type">
                              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 .667A1.333 1.333 0 0 1 10.335 2v.667h1.013a1.33 1.33 0 0 1 1.041.5l.987 1.234c.189.236.292.53.292.833V8a1.333 1.333 0 0 1-1.333 1.334 2 2 0 1 1-4 0H5.667a2 2 0 1 1-4 0A1.333 1.333 0 0 1 .334 8V2A1.333 1.333 0 0 1 1.667.667zm-5.333 8a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333m6.667 0a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333M9.001 2H1.667v6h.51a2 2 0 0 1 2.894-.092L5.158 8h3.685l.077-.08.08-.077zm2.346 2h-1.013v3.334c.547 0 1.042.22 1.403.574l.088.092h.509V5.234z" fill="#717680"/>
                              </svg>
                              {card.type === 'cargo' ? 
                                (getVehicleTypeName(card.vehicleType) || 'Тент') :
                                (getVehicleTypeName(card.vehicleType) || 'Тент')
                              }
                            </div>
                            <div className="transport-card__spec-item">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 10.667h8.003L9.053 4H2.95zm4.001-8a.65.65 0 0 0 .476-.192A.64.64 0 0 0 6.668 2a.65.65 0 0 0-.192-.475.64.64 0 0 0-.475-.192.64.64 0 0 0-.474.192.65.65 0 0 0-.193.475q0 .283.193.475A.64.64 0 0 0 6 2.667m1.884 0h1.168q.5 0 .866.333.367.333.45.817l.951 6.666q.084.6-.308 1.059a1.26 1.26 0 0 1-1.01.458H2q-.617 0-1.01-.458a1.29 1.29 0 0 1-.307-1.059l.95-6.666q.084-.484.45-.817.367-.333.867-.333h1.167a4 4 0 0 1-.083-.325A1.7 1.7 0 0 1 4.001 2q0-.834.583-1.417A1.93 1.93 0 0 1 6.001 0 1.93 1.93 0 0 1 7.42.583q.583.584.583 1.417q0 .183-.033.342t-.084.325" fill="#717680"/>
                              </svg>
                              {card.cargoWeight || card.transportWeight || '10'}т
                            </div>
                            <div className="transport-card__spec-item">
                              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M3.46 9.334h1.834c.12 0 .24-.047.327-.12a.39.39 0 0 0 0-.587.47.47 0 0 0-.327-.12h-.727l1.507-1.373a.4.4 0 0 0 .133-.294.4.4 0 0 0-.133-.293.504.504 0 0 0-.653 0L3.914 7.92v-.66a.4.4 0 0 0-.133-.293.47.47 0 0 0-.327-.12.5.5 0 0 0-.327.12.4.4 0 0 0-.133.293v1.667a.4.4 0 0 0 .133.293c.087.08.2.12.327.12zm4.794-3.747c.12 0 .24-.047.327-.12l1.506-1.373v.66a.4.4 0 0 0 .134.293.504.504 0 0 0 .653 0 .4.4 0 0 0 .133-.293V3.087a.4.4 0 0 0-.133-.293.47.47 0 0 0-.327-.12H8.714c-.12 0-.24.046-.327.12a.4.4 0 0 0-.133.293c0 .107.047.213.133.293s.2.12.327.12h.727L7.934 4.874a.4.4 0 0 0-.133.293c0 .107.046.22.133.293.087.08.2.12.327.12h-.007zM9.434 8.5h-.727c-.12 0-.24.047-.326.12a.4.4 0 0 0-.134.294c0 .106.047.213.134.293.086.08.2.12.326.12h1.834c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293V7.247a.4.4 0 0 0-.134-.293.47.47 0 0 0-.326-.12.5.5 0 0 0-.327.12.4.4 0 0 0-.133.293v.66L8.574 6.534a.47.47 0 0 0-.327-.12.5.5 0 0 0-.326.12.39.39 0 0 0 0 .587l1.506 1.373zM3.461 5.167c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293v-.66l1.506 1.373a.506.506 0 0 0 .654 0 .39.39 0 0 0 0-.587L4.574 3.507h.727c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293.4.4 0 0 0-.134-.294.47.47 0 0 0-.326-.12H3.467c-.12 0-.24.047-.326.12a.4.4 0 0 0-.134.294V4.76a.4.4 0 0 0 .134.294c.086.08.2.12.326.12zm8.873-4.5H1.667C.934.667.334 1.267.334 2v8c0 .734.6 1.334 1.333 1.334h10.667c.733 0 1.333-.6 1.333-1.334V2c0-.733-.6-1.333-1.333-1.333m0 9.333H1.667V2h10.667z" fill="#717680"/>
                              </svg>
                              {card.cargoVolume || card.transportVolume || '86'}м³
                            </div>
                          </div>
                        </div>

                        {/* Четвертый ряд - детали и действия */}
                        <div className="transport-card__row">
                          <div className="transport-card__details">
                            <span>{card.loadingType === 'back' ? 'Задняя' : card.loadingType === 'side' ? 'Боковая' : card.loadingType === 'top' ? 'Верхняя' : 'Задняя'}</span>
                            <span>Пломба</span>
                            <span>Кол-во паллет: 33</span>
                            <span>Информация о грузе</span>
                          </div>
                          <div className="transport-card__actions">
                            <button 
                              className="transport-card__bookmark-btn"
                              title="Добавить в закладки"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="transport-card__edit-btn"
                              title="Редактировать"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="transport-card__delete-btn"
                              title="Удалить"
                              onClick={() => handleDeleteCard(card.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="transport-card__details-btn"
                              onClick={() => toggleCardExpanded(card.id)}
                            >
                              {expandedCardId === card.id ? 'Свернуть' : 'Подробнее'}
                              <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ transform: expandedCardId === card.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                              >
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Развернутая информация */}
                        <div className={`transport-card__expanded ${expandedCardId === card.id ? 'expanded' : ''}`}>
                            <div className="transport-card__expanded-content">
                              <h4>Контактная информация</h4>
                              <div className="transport-card__contact-info">
                                <div className="transport-card__contact-row">
                                  <span className="transport-card__contact-label">Имя:</span>
                                  <span className="transport-card__contact-value">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                  </span>
                                </div>
                                <div className="transport-card__contact-row">
                                  <span className="transport-card__contact-label">Телефон:</span>
                                  <span className="transport-card__contact-value">{currentUser?.phone}</span>
                                </div>
                                {currentUser?.email && (
                                  <div className="transport-card__contact-row">
                                    <span className="transport-card__contact-label">Email:</span>
                                    <span className="transport-card__contact-value">{currentUser.email}</span>
                                  </div>
                                )}
                                {card.additionalPhone && (
                                  <div className="transport-card__contact-row">
                                    <span className="transport-card__contact-label">Доп. телефон:</span>
                                    <span className="transport-card__contact-value">{card.additionalPhone}</span>
                                  </div>
                                )}
                              </div>
                              
                              <h4>Дополнительная информация</h4>
                              <div className="transport-card__additional-info">
                                <div className="transport-card__info-row">
                                  <span className="transport-card__info-label">Тип загрузки:</span>
                                  <span className="transport-card__info-value">
                                    {card.loadingType === 'back' ? 'Задняя' : 
                                     card.loadingType === 'side' ? 'Боковая' : 
                                     card.loadingType === 'top' ? 'Верхняя' : 'Задняя'}
                                  </span>
                                </div>
                                <div className="transport-card__info-row">
                                  <span className="transport-card__info-label">Тип груза:</span>
                                  <span className="transport-card__info-value">
                                    {getCargoTypeName(card.cargoType) || 'Не указано'}
                                  </span>
                                </div>
                                <div className="transport-card__info-row">
                                  <span className="transport-card__info-label">Условия оплаты:</span>
                                  <span className="transport-card__info-value">
                                    {card.paymentTerm === 'prepayment' ? 'Предоплата' :
                                     card.paymentTerm === 'postpayment' ? 'Постоплата' :
                                     card.paymentTerm === '50-50' ? '50% - 50%' : 'Не указано'}
                                  </span>
                                </div>
                                {card.additionalInfo && (
                                  <div className="transport-card__info-row">
                                    <span className="transport-card__info-label">Примечания:</span>
                                    <span className="transport-card__info-value">{card.additionalInfo}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        );
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
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default Homepage;


