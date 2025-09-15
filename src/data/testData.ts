export interface TestPhoneData {
  [phone: string]: string; 
}

export interface UserData {
  id: string;
  phone: string;
  password: string;
  isRegistered: boolean;
  firstName?: string;  
  lastName?: string;   
  email?: string;
}

export interface TestDB {
  codes: TestPhoneData;
  users: { [phone: string]: UserData };
  lastRequestTime: { [phone: string]: number };
  attempts: { [phone: string]: number };
}

export const TEST_PHONES: TestPhoneData = {
  '+998901234567': '1234',
  '+998901234568': '5678',
  '+998901234569': '9999',
  '+380635032027': '2027',
  '+1234567890': '0000'  // Простой тестовый пользователь для Vercel
};

const STORAGE_KEY = 'logistics_app_users';

const DEFAULT_USERS: { [phone: string]: UserData } = {
  '+998901234567': {
    id: 'user_001',
    phone: '+998901234567',
    password: 'Test123!',
    isRegistered: true,
    firstName: 'Алексей',
    lastName: 'Петров'
  },
  '+998901234568': {
    id: 'user_002',
    phone: '+998901234568',
    password: 'Test456!',
    isRegistered: true,
    firstName: 'Мария',
    lastName: 'Иванова'
  },
  '+998901234569': {
    id: 'user_003',
    phone: '+998901234569',
    password: 'Test789!',
    isRegistered: true,
    firstName: 'Дмитрий',
    lastName: 'Сидоров'
  },
  '+380635032027': {
    id: 'user_004',
    phone: '+380635032027',
    password: 'Ukraine2027!',
    isRegistered: true,
    firstName: 'Виктор',
    lastName: 'Кравчук'
  },
  '+1234567890': {
    id: 'user_demo',
    phone: '+1234567890',
    password: 'Demo123!',
    isRegistered: true,
    firstName: 'Демо',
    lastName: 'Пользователь'
  }
};


const loadUsersFromStorage = (): { [phone: string]: UserData } => {
  try {
    // Проверяем флаг полной очистки
    const clearedAll = localStorage.getItem('CLEARED_ALL_DATA');
    if (clearedAll === 'true') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed; // Только пользователи из localStorage
      }
      return {}; // Пустой объект если нет пользователей в localStorage
    }
    
    // Обычная загрузка с предустановленными пользователями
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_USERS, ...parsed }; 
    }
  } catch (error) {
    console.warn('⚠️ Ошибка загрузки данных из localStorage:', error);
  }
  return DEFAULT_USERS;
};

const loadUsersFromStorageEmpty = (): { [phone: string]: UserData } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed; // Только пользователи из localStorage, без предустановленных
    }
  } catch (error) {
    console.warn('⚠️ Ошибка загрузки данных из localStorage:', error);
  }
  return {}; // Пустой объект - никаких пользователей
};

export const saveUsersToStorage = (users: { [phone: string]: UserData }): void => {
  try {
    const customUsers: { [phone: string]: UserData } = {};
    Object.entries(users).forEach(([phone, userData]) => {
      if (!DEFAULT_USERS[phone]) {
        customUsers[phone] = userData;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customUsers));
  } catch (error) {
    console.warn('⚠️ Ошибка сохранения данных в localStorage:', error);
  }
};

export const updateUserInDB = (phone: string, userData: UserData): void => {
  try {
    // Обновляем в глобальной базе данных
    globalTestDB.users[phone] = userData;
    
    // Сохраняем в localStorage
    saveUsersToStorage(globalTestDB.users);
  } catch (error) {
    console.warn('⚠️ Ошибка обновления пользователя:', error);
  }
};

export const logoutUser = (): void => {
  try {
    // Очищаем текущую сессию пользователя
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.warn('⚠️ Ошибка при выходе из системы:', error);
  }
};

export const clearAllUserData = (): void => {
  try {
    // Очищаем все данные пользователей
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('currentUser');
    
    // Очищаем все верификации
    localStorage.removeItem('document_verification_data');
    
    // Очищаем все грузы и транспорты
    localStorage.removeItem('transportCards');
    
    // Очищаем все пользовательские верификации
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('document_verification_') || key.startsWith('transportCards_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Сбрасываем глобальную базу данных
    globalTestDB = {
      codes: { ...TEST_PHONES },
      users: { ...DEFAULT_USERS }, 
      lastRequestTime: {},
      attempts: {}
    };
  } catch (error) {
    console.warn('⚠️ Ошибка при очистке данных:', error);
  }
};

export const clearEverything = (): void => {
  try {
    // Очищаем ВСЕ данные - полный сброс
    localStorage.clear();
    
    // Устанавливаем флаг полной очистки
    localStorage.setItem('CLEARED_ALL_DATA', 'true');
    
    // Принудительно очищаем currentUser (на случай если он восстановился)
    localStorage.removeItem('currentUser');
    
    // Сбрасываем глобальную базу данных к пустому состоянию
    globalTestDB = {
      codes: { ...TEST_PHONES },
      users: {}, // Пустой объект - никаких пользователей
      lastRequestTime: {},
      attempts: {}
    };
  } catch (error) {
    console.warn('⚠️ Ошибка при полной очистке данных:', error);
  }
};

export const resetToDefault = (): void => {
  try {
    // Удаляем флаг полной очистки
    localStorage.removeItem('CLEARED_ALL_DATA');
    
    // Сбрасываем глобальную базу данных к состоянию по умолчанию
    globalTestDB = {
      codes: { ...TEST_PHONES },
      users: { ...DEFAULT_USERS }, 
      lastRequestTime: {},
      attempts: {}
    };
  } catch (error) {
    console.warn('⚠️ Ошибка при сбросе к состоянию по умолчанию:', error);
  }
};

// Добавляем функции в глобальный объект для удобства
if (typeof window !== 'undefined') {
  (window as any).clearAllUserData = clearAllUserData;
  (window as any).clearEverything = clearEverything;
  (window as any).resetToDefault = resetToDefault;
}

let globalTestDB: TestDB = {
  codes: { ...TEST_PHONES },
  users: loadUsersFromStorage(),
  lastRequestTime: {},
  attempts: {}
};

export const createTestDB = (): TestDB => {
  return globalTestDB;
};

export const getGlobalTestDB = (): TestDB => {
  return globalTestDB;
};

export const clearStoredUsers = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Пользовательские данные удалены из localStorage');
  } catch (error) {
    console.warn('⚠️ Ошибка очистки localStorage:', error);
  }
};

export const resetTestDB = (): void => {
  clearStoredUsers();
  
  globalTestDB = {
    codes: { ...TEST_PHONES },
    users: { ...DEFAULT_USERS }, 
    lastRequestTime: {},
    attempts: {}
  };
  console.log('🔄 База данных сброшена к исходному состоянию');
};

export const isTestPhone = (phone: string): boolean => {
  return phone in TEST_PHONES;
};

export const getTestCode = (phone: string): string | null => {
  return TEST_PHONES[phone] || null;
};

export const isUserRegistered = (phone: string, db: TestDB): boolean => {
  return phone in db.users && db.users[phone].isRegistered;
};

export const verifyUserPassword = (phone: string, password: string, db: TestDB): boolean => {
  const user = db.users[phone];
  return user && user.isRegistered && user.password === password;
};


export const registerUser = (phone: string, password: string, db: TestDB, firstName?: string, lastName?: string): void => {
  db.users[phone] = {
    id: `user_${Date.now()}`,
    phone,
    password,
    isRegistered: true,
    firstName,
    lastName
  };
  saveUsersToStorage(db.users);
  console.log(`✅ Пользователь ${phone} (${firstName} ${lastName}) успешно зарегистрирован и сохранен в localStorage`);
};

export const updateUserPassword = (phone: string, newPassword: string, db: TestDB): void => {
  if (db.users[phone]) {
    db.users[phone].password = newPassword;
    saveUsersToStorage(db.users);
    console.log(`✅ Пароль для ${phone} успешно изменен и сохранен в localStorage`);
  }
};

export const updateUserEmail = (phone: string, email: string, db: TestDB): void => {
  if (!db.users[phone]) return;
  const normalized = email.trim().toLowerCase();
  const alreadyUsed = Object.entries(db.users).some(([p, user]) => {
    if (p === phone) return false;
    return (user.email || '').toLowerCase() === normalized;
  });
  if (alreadyUsed) {
    throw new Error('Email already in use');
  }
  db.users[phone].email = email;
  saveUsersToStorage(db.users);
  console.log(`✅ E-mail для ${phone} обновлен на ${email} и сохранен в localStorage`);
};

export const logTestData = (title: string): void => {
  console.log('');
  console.log('==================================================');
  console.log(`                ${title}`);
  console.log('==================================================');
  console.log('');
  console.log('🚀 ДЕМО-ПОЛЬЗОВАТЕЛЬ ДЛЯ VERCEL:');
  console.log('📱 Номер: +1234567890');
  console.log('🔑 Пароль: Demo123!');
  console.log('👤 Имя: Демо Пользователь');
  console.log('');
  console.log('📋 ВСЕ ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ:');
  Object.entries(TEST_PHONES).forEach(([phone, code]) => {
    const user = DEFAULT_USERS[phone];
    if (user) {
      console.log(`📱 ${phone} → код: ${code} | пароль: ${user.password} | ${user.firstName} ${user.lastName}`);
    } else {
      console.log(`📱 ${phone} → код: ${code}`);
    }
  });
  console.log('');
  console.log('💡 Используйте эти данные для тестирования');
  console.log('');
};


