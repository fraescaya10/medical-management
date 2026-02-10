import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    FirebaseModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
