import axiosInstance from './api';
import TokenService from './token.service';

const setup = (store: any) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = TokenService.getLocalAccessToken();
      if (typeof token !== 'undefined' && token) {
        config.headers = config.headers || { };
        config.headers.Authorization = `Bearer ${token}`;
        // config.headers['x-access-token'] = token;
      }
      return config;
    },
    (error: any) => Promise.reject(error),
  );
  axiosInstance.interceptors.response.use(
    (res: any) => res,
    async (err: any) => {
      const originalConfig = err.config;
      if (originalConfig.url !== '/auth/signin' && err.response) {
        // Accesstoken was expired
        if (err.response.status === 401 && !originalConfig._retry) {
          originalConfig._retry = true;
          try {
            const rs = await axiosInstance.post('/auth/refreshtoken', {
              refreshToken: TokenService.getLocalRefreshToken(),
            });
            const { accessToken } = rs.data;
            store.dispatch('auth/refreshToken', accessToken);
            TokenService.updateLocalAccessToken(accessToken);
            return axiosInstance(originalConfig);
          } catch (_error) {
            return Promise.reject(_error);
          }
        }
      }
      return Promise.reject(err);
    },
  );
}
export default setup;
