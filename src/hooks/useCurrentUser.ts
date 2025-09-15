import { useState, useEffect } from 'react';
import { getGlobalTestDB } from '../data/testData';

export interface CurrentUser {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const useCurrentUser = (): CurrentUser | null => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Проверяем флаг полной очистки
    const clearedAll = localStorage.getItem('CLEARED_ALL_DATA');
    if (clearedAll === 'true') {
      setCurrentUser(null);
      return;
    }
    
    // Получаем данные пользователя из localStorage
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Если у пользователя нет ID, пытаемся найти его в базе данных
        if (!userData.id) {
          const testDB = getGlobalTestDB();
          const dbUser = testDB.users[userData.phone];
          
          if (dbUser && dbUser.id) {
            // Используем ID из базы данных
            const updatedUserData = {
              ...userData,
              id: dbUser.id
            };
            
            // Обновляем в localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
            setCurrentUser(updatedUserData);
          } else {
            // Создаем новый ID только если пользователя нет в базе
            const updatedUserData = {
              ...userData,
              id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            // Обновляем в localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
            setCurrentUser(updatedUserData);
          }
        } else {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.warn('Ошибка парсинга данных пользователя:', error);
      }
    }
  }, []);

  return currentUser;
};
