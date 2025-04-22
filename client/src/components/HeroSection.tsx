import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowRight, Gauge } from "lucide-react";
import { useUserData } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { userData, currentRole } = useUserData();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <section
      id="top"
      className="relative w-full py-20 md:py-32 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-rose-200 rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-rose-300 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6 max-w-[600px]">
            <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium mb-2 animate-fade-in">
              {t("landing.hero.tagline")}
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-rose-900 via-rose-700 to-rose-800">
              {t("landing.hero.title")}
            </h1>
            <p className="max-w-[600px] text-gray-600 md:text-xl leading-relaxed">
              {t("landing.hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-rose-200 transition-all hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-1">
                    {currentRole === "elder"
                      ? t("landing.hero.elderDashboard")
                      : t("landing.hero.volunteerDashboard")}
                    <Gauge className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth/register">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-rose-200 transition-all hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-1">
                    {t("landing.hero.joinButton")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  className="w-full px-8 py-6 text-lg rounded-xl border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 transition-all"
                >
                  {t("landing.hero.learnMoreButton")}
                </Button>
              </a>
            </div>
            {isAuthenticated && (
              <div className="text-sm text-gray-500 pt-2">
                {t("landing.hero.welcomeBack", { name: userData?.first_name })}{" "}
                {t(
                  currentRole === "elder"
                    ? "landing.hero.elderMode"
                    : "landing.hero.volunteerMode"
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-rose-100 rounded-3xl transform rotate-3 scale-105"></div>
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/hero.png"
                alt={t("landing.hero.imageAlt")}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent"></div>

              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-[260px] transform hover:-translate-y-1 transition-transform">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-rose-200 flex items-center justify-center">
                    <span className="text-rose-700 font-bold">NM</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nada M.</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="h-4 w-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm italic text-gray-700">
                  {t("landing.hero.testimonialQuote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
