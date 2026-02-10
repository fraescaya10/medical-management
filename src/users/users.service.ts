import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class UsersService {
  constructor(
    @Inject('FIREBASE_FIRESTORE')
    private readonly firestore: admin.firestore.Firestore,
  ) {}

  async getUserById(id: string) {
    try {
      const userDoc = await this.firestore.collection('users').doc(id).get();
      return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch user with id ${id}: ${error.message}`,
      );
    }
  }

  async getAllUsers() {
    try {
      const usersSnapshot = await this.firestore.collection('users').get();
      return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new BadRequestException(`Failed to fetch users: ${error.message}`);
    }
  }
}
