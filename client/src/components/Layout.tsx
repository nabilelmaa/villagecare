"use client"

import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import Sidebar from "./Sidebar"
import BottomNavigation from "./BottomNavigation"
import { useTranslation } from "react-i18next"
import { cn } from "../lib/utils"

export default function Layout() {
  const location = useLocation()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const isAuthPage = location.pathname === "/auth/login" || location.pathname === "/auth/register"

  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/reviews") ||
    location.pathname.startsWith("/help")


  useEffect(() => {

    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Sidebar />
      <main
        className={cn(
          "flex-1",
          isDashboardPage && "lg:ml-20 transition-all duration-300",
          isDashboardPage && isRTL && "lg:ml-0 lg:mr-20",
          isAuthPage && "flex items-center justify-center",
        )}
      >
        <Outlet />
      </main>
      <BottomNavigation />
      {!isDashboardPage && <Footer />}
    </div>
  )
}
