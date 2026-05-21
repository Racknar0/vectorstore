const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Función base para realizar peticiones HTTP
async function request(endpoint, method = 'GET', data = null, isUpload = false) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {};
  
  // Si estamos en el navegador, adjuntar el token de autenticación si existe
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vector_store_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let body = data;
  
  if (!isUpload && data) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Hubo un error al comunicarse con el servidor.');
  }

  return responseData;
}

// Métodos HTTP abreviados
export const apiGet = (endpoint) => request(endpoint, 'GET');
export const apiPost = (endpoint, data) => request(endpoint, 'POST', data);
export const apiPut = (endpoint, data) => request(endpoint, 'PUT', data);
export const apiPatch = (endpoint, data) => request(endpoint, 'PATCH', data);
export const apiDelete = (endpoint) => request(endpoint, 'DELETE');

// Subir un archivo (comprobante)
export const apiUpload = async (file) => {
  const formData = new FormData();
  formData.append('voucher', file);
  
  const url = `${API_URL}/upload`;
  const headers = {};
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vector_store_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || 'Error al subir la captura.');
  }

  return responseData; // Retorna { fileUrl: '/uploads/...' }
};

// Helpers de Sesión
export const login = async (email, password) => {
  const data = await apiPost('/auth/login', { email, password });
  if (data.token) {
    localStorage.setItem('vector_store_token', data.token);
    localStorage.setItem('vector_store_user', JSON.stringify(data.user));
    if (typeof document !== 'undefined') {
      document.cookie = `vector_store_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
    }
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('vector_store_token');
  localStorage.removeItem('vector_store_user');
  if (typeof document !== 'undefined') {
    document.cookie = 'vector_store_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const getMe = async () => {
  try {
    return await apiGet('/auth/me');
  } catch (err) {
    localStorage.removeItem('vector_store_token');
    localStorage.removeItem('vector_store_user');
    if (typeof document !== 'undefined') {
      document.cookie = 'vector_store_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
    throw err;
  }
};

// Resolver URLs relativas de imágenes (ej: /uploads/... o /mockups/...)
export const resolveImageUrl = (path) => {
  if (!path) return '/default_placeholder.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Quitar la barra inclinada del backend si el path ya la tiene
  const backendBase = API_URL.replace('/api', '');
  return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
};
