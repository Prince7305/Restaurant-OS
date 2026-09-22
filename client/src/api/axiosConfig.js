import axios from 'axios';

// Central place for the backend URL — change this once here if the
// backend port/host ever changes, instead of hunting through every file.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export default api;