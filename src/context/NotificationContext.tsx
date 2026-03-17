import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import NotificationService from "../services/NotificationService";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  pushToken: string | null;
  isInitialized: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  // Save push token when user logs in
  useEffect(() => {
    if (user?.uid && pushToken) {
      NotificationService.savePushToken(user.uid);
    }
  }, [user?.uid, pushToken]);

  const initializeNotifications = async () => {
    try {
      const success = await NotificationService.initialize();
      setIsInitialized(true);
      setHasPermission(success);

      if (success) {
        const token = await NotificationService.getPushToken();
        setPushToken(token);
      }
    } catch (error) {
      console.error("Error initializing notifications:", error);
      setIsInitialized(true);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const success = await NotificationService.initialize();
      setHasPermission(success);

      if (success) {
        const token = await NotificationService.getPushToken();
        setPushToken(token);
      }

      return success;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (!hasPermission) return;

    try {
      const token = await NotificationService.getPushToken();
      setPushToken(token);

      if (token && user?.uid) {
        await NotificationService.savePushToken(user.uid);
      }
    } catch (error) {
      console.error("Error refreshing push token:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        isInitialized,
        hasPermission,
        requestPermission,
        refreshToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
