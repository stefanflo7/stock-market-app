import { Module } from '@nestjs/common';
import { NasdaqApiService } from './nasdaq-api.service';

@Module({
  imports: [],
  controllers: [],
  providers: [NasdaqApiService],
  exports: [NasdaqApiService],
})
export class NasdaqApiModule {}
