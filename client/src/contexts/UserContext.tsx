import type React from "react";
import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
  useCallback,
} from "react";
import type { User } from "../types/index";
import { useToast } from "./ToastContext";

type UserRole = "elder" | "volunteer";

interface UserContextType {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  toggleRole: () => void;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("userRole");
    return savedRole === "elder" || savedRole === "volunteer"
      ? savedRole
      : "elder";
  });

  useEffect(() => {
    localStorage.setItem("userRole", currentRole);
  }, [currentRole]);

  const toggleRole = async () => {
    const newRole = currentRole === "elder" ? "volunteer" : "elder";
    setCurrentRole(newRole);
    localStorage.setItem("userRole", newRole);

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await fetch("http://localhost:5000/api/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (error) {
      console.error("Failed to update role on server:", error);
    }
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        console.log("User data fetched successfully:", data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch user data:", errorData);
        setError(errorData.message || "Failed to fetch user data");
        showToast("Failed to load user data. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Error fetching user data");
      showToast("Network error while loading user data.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Only fetch user data on initial load if we have a token
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  const contextValue = {
    userData,
    setUserData,
    loading,
    error,
    currentRole,
    setCurrentRole,
    toggleRole,
    fetchUserData,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserData = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
};
