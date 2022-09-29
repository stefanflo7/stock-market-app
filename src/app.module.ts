import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioModule } from './messaging/twilio/twilio.module';
import { NasdaqApiModule } from './stock-data/nasdaq-api.module';
import { TaskRunner } from './task-runner.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TwilioModule,
    NasdaqApiModule,
  ],
  controllers: [],
  providers: [TaskRunner],
  exports: [],
})
export class AppModule {}
