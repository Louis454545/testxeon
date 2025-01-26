import { Message } from '../types';
import { MessageHandler } from '../components/MessageHandler';

/**
 * Service for handling message processing and communication
 */
export class MessageService {
  /**
   * Process and send a message, capturing current page data
   */
  static async sendMessage(
    content: string,
    task?: string,
    previousMessages: Message[] = []
  ): Promise<Message> {
    return MessageHandler.processMessage(content, task, previousMessages);
  }
}