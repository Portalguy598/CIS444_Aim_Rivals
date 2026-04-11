import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

// wrap this around protected routes to properly move unauthenticated users to the login page
export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // if user is not authenticated, return to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}