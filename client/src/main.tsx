import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ProtectedRoute from "./middleware/ProtectedRoutes";
import Layout from "./components/Layout.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Dashboard from "./components/Dashboard.tsx";
import Profile from "./components/Profile.tsx";
import Requests from "./components/Requests.tsx";
import Favorites from "./components/Favorites.tsx";
import Notifications from "./components/Notifications.tsx";
import Reviews from "./components/Reviews.tsx";
import Help from "./components/Help";
import NotFound from "./components/NotFound";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <App />,
        },
        {
          path: "/dashboard",
          element: <ProtectedRoute element={<Dashboard />} />,
        },
        {
          path: "/profile",
          element: <ProtectedRoute element={<Profile />} />,
        },
        {
          path: "/requests",
          element: <ProtectedRoute element={<Requests />} />,
        },
        {
          path: "/favorites",
          element: <ProtectedRoute element={<Favorites />} />,
        },
        {
          path: "/notifications",
          element: <ProtectedRoute element={<Notifications />} />,
        },
        {
          path: "/Reviews",
          element: <ProtectedRoute element={<Reviews />} />,
        },
        {
          path: "/help",
          element: <ProtectedRoute element={<Help />} />,
        },
      ],
    },
    {
      path: "/auth/login",
      element: <Login />,
    },
    {
      path: "/auth/register",
      element: <Register />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {}
);

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <RouterProvider router={router} />
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
