import axios from 'axios';

const API = axios.create({
    baseURL: 'https://naayee.store/api',
});

// Add token to headers if authenticated
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        req.headers['x-auth-token'] = token;
    }
    return req;
});

export default API;
