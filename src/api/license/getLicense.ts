import axios from 'axios';

import apiManager from '../AxiosInstance';

export const getMyLicense = async () => {
  const res = await apiManager.get('/api/v1/license/my');
  return res.data;
};

export const getLicensePrice = async () => {
  const res = await axios.get('https://api.mchans.co.kr/zigTruck/licensePlatePrice');
  return res.data;
};

export const getLicenseBuyGuide = async () => {
  const res = await axios.get('https://api.mchans.co.kr/zigTruck/LicenseBuyGuide');
  return res.data;
};

export const getLicenseSalesGuide = async () => {
  const res = await axios.get('https://api.mchans.co.kr/zigTruck/LicenseSalesGuide');
  return res.data;
};
