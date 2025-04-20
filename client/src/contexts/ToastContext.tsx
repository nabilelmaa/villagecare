"use client";

import { ToastSuccess } from "../components/ui/toast-success";
import { ToastError } from "../components/ui/toast-error";
import { ToastInfo } from "../components/ui/toast-info";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: number;
  body: string;
  type: "success" | "congratulations" | "error" | "info";
}

interface ToastContextType {
  showToast: (
    body: string,
    type?: "success" | "congratulations" | "error" | "info"
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(0);

  const showToast = useCallback(
    (
      body: string,
      type: "success" | "congratulations" | "error" | "info" = "success"
    ) => {
      const newToast = {
        id: counter,
        body,
        type,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);
      setCounter((prev) => prev + 1);

      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== newToast.id)
        );
      }, 2500);
    },
    [counter]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="px-4 w-full flex justify-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={toastVariants}
            >
              {toast.type === "success" && <ToastSuccess body={toast.body} />}
              {toast.type === "error" && <ToastError body={toast.body} />}
              {toast.type === "info" && <ToastInfo body={toast.body} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
