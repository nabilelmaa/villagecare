import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const isLoginPage = location.pathname === "/auth/login";
  const isRegisterPage = location.pathname === "/auth/register";
  const isDashboardPage =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/requests") ||
    location.pathname.startsWith("/messages") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/volunteers") ||
    location.pathname.startsWith("/favorites") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/help");

  if (isLoginPage || isRegisterPage) {
    return null;
  }

  if (isDashboardPage) {
    return (
      <footer
        className={`bg-white border-t border-gray-100 py-4 text-center text-sm text-gray-500 ${
          isRTL ? "mr-0 md:mr-64" : "ml-0 md:ml-64"
        }`}
      >
        <div className="container mx-auto px-4">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer id="about" className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700">
                VillageCare
              </span>
            </Link>
            <p className="text-gray-600 text-sm">{t("footer.tagline")}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.ourServices")}
                </Link>
              </li>
              <li>
                <Link
                  to="/volunteers"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.volunteers")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              {t("footer.resources")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/blog"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonials"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.testimonials")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">
                {t("footer.address.line1")}
                <br />
                {t("footer.address.line2")}
              </li>
              <li>
                <a
                  href="tel:+11234567890"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.phone")}
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@villagecare.com"
                  className="text-gray-600 hover:text-rose-700 transition-colors"
                >
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-sm text-gray-500 mt-4 md:mt-0 flex items-center">
            {t("footer.madeWith")}{" "}
            <Heart className="h-4 w-4 text-rose-500 mx-1" />{" "}
            {t("footer.forCommunity")}
          </p>
        </div>
      </div>
    </footer>
  );
}
