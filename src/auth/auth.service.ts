import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIREBASE_AUTH')
    private readonly auth: admin.auth.Auth,
    @Inject('FIREBASE_FIRESTORE')
    private readonly firestore: admin.firestore.Firestore,
  ) {}
  async register(registerDto: RegisterDto) {
    try {
      // Create a new user in Firebase Authentication
      const user = await this.auth.createUser({
        email: registerDto.email,
        password: registerDto.password,
      });

      // Create a new user in Firestore using the user's UID added in Firebase Authentication
      await this.firestore.collection('users').doc(user.uid).set({
        name: registerDto.name,
        email: registerDto.email,
        role: registerDto.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate an email verification link for the user
      const emailLink = await this.auth.generateEmailVerificationLink(
        registerDto.email,
      );

      return {
        uid: user.uid,
        generateEmailVerificationLink: emailLink,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Verify if the user exists
      const user = await this.auth.getUser(loginDto.uid);
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      // Verify if the user's email is verified
      if (!user.emailVerified) {
        throw new BadRequestException('Email not verified');
      }

      // Generate a custom token for the user
      const token = await this.auth.createCustomToken(user.uid);
      return {
        token,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async confirmEmail(uid: string) {
    // Verify if the user exists
    const user = await this.auth.getUser(uid);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Update the user's email verification status in Firebase Authentication
    await this.auth.updateUser(uid, { emailVerified: true });

    // Update the user's email verification status in Firestore
    await this.firestore.collection('users').doc(uid).update({
      emailVerified: true,
      updatedAt: new Date(),
    });

    return {
      message: 'Email verified successfully',
    };
  }
}
