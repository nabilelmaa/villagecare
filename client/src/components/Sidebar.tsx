import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  Home,
  Bell,
  Calendar,
  User,
  Heart,
  HelpCircle,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          return;
        }
        const response = await fetch(
          "http://localhost:5000/api/notifications/unread",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
          console.log("Unread count: ", data.count);
        } else {
          console.log("Unread count fetch failed with status", response.status);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    fetchUnreadCount();

    //  to refresh the count every minute
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const sidebarLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Requests",
      href: "/requests",
      icon: Calendar,
    },
    {
      title: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const bottomLinks = [
    {
      title: "Help & Support",
      href: "/help",
      icon: HelpCircle,
    },
  ];

  // checking if we're on dashboard or related pages
  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/help");

  // in order to not render sidebar on non-dashboard pages
  if (!isDashboardPage) {
    return null;
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-100 h-screen transition-all duration-300 overflow-y-auto fixed left-0 top-0 z-30",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col h-full py-6">
        <div className="px-4 mb-8 flex items-center justify-between">
          {isOpen ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-rose-700"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mx-auto text-gray-500 hover:text-rose-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="space-y-1 px-3 flex-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm rounded-lg transition-colors relative",
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "text-gray-600 hover:text-rose-700 hover:bg-gray-50",
                  !isOpen && "justify-center"
                )}
              >
                <link.icon className={cn("h-5 w-5", isOpen && "mr-3")} />
                {isOpen && <span className="flex-1">{link.title}</span>}
                {isOpen && link.badge && (
                  <span className="ml-auto bg-rose-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                {!isOpen && link.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 px-3">
          {bottomLinks.map((link) => {
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm rounded-lg transition-colors",
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "text-gray-600 hover:text-rose-700 hover:bg-gray-50",
                  !isOpen && "justify-center"
                )}
              >
                <link.icon className={cn("h-5 w-5", isOpen && "mr-3")} />
                {isOpen && <span>{link.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
