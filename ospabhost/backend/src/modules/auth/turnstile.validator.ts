import axios from 'axios';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileValidationResult {
  success: boolean;
  errorCodes?: string[];
  message?: string;
}

/**
 * Валидирует токен Cloudflare Turnstile на стороне сервера
 * @param token - токен, полученный от клиента
 * @param remoteip - IP-адрес клиента (опционально)
 * @returns результат валидации
 */
export async function validateTurnstileToken(
  token: string,
  remoteip?: string
): Promise<TurnstileValidationResult> {
  if (!TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY не найден в переменных окружения');
    return {
      success: false,
      message: 'Turnstile не настроен на сервере',
    };
  }

  if (!token) {
    return {
      success: false,
      message: 'Токен капчи не предоставлен',
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (remoteip) {
      formData.append('remoteip', remoteip);
    }

    const response = await axios.post(TURNSTILE_VERIFY_URL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = response.data;

    if (data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        errorCodes: data['error-codes'],
        message: 'Проверка капчи не прошла',
      };
    }
  } catch (error) {
    console.error('Ошибка при валидации Turnstile:', error);
    return {
      success: false,
      message: 'Ошибка при проверке капчи',
    };
  }
}
