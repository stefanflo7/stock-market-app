import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import 'reflect-metadata';
import { TwilioService } from './messaging/twilio/twilio.service';
import { NasdaqApiService } from './stock-data/nasdaq-api.service';

@Command({
  name: 'run',
  arguments: '<stockSymbol> <startDate> <endDate>',
  options: { isDefault: true },
})
export class TaskRunner extends CommandRunner {
  private readonly logger = new Logger(TaskRunner.name);

  constructor(
    private readonly nasdaqApiService: NasdaqApiService,
    private readonly twilioService: TwilioService,
  ) {
    super();
  }

  /**
   * Retrieves the simple stock return percentage and maximum drawdown percentage for
   * a stock during the specified period and sends them as SMS and WhatApp messages
   * @param inputs Array containg on first position the stockSymbol, on second positon the startDate and on the third position the endDate
   */
  async run(inputs: string[]): Promise<void> {
    const stockSymbol = inputs[0];
    const startDate = inputs[1];
    const endDate = inputs[2];

    this.logger.log(
      `TaskRunner.run called with stockSymbol '${stockSymbol}', startDate: '${startDate}', and endDate: ${endDate}`,
    );

    const stockReturnPercentage =
      await this.nasdaqApiService.getSimpleStockReturnPercentage(
        stockSymbol,
        startDate,
        endDate,
      );

    const maxDrawdownPercentage =
      await this.nasdaqApiService.getMaximumDrawdownPercentage(
        stockSymbol,
        startDate,
        endDate,
      );

    const message =
      `The stock return percentage for ${stockSymbol} between ${startDate} ` +
      `and ${endDate} is ${stockReturnPercentage.toFixed(2)}%. \n` +
      `The maximum drawback is ${maxDrawdownPercentage.toFixed(2)}.`;

    await this.twilioService.sendSMS(message);
    await this.twilioService.sendWhatsAppMessage(message);

    this.logger.log(message);
  }
}
