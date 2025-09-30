import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSidebar } from '../contexts/SidebarContext';
import '../css/left-sidebar.css';
import '../css/homepage.css';
import '../css/search-orders.css';

interface CurrentUser {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const SearchOrders: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  
  // Состояния для управления страницами
  const [activePage, setActivePage] = useState<'all' | 'cargo' | 'transport'>('all');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchExecuted, setSearchExecuted] = useState(false);
  
  // Состояние для развернутых карточек
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    loadingCountries: [] as string[],
    unloadingCountries: [] as string[],
    loadingRegions: [] as string[],
    unloadingRegions: [] as string[],
    loadingCities: [] as string[],
    unloadingCities: [] as string[],
    weightFrom: '',
    weightTo: '',
    volumeFrom: '',
    volumeTo: '',
    vehicleType: '',
    dateFrom: '',
    dateTo: ''
  });

  // Состояния для автокомплита
  const [loadingCountryInput, setLoadingCountryInput] = useState('');
  const [unloadingCountryInput, setUnloadingCountryInput] = useState('');
  const [loadingRegionInput, setLoadingRegionInput] = useState('');
  const [unloadingRegionInput, setUnloadingRegionInput] = useState('');
  const [loadingCityInput, setLoadingCityInput] = useState('');
  const [unloadingCityInput, setUnloadingCityInput] = useState('');
  
  const [showLoadingCountrySuggestions, setShowLoadingCountrySuggestions] = useState(false);
  const [showUnloadingCountrySuggestions, setShowUnloadingCountrySuggestions] = useState(false);
  const [showLoadingRegionSuggestions, setShowLoadingRegionSuggestions] = useState(false);
  const [showUnloadingRegionSuggestions, setShowUnloadingRegionSuggestions] = useState(false);
  const [showLoadingCitySuggestions, setShowLoadingCitySuggestions] = useState(false);
  const [showUnloadingCitySuggestions, setShowUnloadingCitySuggestions] = useState(false);

  // База данных стран (такая же как в Homepage.tsx)
  const countriesDatabase = [
    { 
      name: 'Украина', 
      regions: [
        { name: 'Киевская область', cities: ['Киев', 'Бровары', 'Борисполь', 'Ирпень', 'Фастов'] },
        { name: 'Харьковская область', cities: ['Харьков', 'Изюм', 'Купянск', 'Лозовая', 'Чугуев'] },
        { name: 'Одесская область', cities: ['Одесса', 'Измаил', 'Белгород-Днестровский', 'Подольск', 'Южное'] },
        { name: 'Днепропетровская область', cities: ['Днепр', 'Кривой Рог', 'Никополь', 'Павлоград', 'Новомосковск'] },
        { name: 'Львовская область', cities: ['Львов', 'Дрогобыч', 'Стрый', 'Червоноград', 'Трускавец'] }
      ]
    },
    { 
      name: 'Россия', 
      regions: [
        { name: 'Московская область', cities: ['Москва', 'Подольск', 'Химки', 'Королев', 'Мытищи'] },
        { name: 'Ленинградская область', cities: ['Санкт-Петербург', 'Гатчина', 'Выборг', 'Тихвин', 'Кингисепп'] },
        { name: 'Кировская область', cities: ['Киров', 'Кирово-Чепецк', 'Вятские Поляны', 'Слободской', 'Котельнич'] },
        { name: 'Свердловская область', cities: ['Екатеринбург', 'Нижний Тагил', 'Каменск-Уральский', 'Первоуральск', 'Серов'] },
        { name: 'Краснодарский край', cities: ['Краснодар', 'Сочи', 'Новороссийск', 'Армавир', 'Ейск'] }
      ]
    },
    { 
      name: 'Узбекистан', 
      regions: [
        { name: 'Ташкентская область', cities: ['Ташкент', 'Ангрен', 'Бекабад', 'Чирчик', 'Янгиюль'] },
        { name: 'Самаркандская область', cities: ['Самарканд', 'Каттакурган', 'Ургут', 'Пайарык', 'Нурабад'] },
        { name: 'Бухарская область', cities: ['Бухара', 'Гиждуван', 'Ромитан', 'Шафиркан', 'Каракуль'] },
        { name: 'Ферганская область', cities: ['Фергана', 'Коканд', 'Маргилан', 'Кува', 'Кувасай'] }
      ]
    },
    { 
      name: 'Казахстан', 
      regions: [
        { name: 'Алматинская область', cities: ['Алматы', 'Талдыкорган', 'Капчагай', 'Текели', 'Жаркент'] },
        { name: 'Астана', cities: ['Астана', 'Кокшетау', 'Щучинск', 'Степногорск', 'Макинск'] },
        { name: 'Шымкентская область', cities: ['Шымкент', 'Туркестан', 'Сайрам', 'Арысь', 'Жанакорган'] }
      ]
    },
    { 
      name: 'Молдова', 
      regions: [
        { name: 'Кишинев', cities: ['Кишинев', 'Бельцы', 'Тирасполь', 'Бендеры', 'Рыбница'] }
      ]
    }
  ];

  // Загрузка всех заказов
  const loadAllOrders = () => {
    setLoading(true);
    const orders: any[] = [];
    
    // Загружаем грузы
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transportCards_')) {
        const userCards = JSON.parse(localStorage.getItem(key) || '[]');
        userCards.forEach((card: any) => {
          if (card.type === 'cargo') {
            orders.push({
              ...card,
              id: `${card.id}_${key}`,
              userName: card.userName || 'Пользователь',
              createdAt: card.createdAt || new Date().toISOString()
            });
          }
        });
      }
    }
    
    // Загружаем транспорт
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transportCards_')) {
        const userCards = JSON.parse(localStorage.getItem(key) || '[]');
        userCards.forEach((card: any) => {
          if (card.type === 'transport') {
            orders.push({
              ...card,
              id: `${card.id}_${key}`,
              userName: card.userName || 'Пользователь',
              createdAt: card.createdAt || new Date().toISOString()
            });
          }
        });
      }
    }
    
    // Исключаем заказы текущего пользователя
    const filteredOrders = orders.filter(order => 
      !order.id.includes(`_transportCards_${currentUser?.id}`)
    );
    
    setAllOrders(filteredOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadAllOrders();
  }, [currentUser?.id]);

  useEffect(() => {
    // Устанавливаем фон body при монтировании компонента
    document.body.style.backgroundColor = 'rgb(245, 245, 245)';
    
    // Очищаем фон при размонтировании компонента
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Функции для работы с карточками
  const toggleCardExpanded = (cardId: string) => {
    setExpandedCardId(expandedCardId === cardId ? null : cardId);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    return `${Math.floor(diffInSeconds / 86400)} дн назад`;
  };

  const calculateDistance = (from: string, to: string) => {
    return Math.floor(Math.random() * 2000) + 100;
  };

  const getCargoTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'pallets': 'Груз на паллетах',
      'equipment': 'Оборудование',
      'construction': 'Стройматериалы',
      'metal': 'Металл',
      'wood': 'Дерево',
      'plastic': 'Пластик',
      'textile': 'Текстиль',
      'food': 'Продукты питания',
      'chemical': 'Химия',
      'machinery': 'Машины',
      'electronics': 'Электроника',
      'furniture': 'Мебель',
      'auto': 'Автомобили',
      'general': 'Генеральный груз',
      'container': 'Контейнер',
      'liquid': 'Жидкий груз',
      'bulk': 'Насыпной груз',
      'isotherm': 'Изотерм'
    };
    return types[type] || type;
  };

  const getVehicleTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'tent': 'Тент',
      'isotherm': 'Изотерм',
      'refrigerator': 'Рефрижератор',
      'tank': 'Цистерна',
      'container': 'Контейнеровоз',
      'flatbed': 'Бортовой',
      'lowloader': 'Низкорамный',
      'car_carrier': 'Автовоз',
      'grain_carrier': 'Зерновоз',
      'dump_truck': 'Самосвал'
    };
    return types[type] || type;
  };

  // Функции автокомплита
  const filterCountries = (query: string) => {
    if (!query) return [];
    return countriesDatabase
      .filter(country => 
        country.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(country => ({ name: country.name }));
  };

  const filterRegions = (query: string) => {
    if (!query) return [];
    const regions: string[] = [];
    countriesDatabase.forEach(country => {
      country.regions.forEach(region => {
        if (region.name.toLowerCase().includes(query.toLowerCase())) {
          regions.push(region.name);
        }
      });
    });
    return regions;
  };

  const filterCities = (query: string) => {
    if (!query) return [];
    const cities: string[] = [];
    countriesDatabase.forEach(country => {
      country.regions.forEach(region => {
        region.cities.forEach(city => {
          if (city.toLowerCase().includes(query.toLowerCase())) {
            cities.push(city);
          }
        });
      });
    });
    
    // Добавляем города из существующих заказов (только если есть заказы)
    if (allOrders.length > 0) {
      allOrders.forEach(order => {
        if (order.loadingCity && order.loadingCity.toLowerCase().includes(query.toLowerCase())) {
          if (!cities.includes(order.loadingCity)) cities.push(order.loadingCity);
        }
        if (order.unloadingCity && order.unloadingCity.toLowerCase().includes(query.toLowerCase())) {
          if (!cities.includes(order.unloadingCity)) cities.push(order.unloadingCity);
        }
      });
    }
    
    return cities;
  };

  // Функции для работы с фильтрами
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addLoadingCountry = (country: string) => {
    if (country && !filters.loadingCountries.includes(country)) {
      setFilters(prev => ({
        ...prev,
        loadingCountries: [...prev.loadingCountries, country]
      }));
    }
    setLoadingCountryInput('');
    setShowLoadingCountrySuggestions(false);
  };

  const removeLoadingCountry = (country: string) => {
    setFilters(prev => ({
      ...prev,
      loadingCountries: prev.loadingCountries.filter(c => c !== country)
    }));
  };

  const addUnloadingCountry = (country: string) => {
    if (country && !filters.unloadingCountries.includes(country)) {
      setFilters(prev => ({
        ...prev,
        unloadingCountries: [...prev.unloadingCountries, country]
      }));
    }
    setUnloadingCountryInput('');
    setShowUnloadingCountrySuggestions(false);
  };

  const removeUnloadingCountry = (country: string) => {
    setFilters(prev => ({
      ...prev,
      unloadingCountries: prev.unloadingCountries.filter(c => c !== country)
    }));
  };

  const addLoadingRegion = (region: string) => {
    if (region && !filters.loadingRegions.includes(region)) {
      setFilters(prev => ({
        ...prev,
        loadingRegions: [...prev.loadingRegions, region]
      }));
    }
    setLoadingRegionInput('');
    setShowLoadingRegionSuggestions(false);
  };

  const removeLoadingRegion = (region: string) => {
    setFilters(prev => ({
      ...prev,
      loadingRegions: prev.loadingRegions.filter(r => r !== region)
    }));
  };

  const addUnloadingRegion = (region: string) => {
    if (region && !filters.unloadingRegions.includes(region)) {
      setFilters(prev => ({
        ...prev,
        unloadingRegions: [...prev.unloadingRegions, region]
      }));
    }
    setUnloadingRegionInput('');
    setShowUnloadingRegionSuggestions(false);
  };

  const removeUnloadingRegion = (region: string) => {
    setFilters(prev => ({
      ...prev,
      unloadingRegions: prev.unloadingRegions.filter(r => r !== region)
    }));
  };

  const addLoadingCity = (city: string) => {
    if (city && !filters.loadingCities.includes(city)) {
      setFilters(prev => ({
        ...prev,
        loadingCities: [...prev.loadingCities, city]
      }));
    }
    setLoadingCityInput('');
    setShowLoadingCitySuggestions(false);
  };

  const removeLoadingCity = (city: string) => {
    setFilters(prev => ({
      ...prev,
      loadingCities: prev.loadingCities.filter(c => c !== city)
    }));
  };

  const addUnloadingCity = (city: string) => {
    if (city && !filters.unloadingCities.includes(city)) {
      setFilters(prev => ({
        ...prev,
        unloadingCities: [...prev.unloadingCities, city]
      }));
    }
    setUnloadingCityInput('');
    setShowUnloadingCitySuggestions(false);
  };

  const removeUnloadingCity = (city: string) => {
    setFilters(prev => ({
      ...prev,
      unloadingCities: prev.unloadingCities.filter(c => c !== city)
    }));
  };

  const clearFilters = () => {
    setFilters({
      loadingCountries: [],
      unloadingCountries: [],
      loadingRegions: [],
      unloadingRegions: [],
      loadingCities: [],
      unloadingCities: [],
      weightFrom: '',
      weightTo: '',
      volumeFrom: '',
      volumeTo: '',
      vehicleType: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchExecuted(false);
  };

  // Сброс фильтров при переходе между страницами
  useEffect(() => {
    if (activePage === 'cargo' || activePage === 'transport') {
      clearFilters();
    }
  }, [activePage]);

  // Функция фильтрации заказов
  const filterOrders = () => {
    
    let filtered = allOrders.filter(order => {
      // Фильтр по типу заказа
      if (activePage === 'cargo' && order.type !== 'cargo') return false;
      if (activePage === 'transport' && order.type !== 'transport') return false;
      
      // Фильтры по странам загрузки
      if (filters.loadingCountries.length > 0) {
        const orderCountry = order.loadingCountry?.toLowerCase() || '';
        if (!filters.loadingCountries.some(country => 
          orderCountry.includes(country.toLowerCase())
        )) return false;
      }
      
      // Фильтры по странам разгрузки
      if (filters.unloadingCountries.length > 0) {
        const orderCountry = order.unloadingCountry?.toLowerCase() || '';
        if (!filters.unloadingCountries.some(country => 
          orderCountry.includes(country.toLowerCase())
        )) return false;
      }
      
      // Фильтры по регионам загрузки
      if (filters.loadingRegions.length > 0) {
        const orderRegion = order.loadingRegion?.toLowerCase() || '';
        if (!filters.loadingRegions.some(region => 
          orderRegion.includes(region.toLowerCase())
        )) return false;
      }
      
      // Фильтры по регионам разгрузки
      if (filters.unloadingRegions.length > 0) {
        const orderRegion = order.unloadingRegion?.toLowerCase() || '';
        if (!filters.unloadingRegions.some(region => 
          orderRegion.includes(region.toLowerCase())
        )) return false;
      }
      
      // Фильтры по городам загрузки
      if (filters.loadingCities.length > 0) {
        const orderCity = order.loadingCity?.toLowerCase() || '';
        if (!filters.loadingCities.some(city => 
          orderCity.includes(city.toLowerCase())
        )) return false;
      }
      
      // Фильтры по городам разгрузки
      if (filters.unloadingCities.length > 0) {
        const orderCity = order.unloadingCity?.toLowerCase() || '';
        if (!filters.unloadingCities.some(city => 
          orderCity.includes(city.toLowerCase())
        )) return false;
      }
      
      // Фильтр по весу
      if (filters.weightFrom && order.cargoWeight && !isNaN(parseFloat(order.cargoWeight)) && parseFloat(order.cargoWeight) < parseFloat(filters.weightFrom)) return false;
      if (filters.weightTo && order.cargoWeight && !isNaN(parseFloat(order.cargoWeight)) && parseFloat(order.cargoWeight) > parseFloat(filters.weightTo)) return false;
      
      // Фильтр по объему
      if (filters.volumeFrom && order.cargoVolume && !isNaN(parseFloat(order.cargoVolume)) && parseFloat(order.cargoVolume) < parseFloat(filters.volumeFrom)) return false;
      if (filters.volumeTo && order.cargoVolume && !isNaN(parseFloat(order.cargoVolume)) && parseFloat(order.cargoVolume) > parseFloat(filters.volumeTo)) return false;
      
      // Фильтр по типу транспорта
      if (filters.vehicleType && order.vehicleType !== filters.vehicleType) return false;
      
      // Фильтр по дате
      if (filters.dateFrom && order.loadingDate && new Date(order.loadingDate) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && order.loadingDate && new Date(order.loadingDate) > new Date(filters.dateTo)) return false;
      
      return true;
    });
    
    // Сортировка по релевантности
    filtered = filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Бонус за точное совпадение типа
      if (activePage === 'cargo' && a.type === 'cargo') scoreA += 10;
      if (activePage === 'transport' && a.type === 'transport') scoreA += 10;
      if (activePage === 'cargo' && b.type === 'cargo') scoreB += 10;
      if (activePage === 'transport' && b.type === 'transport') scoreB += 10;
      
      // Бонус за совпадение городов
      if (filters.loadingCities.length > 0) {
        if (a.loadingCity && filters.loadingCities.some(city => a.loadingCity.toLowerCase().includes(city.toLowerCase()))) scoreA += 5;
        if (b.loadingCity && filters.loadingCities.some(city => b.loadingCity.toLowerCase().includes(city.toLowerCase()))) scoreB += 5;
      }
      
      // Бонус за совпадение стран
      if (filters.loadingCountries.length > 0) {
        if (a.loadingCountry && filters.loadingCountries.some(country => a.loadingCountry.toLowerCase().includes(country.toLowerCase()))) scoreA += 3;
        if (b.loadingCountry && filters.loadingCountries.some(country => b.loadingCountry.toLowerCase().includes(country.toLowerCase()))) scoreB += 3;
      }
      
      // Бонус за совпадение типа транспорта
      if (filters.vehicleType && a.vehicleType === filters.vehicleType) scoreA += 2;
      if (filters.vehicleType && b.vehicleType === filters.vehicleType) scoreB += 2;
      
      return scoreB - scoreA; // Сортируем по убыванию
    });
    
    setFilteredOrders(filtered);
    setSearchExecuted(true);
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
              <div className="homepage-form-header-block search-form-header">
                <div className="homepage-form-header-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#000000" fill="none">
                    <path d="M15 15L16.5 16.5" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.9333 19.0252C16.3556 18.4475 16.3556 17.5109 16.9333 16.9333C17.5109 16.3556 18.4475 16.3556 19.0252 16.9333L21.0667 18.9748C21.6444 19.5525 21.6444 20.4891 21.0667 21.0667C20.4891 21.6444 19.5525 21.6444 18.9748 21.0667L16.9333 19.0252Z" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.5 9.5C16.5 5.63401 13.366 2.5 9.5 2.5C5.63401 2.5 2.5 5.63401 2.5 9.5C2.5 13.366 5.63401 16.5 9.5 16.5C13.366 16.5 16.5 13.366 16.5 9.5Z" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                
                <div className="homepage-form-header-content">
                  <h2>Поиск заказов</h2>
                  <p>Найдите подходящие заказы от других пользователей</p>
                  
                  {/* Кнопки переключения типа поиска */}
                  {activePage === 'all' && (
                    <div className="search-type-switcher">
                      <button 
                        className="search-type-btn"
                        onClick={() => setActivePage('cargo')}
                      >
                        Найти груз
                      </button>
                      <button 
                        className="search-type-btn"
                        onClick={() => setActivePage('transport')}
                      >
                        Найти транспорт
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопка "Назад" для страниц фильтрации */}
              {(activePage === 'cargo' || activePage === 'transport') && (
                <div className="search-back-btn">
                  <button 
                    className="back-to-search-btn"
                    onClick={() => setActivePage('all')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Назад к поиску
                  </button>
                </div>
              )}

              {/* Контент страниц */}
              {activePage === 'all' && (
                <div className="search-orders__results">
                  <div className="results-header">
                    <h2>Все заказы ({allOrders.length})</h2>
                  </div>

                  {loading ? (
                    <div className="loading">Загрузка...</div>
                  ) : allOrders.length === 0 ? (
                    <div className="no-orders">
                      <p>Заказы не найдены. Попробуйте добавить груз или транспорт.</p>
                    </div>
                  ) : (
                    <div className="cards-grid">
                      {allOrders.map((order) => (
                        <div key={order.id} className="transport-card">
                          <div className="transport-card__content">
                            <div className="transport-card__row">
                              <div className="transport-card__route-info">
                                <div className="transport-card__route">
                                  {(() => {
                                    const loadingParts = [];
                                    if (order.loadingCity) loadingParts.push(order.loadingCity);
                                    if (order.loadingRegion) loadingParts.push(order.loadingRegion);
                                    if (order.loadingCountry) loadingParts.push(order.loadingCountry);
                                    return loadingParts.length > 0 ? loadingParts.join(', ') : 'Не указано';
                                  })()} → {(() => {
                                    const unloadingParts = [];
                                    if (order.unloadingCity) unloadingParts.push(order.unloadingCity);
                                    if (order.unloadingRegion) unloadingParts.push(order.unloadingRegion);
                                    if (order.unloadingCountry) unloadingParts.push(order.unloadingCountry);
                                    return unloadingParts.length > 0 ? unloadingParts.join(', ') : 'Не указано';
                                  })()}
                                </div>
                                <div className="transport-card__type-badge">
                                  {order.type === 'cargo' ? (
                                    <svg width="14" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 22C11.1818 22 10.4002 21.6698 8.83693 21.0095C4.94564 19.3657 3 18.5438 3 17.1613C3 16.7742 3 10.0645 3 7M12 22C12.8182 22 13.5998 21.6698 15.1631 21.0095C19.0544 19.3657 21 18.5438 21 17.1613V7M12 22L12 11.3548" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M8.32592 9.69138L5.40472 8.27785C3.80157 7.5021 3 7.11423 3 6.5C3 5.88577 3.80157 5.4979 5.40472 4.72215L8.32592 3.30862C10.1288 2.43621 11.0303 2 12 2C12.9697 2 13.8712 2.4362 15.6741 3.30862L18.5953 4.72215C20.1984 5.4979 21 5.88577 21 6.5C21 7.11423 20.1984 7.5021 18.5953 8.27785L15.6741 9.69138C13.8712 10.5638 12.9697 11 12 11C11.0303 11 10.1288 10.5638 8.32592 9.69138Z" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M6 12L8 13" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M17 4L7 9" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M9 .667A1.333 1.333 0 0 1 10.335 2v.667h1.013a1.33 1.33 0 0 1 1.041.5l.987 1.234c.189.236.292.53.292.833V8a1.333 1.333 0 0 1-1.333 1.334 2 2 0 1 1-4 0H5.667a2 2 0 1 1-4 0A1.333 1.333 0 0 1 .334 8V2A1.333 1.333 0 0 1 1.667.667zm-5.333 8a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333m6.667 0a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333M9.001 2H1.667v6h.51a2 2 0 0 1 2.894-.092L5.158 8h3.685l.077-.08.08-.077zm2.346 2h-1.013v3.334c.547 0 1.042.22 1.403.574l.088.092h.509V5.234z" fill="#FE6824"/>
                                    </svg>
                                  )}
                                  {order.type === 'cargo' ? 'Груз' : 'Транспорт'}
                                </div>
                                <div className="transport-card__date">
                                  <div>Добавлено {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '09.01.2025'}</div>
                                </div>
                              </div>
                              <div className="transport-card__time-ago">
                                {order.createdAt ? getTimeAgo(order.createdAt) : 'только что'}
                              </div>
                            </div>

                            <div className="transport-card__row transport-card__row--second">
                              <div className="transport-card__distance-cargo">
                                <div className="transport-card__distance">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {calculateDistance(order.loadingCity, order.unloadingCity)} км
                                </div>
                                <div className="transport-card__cargo-type">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  {Array.isArray(order.cargoType) ? 
                                    order.cargoType.map((type: string) => getCargoTypeName(type)).join(', ') :
                                    getCargoTypeName(order.cargoType) || 'Не указано'
                                  }
                                </div>
                              </div>
                              <div className="transport-card__payment-price">
                                <div className={`transport-card__payment-badge ${
                                  order.paymentMethod === 'cashless' ? 'transport-card__payment-badge--cashless' :
                                  order.paymentMethod === 'card' ? 'transport-card__payment-badge--card' :
                                  order.paymentMethod === 'combined' ? 'transport-card__payment-badge--combined' :
                                  'transport-card__payment-badge--cashless'
                                }`}>
                                  {order.paymentMethod === 'cashless' ? 'Наличные' : 
                                   order.paymentMethod === 'card' ? 'На карту' : 
                                   order.paymentMethod === 'combined' ? 'Комбинированный' : 'Наличные'}
                                </div>
                                <div className="transport-card__price">
                                  {order.cargoPrice || order.price || '55'} {order.cargoCurrency || 'USD'}
                                </div>
                              </div>
                            </div>

                            <div className="transport-card__row">
                              <div className="transport-card__vehicle-info">
                                <div className="transport-card__vehicle-type">
                                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 .667A1.333 1.333 0 0 1 10.335 2v.667h1.013a1.33 1.33 0 0 1 1.041.5l.987 1.234c.189.236.292.53.292.833V8a1.333 1.333 0 0 1-1.333 1.334 2 2 0 1 1-4 0H5.667a2 2 0 1 1-4 0A1.333 1.333 0 0 1 .334 8V2A1.333 1.333 0 0 1 1.667.667zm-5.333 8a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333m6.667 0a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333M9.001 2H1.667v6h.51a2 2 0 0 1 2.894-.092L5.158 8h3.685l.077-.08.08-.077zm2.346 2h-1.013v3.334c.547 0 1.042.22 1.403.574l.088.092h.509V5.234z" fill="#717680"/>
                                  </svg>
                                  {order.type === 'cargo' ? 
                                    (getVehicleTypeName(order.vehicleType) || 'Тент') :
                                    (getVehicleTypeName(order.vehicleType) || 'Тент')
                                  }
                                </div>
                                <div className="transport-card__spec-item">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 10.667h8.003L9.053 4H2.95zm4.001-8a.65.65 0 0 0 .476-.192A.64.64 0 0 0 6.668 2a.65.65 0 0 0-.192-.475.64.64 0 0 0-.475-.192.64.64 0 0 0-.474.192.65.65 0 0 0-.193.475q0 .283.193.475A.64.64 0 0 0 6 2.667m1.884 0h1.168q.5 0 .866.333.367.333.45.817l.951 6.666q.084.6-.308 1.059a1.26 1.26 0 0 1-1.01.458H2q-.617 0-1.01-.458a1.29 1.29 0 0 1-.307-1.059l.95-6.666q.084-.484.45-.817.367-.333.867-.333h1.167a4 4 0 0 1-.083-.325A1.7 1.7 0 0 1 4.001 2q0-.834.583-1.417A1.93 1.93 0 0 1 6.001 0 1.93 1.93 0 0 1 7.42.583q.583.584.583 1.417q0 .183-.033.342t-.084.325" fill="#717680"/>
                                  </svg>
                                  {order.cargoWeight || order.transportWeight || order.capacity || '10'}т
                                </div>
                                <div className="transport-card__spec-item">
                                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.46 9.334h1.834c.12 0 .24-.047.327-.12a.39.39 0 0 0 0-.587.47.47 0 0 0-.327-.12h-.727l1.507-1.373a.4.4 0 0 0 .133-.294.4.4 0 0 0-.133-.293.504.504 0 0 0-.653 0L3.914 7.92v-.66a.4.4 0 0 0-.133-.293.47.47 0 0 0-.327-.12.5.5 0 0 0-.327.12.4.4 0 0 0-.133.293v1.667a.4.4 0 0 0 .133.293c.087.08.2.12.327.12zm4.794-3.747c.12 0 .24-.047.327-.12l1.506-1.373v.66a.4.4 0 0 0 .134.293.504.504 0 0 0 .653 0 .4.4 0 0 0 .133-.293V3.087a.4.4 0 0 0-.133-.293.47.47 0 0 0-.327-.12H8.714c-.12 0-.24.046-.327.12a.4.4 0 0 0-.133.293c0 .107.047.213.133.293s.2.12.327.12h.727L7.934 4.874a.4.4 0 0 0-.133.293c0 .107.046.22.133.293.087.08.2.12.327.12h-.007zM9.434 8.5h-.727c-.12 0-.24.047-.326.12a.4.4 0 0 0-.134.294c0 .106.047.213.134.293.086.08.2.12.326.12h1.834c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293V7.247a.4.4 0 0 0-.134-.293.47.47 0 0 0-.326-.12.5.5 0 0 0-.327.12.4.4 0 0 0-.133.293v.66L8.574 6.534a.47.47 0 0 0-.327-.12.5.5 0 0 0-.326.12.39.39 0 0 0 0 .587l1.506 1.373zM3.461 5.167c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293v-.66l1.506 1.373a.506.506 0 0 0 .654 0 .39.39 0 0 0 0-.587L4.574 3.507h.727c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293.4.4 0 0 0-.134-.294.47.47 0 0 0-.326-.12H3.467c-.12 0-.24.047-.326.12a.4.4 0 0 0-.134.294V4.76a.4.4 0 0 0 .134.294c.086.08.2.12.326.12zm8.873-4.5H1.667C.934.667.334 1.267.334 2v8c0 .734.6 1.334 1.333 1.334h10.667c.733 0 1.333-.6 1.333-1.334V2c0-.733-.6-1.333-1.333-1.333m0 9.333H1.667V2h10.667z" fill="#717680"/>
                                  </svg>
                                  {order.cargoVolume || order.transportVolume || order.volume || '86'}м³
                                </div>
                                {order.palletCount && (
                                  <div className="transport-card__spec-item">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M2 10.667h8.003L9.053 4H2.95zm4.001-8a.65.65 0 0 0 .476-.192A.64.64 0 0 0 6.668 2a.65.65 0 0 0-.192-.475.64.64 0 0 0-.475-.192.64.64 0 0 0-.474.192.65.65 0 0 0-.193.475q0 .283.193.475A.64.64 0 0 0 6 2.667m1.884 0h1.168q.5 0 .866.333.367.333.45.817l.951 6.666q.084.6-.308 1.059a1.26 1.26 0 0 1-1.01.458H2q-.617 0-1.01-.458a1.29 1.29 0 0 1-.307-1.059l.95-6.666q.084-.484.45-.817.367-.333.867-.333h1.167a4 4 0 0 1-.083-.325A1.7 1.7 0 0 1 4.001 2q0-.834.583-1.417A1.93 1.93 0 0 1 6.001 0 1.93 1.93 0 0 1 7.42.583q.583.584.583 1.417q0 .183-.033.342t-.084.325" fill="#717680"/>
                                    </svg>
                                    {order.palletCount}шт
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="transport-card__row">
                              <div className="transport-card__details">
                                <span>
                                  {Array.isArray(order.loadingType) ? 
                                    order.loadingType.includes('all') ? 'Все загрузки' :
                                    order.loadingType.map((type: string) => 
                                      type === 'back' ? 'Задняя' : 
                                      type === 'side' ? 'Боковая' : 
                                      type === 'top' ? 'Верхняя' : type
                                    ).join(', ') :
                                    order.loadingType === 'back' ? 'Задняя' : 
                                    order.loadingType === 'side' ? 'Боковая' : 
                                    order.loadingType === 'top' ? 'Верхняя' : 'Задняя'
                                  }
                                </span>
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
                                  className="transport-card__details-btn"
                                  onClick={() => toggleCardExpanded(order.id)}
                                >
                                  {expandedCardId === order.id ? 'Свернуть' : 'Подробнее'}
                                  <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ transform: expandedCardId === order.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                                  >
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div className={`transport-card__expanded ${expandedCardId === order.id ? 'expanded' : ''}`}>
                                <div className="transport-card__expanded-content">
                                  <h4>Контактная информация</h4>
                                  <div className="transport-card__contact-info">
                                    <div className="transport-card__contact-row">
                                      <span className="transport-card__contact-label">Имя:</span>
                                      <span className="transport-card__contact-value">
                                        {order.userName || 'Пользователь'}
                                      </span>
                                    </div>
                                    <div className="transport-card__contact-row">
                                      <span className="transport-card__contact-label">Телефон:</span>
                                      <span className="transport-card__contact-value">{order.phone || 'Не указано'}</span>
                                    </div>
                                    {order.email && (
                                      <div className="transport-card__contact-row">
                                        <span className="transport-card__contact-label">Email:</span>
                                        <span className="transport-card__contact-value">{order.email}</span>
                                      </div>
                                    )}
                                    {order.additionalPhone && (
                                      <div className="transport-card__contact-row">
                                        <span className="transport-card__contact-label">Доп. телефон:</span>
                                        <span className="transport-card__contact-value">{order.additionalPhone}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <hr className="transport-card__divider" />
                                  
                                  <div className="transport-card__additional-info">
                                    <div className="transport-card__info-row">
                                      <span className="transport-card__info-label">Условия оплаты:</span>
                                      <span className="transport-card__info-value">
                                        {order.paymentTerm === 'prepayment' ? 'Предоплата' :
                                         order.paymentTerm === 'unloading' ? 'При разгрузке' :
                                         order.paymentTerm === 'deferred' ? 'Отсрочка платежа' : 
                                         order.paymentTerms || 'Не указано'}
                                      </span>
                                    </div>
                                    {order.vehicleCount && (
                                      <div className="transport-card__info-row">
                                        <span className="transport-card__info-label">Количество автомобилей:</span>
                                        <span className="transport-card__info-value">
                                          {order.vehicleCount}
                                        </span>
                                      </div>
                                    )}
                                    {order.palletCount && (
                                      <div className="transport-card__info-row">
                                        <span className="transport-card__info-label">Количество паллет:</span>
                                        <span className="transport-card__info-value">
                                          {order.palletCount} шт
                                        </span>
                                      </div>
                                    )}
                                    {order.additionalInfo && (
                                      <div className="transport-card__info-row">
                                        <span className="transport-card__info-label">Дополнительная информация:</span>
                                        <span className="transport-card__info-value">{order.additionalInfo}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Фильтры для страниц поиска груза/транспорта */}
              {(activePage === 'cargo' || activePage === 'transport') && (
                <div className="search-filters">
                    <h3>Фильтры поиска</h3>
                    
                    <div className="filter-section">
                      <h4>Страна загрузки</h4>
                      <div className="filter-input-container">
                        <input
                          type="text"
                          placeholder="Выберите страну загрузки"
                          value={loadingCountryInput}
                          onChange={(e) => {
                            setLoadingCountryInput(e.target.value);
                            setShowLoadingCountrySuggestions(true);
                          }}
                          onFocus={() => setShowLoadingCountrySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowLoadingCountrySuggestions(false), 200)}
                        />
                        {showLoadingCountrySuggestions && loadingCountryInput && (
                          <div className="autocomplete-suggestions">
                            {filterCountries(loadingCountryInput).map((country, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => addLoadingCountry(country.name)}
                              >
                                {country.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="countries-list">
                        {filters.loadingCountries.map((country, index) => (
                          <div key={index} className="country-tag">
                            <span>{country}</span>
                            <button onClick={() => removeLoadingCountry(country)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Область загрузки</h4>
                      <div className="filter-input-container">
                        <input
                          type="text"
                          placeholder="Выберите область загрузки"
                          value={loadingRegionInput}
                          onChange={(e) => {
                            setLoadingRegionInput(e.target.value);
                            setShowLoadingRegionSuggestions(true);
                          }}
                          onFocus={() => setShowLoadingRegionSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowLoadingRegionSuggestions(false), 200)}
                        />
                        {showLoadingRegionSuggestions && loadingRegionInput && (
                          <div className="autocomplete-suggestions">
                            {filterRegions(loadingRegionInput).map((region, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => addLoadingRegion(region)}
                              >
                                {region}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="regions-list">
                        {filters.loadingRegions.map((region, index) => (
                          <div key={index} className="region-tag">
                            <span>{region}</span>
                            <button onClick={() => removeLoadingRegion(region)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Город загрузки</h4>
                      <div className="filter-input-container">
                        <input
                          type="text"
                          placeholder="Выберите город загрузки"
                          value={loadingCityInput}
                          onChange={(e) => {
                            setLoadingCityInput(e.target.value);
                            setShowLoadingCitySuggestions(true);
                          }}
                          onFocus={() => setShowLoadingCitySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowLoadingCitySuggestions(false), 200)}
                        />
                        {showLoadingCitySuggestions && loadingCityInput && (
                          <div className="autocomplete-suggestions">
                            {filterCities(loadingCityInput).map((city, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => addLoadingCity(city)}
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="cities-list">
                        {filters.loadingCities.map((city, index) => (
                          <div key={index} className="city-tag">
                            <span>{city}</span>
                            <button onClick={() => removeLoadingCity(city)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Страна разгрузки</h4>
                      <div className="filter-input-container">
                        <input
                          type="text"
                          placeholder="Выберите страну разгрузки"
                          value={unloadingCountryInput}
                          onChange={(e) => {
                            setUnloadingCountryInput(e.target.value);
                            setShowUnloadingCountrySuggestions(true);
                          }}
                          onFocus={() => setShowUnloadingCountrySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowUnloadingCountrySuggestions(false), 200)}
                        />
                        {showUnloadingCountrySuggestions && unloadingCountryInput && (
                          <div className="autocomplete-suggestions">
                            {filterCountries(unloadingCountryInput).map((country, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => addUnloadingCountry(country.name)}
                              >
                                {country.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="countries-list">
                        {filters.unloadingCountries.map((country, index) => (
                          <div key={index} className="country-tag">
                            <span>{country}</span>
                            <button onClick={() => removeUnloadingCountry(country)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Область разгрузки</h4>
                      <div className="filter-input-container">
                        <input
                          type="text"
                          placeholder="Выберите область разгрузки"
                          value={unloadingRegionInput}
                          onChange={(e) => {
                            setUnloadingRegionInput(e.target.value);
                            setShowUnloadingRegionSuggestions(true);
                          }}
                          onFocus={() => setShowUnloadingRegionSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowUnloadingRegionSuggestions(false), 200)}
                        />
                        {showUnloadingRegionSuggestions && unloadingRegionInput && (
                          <div className="autocomplete-suggestions">
                            {filterRegions(unloadingRegionInput).map((region, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => addUnloadingRegion(region)}
                              >
                                {region}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="regions-list">
                        {filters.unloadingRegions.map((region, index) => (
                          <div key={index} className="region-tag">
                            <span>{region}</span>
                            <button onClick={() => removeUnloadingRegion(region)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Город разгрузки</h4>
                      <div className="filter-input-container">
                        <input
                          type="text"
                          placeholder="Выберите город разгрузки"
                          value={unloadingCityInput}
                          onChange={(e) => {
                            setUnloadingCityInput(e.target.value);
                            setShowUnloadingCitySuggestions(true);
                          }}
                          onFocus={() => setShowUnloadingCitySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowUnloadingCitySuggestions(false), 200)}
                        />
                        {showUnloadingCitySuggestions && unloadingCityInput && (
                          <div className="autocomplete-suggestions">
                            {filterCities(unloadingCityInput).map((city, index) => (
                              <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => addUnloadingCity(city)}
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="cities-list">
                        {filters.unloadingCities.map((city, index) => (
                          <div key={index} className="city-tag">
                            <span>{city}</span>
                            <button onClick={() => removeUnloadingCity(city)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Вес (тонн)</h4>
                      <div className="filter-inputs-row">
                        <input
                          type="number"
                          placeholder="От"
                          value={filters.weightFrom}
                          onChange={(e) => handleFilterChange('weightFrom', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="До"
                          value={filters.weightTo}
                          onChange={(e) => handleFilterChange('weightTo', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="filter-section">
                      <h4>Объем (м³)</h4>
                      <div className="filter-inputs-row">
                        <input
                          type="number"
                          placeholder="От"
                          value={filters.volumeFrom}
                          onChange={(e) => handleFilterChange('volumeFrom', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="До"
                          value={filters.volumeTo}
                          onChange={(e) => handleFilterChange('volumeTo', e.target.value)}
                        />
                      </div>
                    </div>

                    {activePage === 'transport' && (
                      <div className="filter-section">
                        <h4>Тип транспорта</h4>
                        <select
                          value={filters.vehicleType}
                          onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                        >
                          <option value="">Все типы</option>
                          <option value="tent">Тент</option>
                          <option value="isotherm">Изотерм</option>
                          <option value="refrigerator">Рефрижератор</option>
                          <option value="tank">Цистерна</option>
                          <option value="container">Контейнеровоз</option>
                          <option value="flatbed">Бортовой</option>
                          <option value="lowloader">Низкорамный</option>
                          <option value="car_carrier">Автовоз</option>
                          <option value="grain_carrier">Зерновоз</option>
                          <option value="dump_truck">Самосвал</option>
                        </select>
                      </div>
                    )}

                    <div className="filter-section">
                      <h4>Дата загрузки</h4>
                      <div className="filter-inputs-row">
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        />
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="filter-actions">
                      <button className="filter-btn filter-btn--clear" onClick={clearFilters}>
                        Очистить фильтры
                      </button>
                      <button className="filter-btn filter-btn--search" onClick={filterOrders}>
                        Поиск
                      </button>
                    </div>

                  {/* Результаты поиска */}
                  {searchExecuted && (
                    <div className="search-orders__results">
                      <div className="results-header">
                        <h2>Найдено заказов: {filteredOrders.length}</h2>
                      </div>

                      {filteredOrders.length === 0 ? (
                        <div className="no-orders">
                          <p>Заказы не найдены по заданным критериям.</p>
                        </div>
                      ) : (
                        <div className="cards-grid">
                          {filteredOrders.map((order) => (
                            <div key={order.id} className="transport-card">
                              <div className="transport-card__content">
                                <div className="transport-card__row">
                                  <div className="transport-card__route-info">
                                    <div className="transport-card__route">
                                      {(() => {
                                        const loadingParts = [];
                                        if (order.loadingCity) loadingParts.push(order.loadingCity);
                                        if (order.loadingRegion) loadingParts.push(order.loadingRegion);
                                        if (order.loadingCountry) loadingParts.push(order.loadingCountry);
                                        return loadingParts.length > 0 ? loadingParts.join(', ') : 'Не указано';
                                      })()} → {(() => {
                                        const unloadingParts = [];
                                        if (order.unloadingCity) unloadingParts.push(order.unloadingCity);
                                        if (order.unloadingRegion) unloadingParts.push(order.unloadingRegion);
                                        if (order.unloadingCountry) unloadingParts.push(order.unloadingCountry);
                                        return unloadingParts.length > 0 ? unloadingParts.join(', ') : 'Не указано';
                                      })()}
                                    </div>
                                    <div className="transport-card__type-badge">
                                      {order.type === 'cargo' ? (
                                        <svg width="14" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M12 22C11.1818 22 10.4002 21.6698 8.83693 21.0095C4.94564 19.3657 3 18.5438 3 17.1613C3 16.7742 3 10.0645 3 7M12 22C12.8182 22 13.5998 21.6698 15.1631 21.0095C19.0544 19.3657 21 18.5438 21 17.1613V7M12 22L12 11.3548" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M8.32592 9.69138L5.40472 8.27785C3.80157 7.5021 3 7.11423 3 6.5C3 5.88577 3.80157 5.4979 5.40472 4.72215L8.32592 3.30862C10.1288 2.43621 11.0303 2 12 2C12.9697 2 13.8712 2.4362 15.6741 3.30862L18.5953 4.72215C20.1984 5.4979 21 5.88577 21 6.5C21 7.11423 20.1984 7.5021 18.5953 8.27785L15.6741 9.69138C13.8712 10.5638 12.9697 11 12 11C11.0303 11 10.1288 10.5638 8.32592 9.69138Z" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M6 12L8 13" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M17 4L7 9" stroke="#FE6824" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      ) : (
                                        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M9 .667A1.333 1.333 0 0 1 10.335 2v.667h1.013a1.33 1.33 0 0 1 1.041.5l.987 1.234c.189.236.292.53.292.833V8a1.333 1.333 0 0 1-1.333 1.334 2 2 0 1 1-4 0H5.667a2 2 0 1 1-4 0A1.333 1.333 0 0 1 .334 8V2A1.333 1.333 0 0 1 1.667.667zm-5.333 8a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333m6.667 0a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333M9.001 2H1.667v6h.51a2 2 0 0 1 2.894-.092L5.158 8h3.685l.077-.08.08-.077zm2.346 2h-1.013v3.334c.547 0 1.042.22 1.403.574l.088.092h.509V5.234z" fill="#FE6824"/>
                                        </svg>
                                      )}
                                      {order.type === 'cargo' ? 'Груз' : 'Транспорт'}
                                    </div>
                                    <div className="transport-card__date">
                                      <div>Добавлено {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '09.01.2025'}</div>
                                    </div>
                                  </div>
                                  <div className="transport-card__time-ago">
                                    {order.createdAt ? getTimeAgo(order.createdAt) : 'только что'}
                                  </div>
                                </div>

                                <div className="transport-card__row transport-card__row--second">
                                  <div className="transport-card__distance-cargo">
                                    <div className="transport-card__distance">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      {calculateDistance(order.loadingCity, order.unloadingCity)} км
                                    </div>
                                    <div className="transport-card__cargo-type">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      {Array.isArray(order.cargoType) ? 
                                        order.cargoType.map((type: string) => getCargoTypeName(type)).join(', ') :
                                        getCargoTypeName(order.cargoType) || 'Не указано'
                                      }
                                    </div>
                                  </div>
                                  <div className="transport-card__payment-price">
                                    <div className={`transport-card__payment-badge ${
                                      order.paymentMethod === 'cashless' ? 'transport-card__payment-badge--cashless' :
                                      order.paymentMethod === 'card' ? 'transport-card__payment-badge--card' :
                                      order.paymentMethod === 'combined' ? 'transport-card__payment-badge--combined' :
                                      'transport-card__payment-badge--cashless'
                                    }`}>
                                      {order.paymentMethod === 'cashless' ? 'Наличные' : 
                                       order.paymentMethod === 'card' ? 'На карту' : 
                                       order.paymentMethod === 'combined' ? 'Комбинированный' : 'Наличные'}
                                    </div>
                                    <div className="transport-card__price">
                                      {order.cargoPrice || order.price || '55'} {order.cargoCurrency || 'USD'}
                                    </div>
                                  </div>
                                </div>

                                <div className="transport-card__row">
                                  <div className="transport-card__vehicle-info">
                                    <div className="transport-card__vehicle-type">
                                      <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 .667A1.333 1.333 0 0 1 10.335 2v.667h1.013a1.33 1.33 0 0 1 1.041.5l.987 1.234c.189.236.292.53.292.833V8a1.333 1.333 0 0 1-1.333 1.334 2 2 0 1 1-4 0H5.667a2 2 0 1 1-4 0A1.333 1.333 0 0 1 .334 8V2A1.333 1.333 0 0 1 1.667.667zm-5.333 8a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333m6.667 0a.667.667 0 1 0 0 1.333.667.667 0 0 0 0-1.333M9.001 2H1.667v6h.51a2 2 0 0 1 2.894-.092L5.158 8h3.685l.077-.08.08-.077zm2.346 2h-1.013v3.334c.547 0 1.042.22 1.403.574l.088.092h.509V5.234z" fill="#717680"/>
                                      </svg>
                                      {order.type === 'cargo' ? 
                                        (getVehicleTypeName(order.vehicleType) || 'Тент') :
                                        (getVehicleTypeName(order.vehicleType) || 'Тент')
                                      }
                                    </div>
                                    <div className="transport-card__spec-item">
                                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 10.667h8.003L9.053 4H2.95zm4.001-8a.65.65 0 0 0 .476-.192A.64.64 0 0 0 6.668 2a.65.65 0 0 0-.192-.475.64.64 0 0 0-.475-.192.64.64 0 0 0-.474.192.65.65 0 0 0-.193.475q0 .283.193.475A.64.64 0 0 0 6 2.667m1.884 0h1.168q.5 0 .866.333.367.333.45.817l.951 6.666q.084.6-.308 1.059a1.26 1.26 0 0 1-1.01.458H2q-.617 0-1.01-.458a1.29 1.29 0 0 1-.307-1.059l.95-6.666q.084-.484.45-.817.367-.333.867-.333h1.167a4 4 0 0 1-.083-.325A1.7 1.7 0 0 1 4.001 2q0-.834.583-1.417A1.93 1.93 0 0 1 6.001 0 1.93 1.93 0 0 1 7.42.583q.583.584.583 1.417q0 .183-.033.342t-.084.325" fill="#717680"/>
                                      </svg>
                                      {order.cargoWeight || order.transportWeight || order.capacity || '10'}т
                                    </div>
                                    <div className="transport-card__spec-item">
                                      <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.46 9.334h1.834c.12 0 .24-.047.327-.12a.39.39 0 0 0 0-.587.47.47 0 0 0-.327-.12h-.727l1.507-1.373a.4.4 0 0 0 .133-.294.4.4 0 0 0-.133-.293.504.504 0 0 0-.653 0L3.914 7.92v-.66a.4.4 0 0 0-.133-.293.47.47 0 0 0-.327-.12.5.5 0 0 0-.327.12.4.4 0 0 0-.133.293v1.667a.4.4 0 0 0 .133.293c.087.08.2.12.327.12zm4.794-3.747c.12 0 .24-.047.327-.12l1.506-1.373v.66a.4.4 0 0 0 .134.293.504.504 0 0 0 .653 0 .4.4 0 0 0 .133-.293V3.087a.4.4 0 0 0-.133-.293.47.47 0 0 0-.327-.12H8.714c-.12 0-.24.046-.327.12a.4.4 0 0 0-.133.293c0 .107.047.213.133.293s.2.12.327.12h.727L7.934 4.874a.4.4 0 0 0-.133.293c0 .107.046.22.133.293.087.08.2.12.327.12h-.007zM9.434 8.5h-.727c-.12 0-.24.047-.326.12a.4.4 0 0 0-.134.294c0 .106.047.213.134.293.086.08.2.12.326.12h1.834c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293V7.247a.4.4 0 0 0-.134-.293.47.47 0 0 0-.326-.12.5.5 0 0 0-.327.12.4.4 0 0 0-.133.293v.66L8.574 6.534a.47.47 0 0 0-.327-.12.5.5 0 0 0-.326.12.39.39 0 0 0 0 .587l1.506 1.373zM3.461 5.167c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293v-.66l1.506 1.373a.506.506 0 0 0 .654 0 .39.39 0 0 0 0-.587L4.574 3.507h.727c.12 0 .24-.047.326-.12a.4.4 0 0 0 .134-.293.4.4 0 0 0-.134-.294.47.47 0 0 0-.326-.12H3.467c-.12 0-.24.047-.326.12a.4.4 0 0 0-.134.294V4.76a.4.4 0 0 0 .134.294c.086.08.2.12.326.12zm8.873-4.5H1.667C.934.667.334 1.267.334 2v8c0 .734.6 1.334 1.333 1.334h10.667c.733 0 1.333-.6 1.333-1.334V2c0-.733-.6-1.333-1.333-1.333m0 9.333H1.667V2h10.667z" fill="#717680"/>
                                      </svg>
                                      {order.cargoVolume || order.transportVolume || order.volume || '86'}м³
                                    </div>
                                    {order.palletCount && (
                                      <div className="transport-card__spec-item">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M2 10.667h8.003L9.053 4H2.95zm4.001-8a.65.65 0 0 0 .476-.192A.64.64 0 0 0 6.668 2a.65.65 0 0 0-.192-.475.64.64 0 0 0-.475-.192.64.64 0 0 0-.474.192.65.65 0 0 0-.193.475q0 .283.193.475A.64.64 0 0 0 6 2.667m1.884 0h1.168q.5 0 .866.333.367.333.45.817l.951 6.666q.084.6-.308 1.059a1.26 1.26 0 0 1-1.01.458H2q-.617 0-1.01-.458a1.29 1.29 0 0 1-.307-1.059l.95-6.666q.084-.484.45-.817.367-.333.867-.333h1.167a4 4 0 0 1-.083-.325A1.7 1.7 0 0 1 4.001 2q0-.834.583-1.417A1.93 1.93 0 0 1 6.001 0 1.93 1.93 0 0 1 7.42.583q.583.584.583 1.417q0 .183-.033.342t-.084.325" fill="#717680"/>
                                        </svg>
                                        {order.palletCount}шт
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="transport-card__row">
                                  <div className="transport-card__details">
                                    <span>
                                      {Array.isArray(order.loadingType) ? 
                                        order.loadingType.includes('all') ? 'Все загрузки' :
                                        order.loadingType.map((type: string) => 
                                          type === 'back' ? 'Задняя' : 
                                          type === 'side' ? 'Боковая' : 
                                          type === 'top' ? 'Верхняя' : type
                                        ).join(', ') :
                                        order.loadingType === 'back' ? 'Задняя' : 
                                        order.loadingType === 'side' ? 'Боковая' : 
                                        order.loadingType === 'top' ? 'Верхняя' : 'Задняя'
                                      }
                                    </span>
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
                                      className="transport-card__details-btn"
                                      onClick={() => toggleCardExpanded(order.id)}
                                    >
                                      {expandedCardId === order.id ? 'Свернуть' : 'Подробнее'}
                                      <svg 
                                        width="14" 
                                        height="14" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{ transform: expandedCardId === order.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                                      >
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                <div className={`transport-card__expanded ${expandedCardId === order.id ? 'expanded' : ''}`}>
                                    <div className="transport-card__expanded-content">
                                      <h4>Контактная информация</h4>
                                      <div className="transport-card__contact-info">
                                        <div className="transport-card__contact-row">
                                          <span className="transport-card__contact-label">Имя:</span>
                                          <span className="transport-card__contact-value">
                                            {order.userName || 'Пользователь'}
                                          </span>
                                        </div>
                                        <div className="transport-card__contact-row">
                                          <span className="transport-card__contact-label">Телефон:</span>
                                          <span className="transport-card__contact-value">{order.phone || 'Не указано'}</span>
                                        </div>
                                        {order.email && (
                                          <div className="transport-card__contact-row">
                                            <span className="transport-card__contact-label">Email:</span>
                                            <span className="transport-card__contact-value">{order.email}</span>
                                          </div>
                                        )}
                                        {order.additionalPhone && (
                                          <div className="transport-card__contact-row">
                                            <span className="transport-card__contact-label">Доп. телефон:</span>
                                            <span className="transport-card__contact-value">{order.additionalPhone}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <hr className="transport-card__divider" />
                                      
                                      <div className="transport-card__additional-info">
                                        <div className="transport-card__info-row">
                                          <span className="transport-card__info-label">Условия оплаты:</span>
                                          <span className="transport-card__info-value">
                                            {order.paymentTerm === 'prepayment' ? 'Предоплата' :
                                             order.paymentTerm === 'unloading' ? 'При разгрузке' :
                                             order.paymentTerm === 'deferred' ? 'Отсрочка платежа' : 
                                             order.paymentTerms || 'Не указано'}
                                          </span>
                                        </div>
                                        {order.vehicleCount && (
                                          <div className="transport-card__info-row">
                                            <span className="transport-card__info-label">Количество автомобилей:</span>
                                            <span className="transport-card__info-value">
                                              {order.vehicleCount}
                                            </span>
                                          </div>
                                        )}
                                        {order.palletCount && (
                                          <div className="transport-card__info-row">
                                            <span className="transport-card__info-label">Количество паллет:</span>
                                            <span className="transport-card__info-value">
                                              {order.palletCount} шт
                                            </span>
                                          </div>
                                        )}
                                        {order.additionalInfo && (
                                          <div className="transport-card__info-row">
                                            <span className="transport-card__info-label">Дополнительная информация:</span>
                                            <span className="transport-card__info-value">{order.additionalInfo}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                              </div>
                            </div>
                      ))}
                    </div>
                  )}
                </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchOrders;
