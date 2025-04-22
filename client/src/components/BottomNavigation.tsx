import { Link, useLocation } from "react-router-dom";
import { Home, User, Heart, Bell, Menu } from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function BottomNavigation() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    const event = new CustomEvent("toggleSidebar");
    window.dispatchEvent(event);
  };

  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/reviews") ||
    location.pathname.startsWith("/help");

  const isAuthPage =
    location.pathname === "/auth/login" ||
    location.pathname === "/auth/register";

  const isLandingPage = location.pathname === "/";

  if (!isDashboardPage || isAuthPage || isLandingPage || !isMobile) {
    return null;
  }

  const navItems = [
    {
      icon: Home,
      label: t("sidebar.dashboard"),
      href: "/dashboard",
    },
    {
      icon: Heart,
      label: t("sidebar.favorites"),
      href: "/favorites",
    },
    {
      icon: Bell,
      label: t("sidebar.notifications"),
      href: "/notifications",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      icon: User,
      label: t("sidebar.profile"),
      href: "/profile",
    },
    {
      icon: Menu,
      label: t("sidebar.menu"),
      onClick: toggleSidebar,
      href: "#",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;

          const NavItem = () => (
            <div
              className={cn(
                "flex flex-col items-center justify-center w-full h-full px-2",
                isActive ? "text-rose-600" : "text-gray-500"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5 mb-1" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-medium px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          );

          return item.onClick ? (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex-1 h-full focus:outline-none focus:bg-gray-50 active:bg-gray-100"
              aria-label={item.label}
            >
              <NavItem />
            </button>
          ) : (
            <Link
              key={item.href}
              to={item.href}
              className="flex-1 h-full focus:outline-none focus:bg-gray-50 active:bg-gray-100"
              aria-label={item.label}
            >
              <NavItem />
            </Link>
          );
        })}
      </div>

      <div className="h-safe-area bg-white" />
    </nav>
  );
}
