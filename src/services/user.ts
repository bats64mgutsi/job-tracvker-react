import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, firebaseAuth } from '../firebase';
import { User } from '../models/user.model';

export class UserService {
  private db = firestore;

  private userDoc(uid?: string) {
    const targetUid = uid || firebaseAuth.currentUser?.uid;
    if (!targetUid) throw new Error('Cannot access user: No user is signed in.');
    return doc(this.db, 'users', targetUid);
  }

  async updateUser(userOrUid: User | string, maybeUser?: Partial<User>): Promise<void> {
    let targetUid: string;
    let cvValue: string | undefined;
    let emailValue: string | undefined;

    if (typeof userOrUid === 'string') {
      targetUid = userOrUid;
      cvValue = maybeUser?.cv;
      emailValue = maybeUser?.email;
    } else {
      targetUid = userOrUid.id || firebaseAuth.currentUser?.uid || '';
      cvValue = userOrUid.cv;
      emailValue = userOrUid.email;
    }

    if (!targetUid) throw new Error('Cannot access user: No user is signed in.');

    const payload: Record<string, any> = {};
    if (cvValue !== undefined) payload.cv = cvValue;
    if (emailValue !== undefined) payload.email = emailValue;

    await setDoc(doc(this.db, 'users', targetUid), payload, { merge: true });
  }

  async getUser(uid?: string): Promise<User | undefined> {
    const targetUid = uid || firebaseAuth.currentUser?.uid;
    if (!targetUid) throw new Error('Cannot access user: No user is signed in.');
    const snapshot = await getDoc(doc(this.db, 'users', targetUid));
    if (!snapshot.exists()) return undefined;
    const data = snapshot.data();
    return { id: snapshot.id, email: data['email'], cv: data['cv'] };
  }
}

export const userService = new UserService();
