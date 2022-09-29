import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
