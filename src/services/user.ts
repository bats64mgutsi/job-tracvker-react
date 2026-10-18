import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, firebaseAuth } from '../firebase';
import { User } from '../models/user.model';

export class UserService {
  private db = firestore;

  private userDoc() {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) throw new Error('Cannot access user: No user is signed in.');
    return doc(this.db, 'users', uid);
  }

  async updateUser(newUser: User): Promise<void> {
    await setDoc(this.userDoc(), { cv: newUser.cv ?? '', email: newUser.email }, { merge: true });
  }

  async getUser(): Promise<User | undefined> {
    const snapshot = await getDoc(this.userDoc());
    if (!snapshot.exists()) return undefined;
    const data = snapshot.data();
    return { id: snapshot.id, email: data['email'], cv: data['cv'] };
  }
}

export const userService = new UserService();
