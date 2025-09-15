// Интерфейс для результата верификации
export interface VerificationResult {
  success: boolean;
  message: string;
  code?: string;
}

// Интерфейс для параметров верификации
export interface VerificationParams {
  phone: string;
  userName?: string;
}

/**
 * Сервис для отправки SMS кодов верификации
 */
export class VerificationService {
  private static instance: VerificationService;
  private generatedCodes: Map<string, { code: string; timestamp: number }> = new Map();
  private readonly CODE_EXPIRY_TIME = 10 * 60 * 1000; // 10 минут

  private constructor() {}

  /**
   * Получает единственный экземпляр сервиса (Singleton)
   */
  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  /**
   * Генерирует случайный 4-значный код
   */
  private generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Отправляет код верификации на телефон
   */
  public async sendCode(params: VerificationParams): Promise<VerificationResult> {
    try {
      // Генерируем код
      const code = this.generateVerificationCode();
      
      // Сохраняем код с временной меткой
      this.generatedCodes.set(params.phone, {
        code,
        timestamp: Date.now()
      });

      // Отправляем код на SMS
      return await this.sendSMSCode(params.phone, code, params.userName);

    } catch (error) {
      console.error('Ошибка отправки кода:', error);
      return {
        success: false,
        message: 'Не удалось отправить код. Попробуйте еще раз.'
      };
    }
  }

  /**
   * Отправляет код на SMS (имитация для бесплатного использования)
   */
  private async sendSMSCode(
    phone: string, 
    code: string, 
    userName?: string
  ): Promise<VerificationResult> {
    // Имитируем отправку SMS
    // В реальном проекте здесь будет интеграция с SMS сервисом
    
    // Для демонстрации показываем код в консоли
    console.log(code);
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Код подтверждения отправлен на ${phone}`,
      code: code // Возвращаем код для тестирования
    };
  }

  /**
   * Проверяет код верификации
   */
  public verifyCode(phone: string, inputCode: string): VerificationResult {
    const storedData = this.generatedCodes.get(phone);
    
    if (!storedData) {
      return {
        success: false,
        message: 'Код не найден. Запросите новый код.'
      };
    }

    // Проверяем срок действия кода
    if (Date.now() - storedData.timestamp > this.CODE_EXPIRY_TIME) {
      this.generatedCodes.delete(phone);
      return {
        success: false,
        message: 'Код истек. Запросите новый код.'
      };
    }

    // Проверяем правильность кода
    if (storedData.code === inputCode) {
      // Удаляем использованный код
      this.generatedCodes.delete(phone);
      return {
        success: true,
        message: 'Код подтвержден успешно!'
      };
    } else {
      return {
        success: false,
        message: 'Неверный код. Попробуйте еще раз.'
      };
    }
  }

  /**
   * Проверяет, есть ли активный код для телефона
   */
  public hasActiveCode(phone: string): boolean {
    const storedData = this.generatedCodes.get(phone);
    if (!storedData) return false;
    
    return Date.now() - storedData.timestamp <= this.CODE_EXPIRY_TIME;
  }

  /**
   * Очищает все истекшие коды
   */
  public cleanupExpiredCodes(): void {
    const now = Date.now();
    this.generatedCodes.forEach((data, phone) => {
      if (now - data.timestamp > this.CODE_EXPIRY_TIME) {
        this.generatedCodes.delete(phone);
      }
    });
  }

  /**
   * Получает количество активных кодов
   */
  public getActiveCodesCount(): number {
    this.cleanupExpiredCodes();
    return this.generatedCodes.size;
  }

  /**
   * Получает код для тестирования (только для разработки)
   */
  public getCodeForTesting(phone: string): string | null {
    const storedData = this.generatedCodes.get(phone);
    if (storedData && Date.now() - storedData.timestamp <= this.CODE_EXPIRY_TIME) {
      return storedData.code;
    }
    return null;
  }
}

// Экспортируем экземпляр сервиса
export const verificationService = VerificationService.getInstance();
