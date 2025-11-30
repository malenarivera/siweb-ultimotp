"use client";

import { useState, useEffect } from 'react';

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar obtener del localStorage
    const storedToken = localStorage.getItem('authToken');
    
    if (storedToken) {
      setToken(storedToken);
      setLoading(false);
    } else {
      // Si no existe, obtenerlo del servidor
      fetch('/api/auth/token')
        .then(res => {
          if (!res.ok) {
            throw new Error('No se pudo obtener el token');
          }
          return res.json();
        })
        .then(data => {
          if (data.token) {
            // Guardar en localStorage
            localStorage.setItem('authToken', data.token);
            setToken(data.token);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, []);

  // Función para refrescar el token si expira
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/token');
      if (!response.ok) {
        throw new Error('No se pudo refrescar el token');
      }
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return null;
    }
  };

  // Función para limpiar el token (logout)
  const clearToken = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return { token, loading, refreshToken, clearToken };
}

