import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService implements OnModuleInit {
  private readonly logger = new Logger(TwilioService.name);

  twilioClient: twilio.Twilio;

  async onModuleInit() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid) {
      this.logger.error('==> TWILIO_ACCOUNT_SID missing');

      return;
    }

    if (!authToken) {
      this.logger.error('==> TWILIO_AUTH_TOKEN missing');

      return;
    }

    this.twilioClient = twilio(accountSid, authToken);
  }

  /**
   * Sends an SMS message.
   * @param message The message to be sent
   */
  async sendSMS(message: string): Promise<void> {
    const phoneFromNumber = process.env.PHONE_FROM_NUMBER;
    const phoneToNumber = process.env.PHONE_TO_NUMBER;

    await this.twilioClient.messages.create({
      from: phoneFromNumber,
      body: message,
      to: phoneToNumber,
    });
  }

  /**
   * Sends a WhatsApp message.
   * @param message The message to be sent
   */
  async sendWhatsAppMessage(message): Promise<void> {
    const whatsappFromNumber = process.env.WHATSAPP_FROM_NUMBER;
    const whatsappToNumber = process.env.PHONE_TO_NUMBER;

    await this.twilioClient.messages.create({
      from: `whatsapp:${whatsappFromNumber}`,
      body: message,
      to: `whatsapp:${whatsappToNumber}`,
    });
  }
}
