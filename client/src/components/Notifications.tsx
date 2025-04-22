"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Check, X, Clock, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "../contexts/ToastContext";

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast(t("common.loginAgain"), "error");
        return;
      }
      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(t("notifications.fetchFailed"));
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      setError(t("notifications.loadError"));
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showToast(t("common.loginAgain"), "error");
        return;
      }
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/mark-as-read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t("notifications.markReadFailed"));
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      showToast(t("notifications.markedAsRead"));

      fetchNotifications();
    } catch (err) {
      showToast(t("notifications.markReadFailed"), "error");
      console.error("Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request_accepted":
        return <Check className="h-5 w-5 text-green-500" />;
      case "request_canceled":
        return <X className="h-5 w-5 text-red-500" />;
      case "request_created":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "request_completed":
        return <Check className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          {t("notifications.title")}
        </h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("notifications.title")}
          </h1>
          <p className="text-gray-500">{t("notifications.subtitle")}</p>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            {t("notifications.refresh")}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {notifications.length === 0 && !error ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {t("notifications.noNotifications")}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {t("notifications.noNotificationsMessage")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all ${
                notification.is_read
                  ? "bg-gray-50"
                  : "bg-white border-l-4 border-l-blue-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {t("notifications.markAsRead")}
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
