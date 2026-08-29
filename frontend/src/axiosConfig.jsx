import axios from 'axios';

const axiosInstance = axios.create({
  // Set REACT_APP_API_URL in frontend/.env on the EC2 instance so the browser
  // calls the public address. Falls back to localhost for local development.
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;