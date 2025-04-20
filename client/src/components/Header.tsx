import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, Settings, LogOut, Bell, Heart, UserCog } from "lucide-react";
import { useUserData } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import RoleSwitcher from "./RoleSwitcher";
import { Badge } from "./ui/badge";

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { userData, currentRole } = useUserData();
  const { logout, isAuthenticated } = useAuth();

  // check if we're on auth pages (login/register)
  const isAuthPage =
    location.pathname === "/auth/login" ||
    location.pathname === "/auth/register";

  // checking if we're on dashboard or related pages
  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/help");

  // checking if we're on the landing page
  const isLandingPage = location.pathname === "/";

  // Scroll event listener for landing page header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    if (isLandingPage) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLandingPage]);

  // Smooth scroll function for landing page navigation
  const scrollToSection =
    (sectionId: string) => (e: { preventDefault: () => void }) => {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

  // don't render header on auth pages
  if (isAuthPage) {
    return null;
  }

  // Enhanced user avatar dropdown component
  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-0 h-10 w-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-white ring-rose-100 hover:ring-rose-200 transition-all duration-200"
        >
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage
              src={userData?.profile_image_url || "/placeholder.svg"}
              alt={userData?.first_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-rose-600 text-white font-medium">
              {userData?.first_name?.[0]}
              {userData?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-3 p-3">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage
              src={userData?.profile_image_url || "/placeholder.svg"}
              alt={userData?.first_name}
            />
            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-rose-600 text-white font-medium">
              {userData?.first_name?.[0]}
              {userData?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className="font-medium text-sm">
              {userData?.first_name} {userData?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[160px]">
              {userData?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Role switcher in dropdown */}
        <div className="px-2 py-1.5">
          <RoleSwitcher variant="compact" />
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/profile"
            className="cursor-pointer flex w-full items-center"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to="/settings"
            className="cursor-pointer flex w-full items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-rose-700 focus:text-rose-700"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isLandingPage) {
    return (
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <a
                href="#top"
                onClick={scrollToSection("top")}
                className="flex items-center space-x-2"
              >
                <img
                  src="/vite.svg"
                  alt="VillageCare Logo"
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EC2F4B] to-[#EAAFC8]">
                  VillageCare
                </span>
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#about"
                onClick={scrollToSection("about")}
                className="text-gray-600 hover:text-rose-700 transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#services"
                onClick={scrollToSection("services")}
                className="text-gray-600 hover:text-rose-700 transition-colors relative group"
              >
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#how"
                onClick={scrollToSection("how")}
                className="text-gray-600 hover:text-rose-700 transition-colors relative group"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#contact"
                onClick={scrollToSection("contact")}
                className="text-gray-600 hover:text-rose-700 transition-colors relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Role indicator badge */}
                  <Badge
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 ${
                      currentRole === "elder"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-rose-100 text-rose-800 hover:bg-rose-100"
                    }`}
                  >
                    {currentRole === "elder" ? (
                      <>
                        <UserCog className="h-3.5 w-3.5" />
                        <span>Elder Mode</span>
                      </>
                    ) : (
                      <>
                        <Heart className="h-3.5 w-3.5" />
                        <span>Volunteer Mode</span>
                      </>
                    )}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-rose-700 relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                    <span className="sr-only">Notifications</span>
                  </Button>

                  <UserDropdown />
                </div>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (isDashboardPage) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center ml-16 sm:ml-20">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/vite.svg"
                  alt="VillageCare Logo"
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EC2F4B] to-[#EAAFC8]">
                  VillageCare
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Role indicator badge */}
              <Badge
                className={`flex items-center gap-1.5 px-3 py-1.5 ${
                  currentRole === "elder"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    : "bg-rose-100 text-rose-800 hover:bg-rose-100"
                }`}
              >
                {currentRole === "elder" ? (
                  <>
                    <UserCog className="h-3.5 w-3.5" />
                    <span>Elder Mode</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-3.5 w-3.5" />
                    <span>Volunteer Mode</span>
                  </>
                )}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-rose-700 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                <span className="sr-only">Notifications</span>
              </Button>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default header for other pages
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700">
              VillageCare
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Link to="/auth/login">
                  <Button
                    variant="outline"
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
