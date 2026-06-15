import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const emailOrPhone = firebaseUser.email || firebaseUser.phoneNumber || firebaseUser.uid;
          const userKey = emailOrPhone.toLowerCase();
          const userRef = doc(db, 'users', userKey);
          const userSnap = await getDoc(userRef);
          
          let userData;
          if (userSnap.exists()) {
            const profile = userSnap.data();
            userData = {
              id: firebaseUser.uid,
              username: profile.username || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : firebaseUser.phoneNumber) || 'User',
              email: emailOrPhone,
              isGuest: false
            };
          } else {
            // Document doesn't exist in Firestore (e.g. new Google or Phone login). Create it!
            const username = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : firebaseUser.phoneNumber) || 'User';
            await setDoc(userRef, {
              username: username,
              email: emailOrPhone,
              isVerified: true,
              createdAt: new Date().toISOString()
            });
            
            userData = {
              id: firebaseUser.uid,
              username: username,
              email: emailOrPhone,
              isGuest: false
            };
          }
          setUser(userData);
          localStorage.setItem('musideo_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Error fetching or syncing user profile, falling back to local session:", err);
          const emailOrPhone = firebaseUser.email || firebaseUser.phoneNumber || firebaseUser.uid;
          const username = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : firebaseUser.phoneNumber) || 'User';
          const userData = {
            id: firebaseUser.uid,
            username: username,
            email: emailOrPhone,
            isGuest: false
          };
          setUser(userData);
          localStorage.setItem('musideo_user', JSON.stringify(userData));
        }
      } else {
        const storedUser = localStorage.getItem('musideo_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.isGuest) {
            setUser(parsed);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      try {
        const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:5001/api' 
          : 'https://musi-deo.vercel.app/api';
          
        const res = await axios.post(`${API}/auth/login`, { email, password });
        const userData = {
          id: res.data.user.id || res.data.user.email,
          username: res.data.user.username,
          email: res.data.user.email,
          isGuest: false
        };
        setUser(userData);
        localStorage.setItem('musideo_user', JSON.stringify(userData));
        setLoading(false);
        return userData;
      } catch (backendErr) {
        setLoading(false);
        throw err;
      }
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const sendPhoneOTP = async (phoneNumber, containerId) => {
    setLoading(true);
    try {
      // Initialize or reuse RecaptchaVerifier
      let recaptchaVerifier = window.recaptchaVerifier;
      if (!recaptchaVerifier) {
        recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response) => {
            // reCAPTCHA solved
          }
        });
        window.recaptchaVerifier = recaptchaVerifier;
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setLoading(false);
      return confirmationResult;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const verifyPhoneOTP = async (confirmationResult, otp) => {
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      setLoading(false);
      return result.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginAsGuest = () => {
    const guestUser = { id: 'guest', username: 'Guest User', email: 'guest@musideo.local', isGuest: true };
    setUser(guestUser);
    localStorage.setItem('musideo_user', JSON.stringify(guestUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('musideo_user');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signInWithGoogle, sendPhoneOTP, verifyPhoneOTP, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

