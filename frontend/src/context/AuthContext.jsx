import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch profile data here to hydrate user state if needed
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (email, password) => {
        // 🟢 1. HARDCODED CREDENTIALS CHECK
        if (email === "admin@company.com" && password === "admin123") {
            const mockAdminUser = {
                name: "Lokpriya Jain",
                role: "Admin",
                email: email
            };
            
            localStorage.setItem('token', 'mock-admin-token-xyz123');
            setToken('mock-admin-token-xyz123');
            setUser(mockAdminUser);
            return mockAdminUser;
        }

        // 🔵 2. FALLBACK TO DATABASE BACKEND
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const { token: receivedToken, user: userProfile } = response.data;
        
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(userProfile);
        return userProfile;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook for clean developer consumption
export const useAuth = () => useContext(AuthContext);