
'use client';

import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Saves user data to a 'users' collection in Firestore.
 * Creates or merges the data into a document named with the user's UID.
 * This function also includes logic to assign the 'Admin' role to the first user or a specific email.
 * @param firestore The Firestore instance.
 * @param user The Firebase authenticated user object.
 */
export const saveUserData = async (firestore: Firestore, user: User) => {
  if (!user) return;

  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  // Default role is 'User'
  let userRole = 'User';
  
  // If the user document exists, check their current role.
  if (userDoc.exists()) {
    userRole = userDoc.data().role || 'User';
  }

  // Force-assign 'Admin' role for the specific user email.
  // This ensures the main admin always has the correct privileges.
  if (user.email === 'hm@tabernacleofglory.net') {
    userRole = 'Admin';
  }

  const nameParts = user.displayName?.split(' ') || [''];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');


  const userData: any = {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    firstName: firstName,
    lastName: lastName,
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
    role: userRole, // Assign the determined role
    hpNumber: user.phoneNumber || '',
    campus: '',
    ministry: '',
  };
  
  // If the user document does not exist, it's their first sign-in.
  // Set the creation timestamp.
  if (!userDoc.exists()) {
    userData.createdAt = serverTimestamp();
  }

  // Use setDoc with merge to create or update the user profile.
  await setDoc(userRef, userData, { merge: true });
};
