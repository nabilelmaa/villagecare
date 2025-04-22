import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "../lib/utils"
import { Home, Bell, Calendar, User, Heart, HelpCircle, Menu, Star, X } from 'lucide-react'
import { Button } from "./ui/button"

export default function Sidebar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          return
        }
        const response = await fetch("http://localhost:5000/api/notifications/unread", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const sidebarLinks = [
    {
      title: t("sidebar.dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      title: t("sidebar.profile"),
      href: "/profile",
      icon: User,
    },
    {
      title: t("sidebar.requests"),
      href: "/requests",
      icon: Calendar,
    },
    {
      title: t("sidebar.favorites"),
      href: "/favorites",
      icon: Heart,
    },
    {
      title: t("sidebar.notifications"),
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      title: t("sidebar.reviews"),
      href: "/reviews",
      icon: Star,
    },
  ]

  const bottomLinks = [
    {
      title: t("sidebar.help"),
      href: "/help",
      icon: HelpCircle,
    },
  ]

  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/reviews") ||
    location.pathname.startsWith("/help")

  if (!isDashboardPage) {
    return null
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed bottom-4 z-50 bg-rose-600 text-white p-3 rounded-full shadow-lg",
            isRTL ? "right-4" : "left-4",
          )}
          aria-label={t("sidebar.openMenu")}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "bg-white border-r border-gray-100 h-screen transition-all duration-300 overflow-y-auto fixed top-0 z-50",
          isOpen ? "w-64" : isMobile ? (isRTL ? "translate-x-full" : "-translate-x-full") : "w-20",
          "shadow-lg",
          isRTL ? "right-0 border-l border-r-0" : "left-0",
        )}
      >
        <div className="flex flex-col h-full py-6">
          <div className="px-4 mb-8 flex items-center justify-between">
            {isOpen ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">{t("sidebar.menu")}</h2>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-gray-500 hover:text-rose-700"
                    aria-label={t("sidebar.close")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="mx-auto text-gray-500 hover:text-rose-700"
                aria-label={t("sidebar.open")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          <nav className="space-y-1 px-3 flex-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm rounded-lg transition-colors relative",
                    isActive ? "bg-rose-50 text-rose-700" : "text-gray-600 hover:text-rose-700 hover:bg-gray-50",
                    !isOpen && !isMobile && "justify-center",
                  )}
                >
                  <link.icon className={cn("h-5 w-5", isOpen && (isRTL ? "ml-3" : "mr-3"))} />
                  {isOpen && <span className="flex-1">{link.title}</span>}
                  {isOpen && link.badge && (
                    <span
                      className={cn(
                        "bg-rose-500 text-white text-xs font-medium px-2 py-0.5 rounded-full",
                        isRTL ? "mr-auto" : "ml-auto",
                      )}
                    >
                      {link.badge}
                    </span>
                  )}
                  {!isOpen && !isMobile && link.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-1 px-3">
            {bottomLinks.map((link) => {
              const isActive = location.pathname === link.href

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm rounded-lg transition-colors",
                    isActive ? "bg-rose-50 text-rose-700" : "text-gray-600 hover:text-rose-700 hover:bg-gray-50",
                    !isOpen && !isMobile && "justify-center",
                  )}
                >
                  <link.icon className={cn("h-5 w-5", isOpen && (isRTL ? "ml-3" : "mr-3"))} />
                  {isOpen && <span>{link.title}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
