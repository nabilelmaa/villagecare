import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";

export default function ContactSection() {
  const { t } = useTranslation();

  return (
    <section
      id="contact"
      className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-rose-50 relative overflow-hidden"
    >
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-rose-200 rounded-full opacity-20 blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium mb-4">
            {t("landing.contact.tagline")}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700 mb-6">
            {t("landing.contact.title")}
          </h2>
          <p className="text-gray-600 md:text-xl/relaxed mb-8 max-w-2xl mx-auto">
            {t("landing.contact.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 h-auto text-lg rounded-xl shadow-lg shadow-rose-200 transition-all hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-1 w-full sm:w-auto">
                {t("landing.contact.signupButton")}
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button
                variant="outline"
                className="px-8 py-4 h-auto text-lg rounded-xl border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 transition-all w-full sm:w-auto"
              >
                {t("landing.contact.loginButton")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
