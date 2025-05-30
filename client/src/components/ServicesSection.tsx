import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";

export default function ServicesSection() {
  const { t } = useTranslation();

  const services = [
    {
      title: t("landing.services.items.1.title"),
      description: t("landing.services.items.1.description"),
      color: "from-rose-500 to-rose-600",
    },
    {
      title: t("landing.services.items.2.title"),
      description: t("landing.services.items.2.description"),
      color: "from-pink-500 to-rose-500",
    },
    {
      title: t("landing.services.items.3.title"),
      description: t("landing.services.items.3.description"),
      color: "from-rose-600 to-pink-600",
    },
    {
      title: t("landing.services.items.4.title"),
      description: t("landing.services.items.4.description"),
      color: "from-pink-600 to-rose-500",
    },
    {
      title: t("landing.services.items.5.title"),
      description: t("landing.services.items.5.description"),
      color: "from-rose-500 to-pink-500",
    },
    {
      title: t("landing.services.items.6.title"),
      description: t("landing.services.items.6.description"),
      color: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <section
      id="services"
      className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-rose-50 relative overflow-hidden"
    >
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-rose-300 rounded-full opacity-20 blur-3xl transform translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-100/30 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          <div className="md:w-2/5 space-y-6">
            <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
              {t("landing.services.tagline")}
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700">
              {t("landing.services.title")}
            </h2>
            <p className="text-gray-600 md:text-xl/relaxed">
              {t("landing.services.description")}
            </p>
            <div className="pt-4">
              <Link to="/auth/register">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl shadow-md">
                  {t("landing.services.volunteerButton")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:w-3/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl ${service.color}`}
                  ></div>
                  <div className="absolute inset-0 border border-rose-200 rounded-2xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-rose-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
