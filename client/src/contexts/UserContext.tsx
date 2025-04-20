import type React from "react";
import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import type { User } from "../types/index";

type UserRole = "elder" | "volunteer";

interface UserContextType {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  toggleRole: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("userRole");
    return (savedRole as UserRole) || "elder";
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

  useEffect(() => {
    const fetchUserData = async () => {
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
          const data: User = await response.json();
          setUserData(data);
          console.log("User data", data);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    if (!userData) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userData]);

  const contextValue = {
    userData,
    setUserData,
    loading,
    error,
    currentRole,
    setCurrentRole,
    toggleRole,
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

// import React, {
//   createContext,
//   useState,
//   useContext,
//   ReactNode,
//   useEffect,
// } from "react";
// import { User } from "../types/index";

// interface UserContextType {
//   userData: User | null;
//   setUserData: React.Dispatch<React.SetStateAction<User | null>>;
//   loading: boolean;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider = ({ children }: { children: ReactNode }) => {
//   const [userData, setUserData] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(`http://localhost:5000/api/user`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (response.ok) {
//           const data: User = await response.json();
//           setUserData(data);
//           console.log("User data", data);
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (!userData) {
//       fetchUserData();
//     } else {
//       setLoading(false);
//     }
//   }, [userData]);

//   return (
//     <UserContext.Provider value={{ userData, setUserData, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUserData = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUserData must be used within a UserProvider");
//   }
//   return context;
// };
