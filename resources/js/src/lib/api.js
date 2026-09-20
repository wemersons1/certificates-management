import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_API_URL;
import Swal from 'sweetalert2';
import { messageErrorAxios } from './helper';

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token'); // ou outro método para armazenar o token

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

api.interceptors.response.use(function (response) {
  // Qualquer código de status que dentro do limite de 2xx faz com que está função seja acionada
  // Faz alguma coisa com os dados de resposta
  return response;
}, function (error) {
  if(error.response) {
      const { status } = error.response;

      if(status == 401) {

          localStorage.clear();
          window.location.href = '/';
          return;
      }

        if (typeof error.response.data.errors != 'undefined') {
          Swal.fire({
              icon: "error",
              title: 'Erro',
              text: messageErrorAxios(error.response.data.errors),
              showDenyButton: false,
              showCancelButton: false,
              confirmButtonText: "Ok",
          })
        }
  }

  return Promise.reject(error);
});

export default api;