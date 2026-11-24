import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

import {
    loginUser,
    logoutUser,
    getCurrentUser
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    // Check authentication when the website loads
    useEffect(() => {

        let active = true;

        async function checkAuth() {
            try {
                const response = await getCurrentUser();

                if (active) {
                    setUser(response.user);
                }
            } catch (error) {
                if (active) {
                    setUser(null);

                    if (error.status !== 401) {
                        setAuthError(error.message);
                    }
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        checkAuth();

        return () => {
            active = false;
        };

    }, []);

    // Log in and update global user state
    async function login(email, password) {

        setAuthError("");

        const response = await loginUser(email, password);

        setUser(response.user);

        return response.user;
    }

    // Log out and clear global user state
    async function logout() {

        await logoutUser();

        setUser(null);
        setAuthError("");
    }

    const value = {
        user,
        loading,
        authError,
        isAuthenticated: Boolean(user),
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for accessing authentication
export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        );
    }

    return context;
}