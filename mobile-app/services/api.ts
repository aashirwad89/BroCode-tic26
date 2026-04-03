import axios from 'axios';

export const API = axios.create({
  baseURL: "http://10.252.189.103:8000/api"
});