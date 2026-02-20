import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://192.168.1.5:3000';

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
