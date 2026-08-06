import { Module } from '@nestjs/common';

import { AsteriskService } from './asterisk.service';
import { AsteriskController } from './asterisk.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
  ],

  controllers: [
    AsteriskController,
  ],

  providers: [
    AsteriskService,
  ],

  exports: [
    AsteriskService,
  ],
})
export class AsteriskModule {}