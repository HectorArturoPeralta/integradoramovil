// src/authcontext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Crear el contexto
const AuthContext = createContext();

// Crear el proveedor del contexto
const AuthProvider = ({ children }) => {
    const [cliente, setCliente] = useState(null);
    const [trabajador, setTrabajador] = useState(null);

    // Método para iniciar sesión como cliente
    const loginCliente = async (correo, contraseña) => {
        try {
            const response = await axios.post('http://10.0.2.2:3001/api/cliente/login', { correo, contraseña });
            setCliente(response.data);
        } catch (error) {
            console.error('Error al iniciar sesión como cliente:', error);
            // Manejo de errores
        }
    };

    // Método para iniciar sesión como trabajador
    const loginTrabajador = async (rfc, contraseña) => {
        try {
            const response = await axios.post('http://10.0.2.2:3001/api/trabajador/login', { rfc, contraseña });
            setTrabajador(response.data);
        } catch (error) {
            console.error('Error al iniciar sesión como trabajador:', error);
            // Manejo de errores
        }
    };

    // Método para cerrar sesión
    const logout = () => {
        setCliente(null);
        setTrabajador(null);
    };

    // Verificación de sesión activa al montar el componente
    useEffect(() => {
        const checkSession = async () => {
            try {
            } catch (error) {
                console.error('Error al verificar la sesión:', error);
            }
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ cliente, trabajador, loginCliente, loginTrabajador, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto
const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthProvider, useAuth };
