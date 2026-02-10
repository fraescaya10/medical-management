import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_AUTH')
    private readonly auth: admin.auth.Auth,
    @Inject('FIREBASE_FIRESTORE')
    private readonly firestore: admin.firestore.Firestore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      const userDoc = await this.firestore
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }

      if (!userDoc.data()?.isActive) {
        throw new UnauthorizedException('User is not active');
      }

      request.user = {
        uid: decodedToken.uid,
        ...userDoc.data(),
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token, ${error.message}`);
    }
  }
}
