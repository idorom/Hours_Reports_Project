import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Adjust baseURL if needed
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const token = response.data.token;

      localStorage.setItem('authToken', token); // Save token to local storage
      localStorage.setItem('tokenTimestamp', Date.now()); // Save timestamp

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await api.post('/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenTimestamp');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getTokenDetails: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return { isValid: false, email: null };

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      var date11111 = new Date(decoded.exp * 1000);

      const isExpired = decoded.exp < now;
      const email = decoded.email;

      if (isExpired) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenTimestamp');
      }

      return { isValid: !isExpired, email };
    } catch (error) {
      console.error('Failed to decode token:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenTimestamp');
      return { isValid: false, email: null };
    }
  },

  getAllData: async (email) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/data/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },

  getWorkerData: async (workerID, selectedDate) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.get(`/data/${workerID}/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching worker data:', error);
      throw error;
    }
  },

  deleteAddRows: async (deletedData, insertedData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.post('/delete-add-rows', {
        deletedData: deletedData,
        insertedData: insertedData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting and adding rows:', error);
      throw error;
    }
  },
};

export default apiService;