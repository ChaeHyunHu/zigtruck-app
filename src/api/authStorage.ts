import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { notifyAuthSessionEnded, notifyAuthTokenUpdated } from '@/src/api/authSession';

const TOKEN_KEY = 'token';
const inMemoryStore = new Map<string, string>();

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return inMemoryStore.get(TOKEN_KEY) ?? null;
  }
};

export const setAccessToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      notifyAuthTokenUpdated(token);
      return;
    }
    inMemoryStore.set(TOKEN_KEY, token);
  }
  notifyAuthTokenUpdated(token);
};

export const clearAccessToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      notifyAuthSessionEnded();
      return;
    }
    inMemoryStore.delete(TOKEN_KEY);
  }
  notifyAuthSessionEnded();
};
