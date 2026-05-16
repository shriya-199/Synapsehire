import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  timeout: 20000
});

let storeRef;
let refreshPromise;

export const attachStore = (store) => {
  storeRef = store;
};

apiClient.interceptors.request.use((config) => {
  const token = storeRef?.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        apiClient.post('/auth/refresh-token').finally(() => {
          refreshPromise = null;
        });

      const response = await refreshPromise;
      const accessToken = response.data.data.accessToken;
      storeRef?.dispatch({ type: 'auth/setAccessToken', payload: accessToken });
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      storeRef?.dispatch({ type: 'auth/clearAuth' });
      return Promise.reject(refreshError);
    }
  }
);

export const getApiErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';
