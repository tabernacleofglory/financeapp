
'use client';

import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Saves user data to a 'users' collection in Firestore.
 * This function is called on first sign-in. If a user profile does not already
 * exist, it creates one with a 'Guest' role, effectively denying access
 * until an admin grants permissions.
 * @param firestore The Firestore instance.
 * @param user The Firebase authenticated user object.
 */
export const saveUserData = async (firestore: Firestore, user: User) => {
  if (!user) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  // If user document already exists, they were likely pre-created by an admin.
  // Just update their last login time and sync basic info from the auth provider.
  if (userDoc.exists()) {
    const nameParts = user.displayName?.split(' ') || [''];
    const firstName = nameParts[0] || userDoc.data().firstName || '';
    const lastName = nameParts.slice(1).join(' ') || userDoc.data().lastName || '';

    await setDoc(userRef, { 
        lastLoginAt: serverTimestamp(),
        // Sync display name and photo from provider, but don't overwrite if they are empty
        ...(user.displayName && { name: user.displayName, firstName, lastName }),
        ...(user.photoURL && { photoURL: user.photoURL }),
     }, { merge: true });
    return;
  }

  // If user document does NOT exist, this is a new self-signup.
  // Create them with 'Guest' role to restrict access by default.
  let userRole = 'Guest';

  // Special case to ensure the main admin is always an admin.
  if (user.email === 'hm@tabernacleofglory.net') {
    userRole = 'Admin';
  }

  const nameParts = user.displayName?.split(' ') || [''];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');


  const userData = {
    uid: user.uid,
    email: user.email,
    name: user.displayName || '',
    firstName: firstName || '',
    lastName: lastName || '',
    photoURL: user.photoURL || '',
    lastLoginAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    role: userRole,
    access: [], // Guests and new self-registered users start with no specific access rights.
    hpNumber: user.phoneNumber || '',
    campus: '',
    ministry: '',
  };

  await setDoc(userRef, userData);
};
