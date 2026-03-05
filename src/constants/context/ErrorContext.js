import React, { createContext, useState, useContext, useRef } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: null, type: "success", toastKey: null });
  const hideTimeout = useRef(null);

  const showToast = (message, type = "success") => {
    // Clear previous hide timeout
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    const effectiveKey = Date.now(); // auto-generate key
    setToast({ message, type, toastKey: effectiveKey });

    // auto-hide after 3s
    hideTimeout.current = setTimeout(() => {
      setToast({ message: null, type: "success", toastKey: null });
      hideTimeout.current = null;
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
