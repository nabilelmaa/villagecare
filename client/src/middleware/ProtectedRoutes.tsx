import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    sessionStorage.setItem("redirectUrl", window.location.pathname);
    return <Navigate to="/auth/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
