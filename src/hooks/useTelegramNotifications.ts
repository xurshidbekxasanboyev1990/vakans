import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface TelegramBotConfig {
  botToken?: string;
  chatId?: string;
  enabled: boolean;
}

interface NotificationPayload {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Telegram Bot Integration Hook
 * Xabarnomalarni Telegram orqali yuborish
 */
export function useTelegramNotifications(config: TelegramBotConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (config.enabled && config.botToken && config.chatId) {
      validateConnection();
    }
  }, [config.enabled, config.botToken, config.chatId]);

  const validateConnection = async () => {
    if (!config.botToken || !config.chatId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.telegram.org/bot${config.botToken}/getMe`
      );
      const data = await response.json();
      
      if (data.ok) {
        setIsConnected(true);
        logger.info('Telegram bot connected', { botName: data.result.username });
      } else {
        setIsConnected(false);
        logger.error('Telegram bot connection failed', data);
      }
    } catch (error) {
      setIsConnected(false);
      logger.error('Telegram bot validation error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = useCallback(
    async (payload: NotificationPayload) => {
      if (!config.enabled || !config.botToken || !config.chatId) {
        logger.warn('Telegram notifications disabled or not configured');
        return { success: false, error: 'Not configured' };
      }

      try {
        const emoji = {
          info: 'ℹ️',
          success: '✅',
          warning: '⚠️',
          error: '❌',
        }[payload.type || 'info'];

        let message = `${emoji} *${payload.title}*\n\n${payload.message}`;

        if (payload.url) {
          message += `\n\n🔗 [Ko'rish](${payload.url})`;
        }

        const response = await fetch(
          `https://api.telegram.org/bot${config.botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: config.chatId,
              text: message,
              parse_mode: 'Markdown',
              disable_web_page_preview: false,
            }),
          }
        );

        const data = await response.json();

        if (data.ok) {
          logger.info('Telegram notification sent', { messageId: data.result.message_id });
          return { success: true, messageId: data.result.message_id };
        } else {
          logger.error('Telegram send failed', data);
          return { success: false, error: data.description };
        }
      } catch (error) {
        logger.error('Telegram notification error', error);
        return { success: false, error: String(error) };
      }
    },
    [config]
  );

  const sendJobNotification = useCallback(
    async (jobTitle: string, companyName: string, jobUrl: string) => {
      return sendNotification({
        title: 'Yangi ish e\'loni!',
        message: `📢 *${jobTitle}*\n🏢 ${companyName}\n\nSizga mos ish topildi!`,
        type: 'success',
        url: jobUrl,
      });
    },
    [sendNotification]
  );

  const sendApplicationNotification = useCallback(
    async (status: string, jobTitle: string, detailsUrl: string) => {
      const statusText = {
        accepted: '🎉 Sizning arizangiz qabul qilindi!',
        rejected: '😔 Sizning arizangiz rad etildi',
        viewed: '👀 Sizning arizangiz ko\'rib chiqildi',
      }[status] || 'Ariza holati o\'zgardi';

      return sendNotification({
        title: statusText,
        message: `Ish: *${jobTitle}*`,
        type: status === 'accepted' ? 'success' : status === 'rejected' ? 'error' : 'info',
        url: detailsUrl,
      });
    },
    [sendNotification]
  );

  const sendInterviewReminder = useCallback(
    async (jobTitle: string, companyName: string, time: string) => {
      return sendNotification({
        title: '⏰ Suhbat eslatmasi',
        message: `1 soatdan keyin suhbatingiz bor!\n\n🏢 ${companyName}\n💼 ${jobTitle}\n⏰ ${time}`,
        type: 'warning',
      });
    },
    [sendNotification]
  );

  const sendDeadlineAlert = useCallback(
    async (jobTitle: string, hoursLeft: number, jobUrl: string) => {
      return sendNotification({
        title: '⏳ E\'lon tugaydi!',
        message: `*${jobTitle}*\n\n${hoursLeft} soatdan keyin e'lon tugaydi. Ariza berishga shoshiling!`,
        type: 'warning',
        url: jobUrl,
      });
    },
    [sendNotification]
  );

  return {
    isConnected,
    isLoading,
    sendNotification,
    sendJobNotification,
    sendApplicationNotification,
    sendInterviewReminder,
    sendDeadlineAlert,
    validateConnection,
  };
}

/**
 * Demo Usage Example:
 * 
 * const telegram = useTelegramNotifications({
 *   botToken: 'YOUR_BOT_TOKEN',
 *   chatId: 'YOUR_CHAT_ID',
 *   enabled: true,
 * });
 * 
 * // Send custom notification
 * telegram.sendNotification({
 *   title: 'Test',
 *   message: 'Hello from Vakans.uz!',
 *   type: 'success',
 * });
 * 
 * // Send job notification
 * telegram.sendJobNotification(
 *   'Frontend Developer',
 *   'TechCorp',
 *   'https://vakans.uz/jobs/123'
 * );
 */

/**
 * Setup Instructions:
 * 
 * 1. BotFather orqali bot yarating:
 *    - Telegram'da @BotFather ni toping
 *    - /newbot buyrug'ini yuboring
 *    - Bot nomini kiriting
 *    - Token oling
 * 
 * 2. Chat ID ni oling:
 *    - @userinfobot ga /start yuboring
 *    - Sizning chat ID ni olasiz
 * 
 * 3. .env fayliga qo'shing:
 *    VITE_TELEGRAM_BOT_TOKEN=your_bot_token
 *    VITE_TELEGRAM_CHAT_ID=your_chat_id
 * 
 * 4. Settings sahifasida enable qiling
 */
