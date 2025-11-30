export default function getToken() {
// Obtener el token del localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('No se encontró el token de autenticación');
    }
    return token
}