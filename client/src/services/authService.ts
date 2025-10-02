import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/auth';

// Register user
const register = async (userData: any) => {
  const response = await axios.post(API_URL + '/register', userData);
  if (response.data) {
    // You could also store the user data in localStorage here
    console.log('Registration successful:', response.data);
  }
  return response.data;
};

// Login user
const login = async (userData: any) => {
  const response = await axios.post(API_URL + '/login', userData);
  if (response.data) {
    // You could also store the user data in localStorage here
    console.log('Login successful:', response.data);
  }
  return response.data;
};

const authService = {
  register,
  login,
};

export default authService;