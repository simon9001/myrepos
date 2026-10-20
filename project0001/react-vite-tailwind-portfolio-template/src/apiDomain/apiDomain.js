const isProd = import.meta.env.PROD;

export const apiDomain = isProd
    ? 'https://backendfarmgun.onrender.com/api' // Placeholder for production
    : 'http://localhost:3001/api';
