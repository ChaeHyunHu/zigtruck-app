import { create, AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

import { UNAUTHORIZED_ACCESS } from '@/src/constants/errorCode';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/src/api/authStorage';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const apiManager: AxiosInstance = create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  timeout: 500000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiManager.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.url) {
      if (config.url.includes('refresh')) {
        config.withCredentials = true;
      } else if (!config.url.includes('login')) {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiManager.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const errorResponse = error.response;

    if (errorResponse?.data) {
      if (errorResponse.status === 401 && originalRequest) {
        if (errorResponse.data.code === 'JWT_TOKEN_EXPIRED' && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve) => {
              refreshSubscribers.push((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(apiManager(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const oldToken = (await getAccessToken()) || '';
          if (oldToken) {
            try {
              jwtDecode<Token>(oldToken);
            } catch {
              // Ignore parse errors, refresh flow can still proceed.
            }
          }

          try {
            const response = await apiManager.post('/auth/refresh-token');
            const newAccessToken = response.data.accessToken;

            await setAccessToken(newAccessToken);
            refreshSubscribers.forEach((callback) => callback(newAccessToken));
            refreshSubscribers = [];
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiManager(originalRequest);
          } catch (refreshError) {
            await clearAccessToken();
            isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }

        if (
          errorResponse.data.code === 'REFRESH_TOKEN_EXPIRED' ||
          errorResponse.data.code === 'INVALID_REFRESH_TOKEN' ||
          errorResponse.data.code === 'AUTHENTICATION_FAIL'
        ) {
          await clearAccessToken();
        }
      }

      if (errorResponse.status === 403 && errorResponse.data.code === UNAUTHORIZED_ACCESS) {
        return Promise.reject(errorResponse.data);
      }

      return Promise.reject(errorResponse.data);
    }

    return Promise.reject(errorResponse);
  },
);

export default apiManager;
