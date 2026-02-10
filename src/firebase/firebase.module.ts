import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (admin.apps.length > 0) return admin.app();
        const privateKey = configService.get<string>('FIREBASE_PRIVATE_KEY');
        const formattedKey = privateKey
          ? privateKey.replace(/"/g, '').replace(/\\n/g, '\n')
          : undefined;
        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
            clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
            privateKey: formattedKey,
          }),
        });
      },
    },
    {
      provide: 'FIREBASE_AUTH',
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.auth(),
    },
    {
      provide: 'FIREBASE_FIRESTORE',
      inject: ['FIREBASE_APP'],
      useFactory: (app: admin.app.App) => app.firestore(),
    },
  ],
  exports: ['FIREBASE_AUTH', 'FIREBASE_FIRESTORE'],
})
export class FirebaseModule {}
