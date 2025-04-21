import type React from "react"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { Home, Bell, Calendar, User, Heart, HelpCircle, Menu, Star } from "lucide-react"
import { Button } from "./ui/button"
import { useMediaQuery } from "../hooks/use-media-query"

export default function Sidebar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  useEffect(() => {
    const updateSidebarState = () => {
      if (!isDesktop) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    updateSidebarState()
  }, [isDesktop])

  useEffect(() => {
    let interval: NodeJS.Timeout

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
          console.log("Unread count: ", data.count)
        } else {
          console.log("Unread count fetch failed with status", response.status)
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error)
      }
    }

    fetchUnreadCount()

    //  to refresh the count every minute
    interval = setInterval(fetchUnreadCount, 60000)

    return () => clearInterval(interval)
  }, [])

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
    {
      title: "Reviews",
      href: "/reviews",
      icon: Star,
    },
  ]

  const bottomLinks = [
    {
      title: "Help & Support",
      href: "/help",
      icon: HelpCircle,
    },
  ]

  // checking if we're on dashboard or related pages
  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/reviews") ||
    location.pathname.startsWith("/help")

  // in order to not render sidebar on non-dashboard pages
  if (!isDashboardPage) {
    return null
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLinkClick = () => {
    if (!isDesktop) {
      setIsOpen(false)
    }
  }

  // Add keyboard support for toggling sidebar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen && !isDesktop) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any)
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any)
    }
  }, [isOpen, isDesktop])

  return (
    <>
      {!isDesktop && isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20" onClick={toggleSidebar} aria-hidden="true" />
      )}
      <aside
        className={cn(
          "bg-white border-r border-gray-100 h-screen transition-all duration-300 overflow-y-auto fixed left-0 top-0 z-30",
          isOpen ? "w-56 sm:w-64" : "w-16 sm:w-20",
        )}
      >
        <div className="flex flex-col h-full py-4 sm:py-6">
          <div className="px-3 sm:px-4 mb-6 sm:mb-8 flex items-center justify-between">
            {isOpen ? (
              <>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-rose-700"
                  aria-label="Collapse sidebar"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="mx-auto text-gray-500 hover:text-rose-700"
                aria-label="Expand sidebar"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>

          <nav className="space-y-1 px-2 sm:px-3 flex-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm rounded-lg transition-colors relative",
                    isActive ? "bg-rose-50 text-rose-700" : "text-gray-600 hover:text-rose-700 hover:bg-gray-50",
                    !isOpen && "justify-center",
                  )}
                >
                  <link.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isOpen && "mr-2 sm:mr-3")} />
                  {isOpen && <span className="flex-1 text-xs sm:text-sm">{link.title}</span>}
                  {isOpen && link.badge && (
                    <span className="ml-auto bg-rose-500 text-white text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {!isOpen && link.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-1 px-2 sm:px-3">
            {bottomLinks.map((link) => {
              const isActive = location.pathname === link.href

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm rounded-lg transition-colors",
                    isActive ? "bg-rose-50 text-rose-700" : "text-gray-600 hover:text-rose-700 hover:bg-gray-50",
                    !isOpen && "justify-center",
                  )}
                >
                  <link.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isOpen && "mr-2 sm:mr-3")} />
                  {isOpen && <span className="text-xs sm:text-sm">{link.title}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
