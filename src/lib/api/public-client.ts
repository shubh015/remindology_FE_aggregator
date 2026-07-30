import axios from 'axios';

// No auth headers, no 401 → /login redirect.
// Use this for endpoints that are publicly accessible without a session.
export const publicApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
