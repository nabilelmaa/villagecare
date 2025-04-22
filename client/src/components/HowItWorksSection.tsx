import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Users, Calendar, MessageSquare, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function HowItWorksSection() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: Users,
      title: t("landing.howItWorks.steps.1.title"),
      description: t("landing.howItWorks.steps.1.description"),
      step: 1,
    },
    {
      icon: Calendar,
      title: t("landing.howItWorks.steps.2.title"),
      description: t("landing.howItWorks.steps.2.description"),
      step: 2,
    },
    {
      icon: MessageSquare,
      title: t("landing.howItWorks.steps.3.title"),
      description: t("landing.howItWorks.steps.3.description"),
      step: 3,
    },
  ]

  return (
    <section id="how" className="w-full py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-rose-50 to-white"></div>
      <div className="absolute -left-16 top-1/4 w-32 h-32 bg-rose-200 rounded-full opacity-20 blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
            {t("landing.howItWorks.tagline")}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="text-gray-600 md:text-xl/relaxed">{t("landing.howItWorks.description")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
   
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-rose-200 via-rose-300 to-rose-200 transform -translate-y-1/2 z-0"></div>

          {steps.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 text-center relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-200 rounded-full transform rotate-45 scale-110"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg">
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border-2 border-rose-300 flex items-center justify-center font-bold text-rose-600">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-rose-900">{item.title}</h3>
              <p className="text-gray-600 max-w-xs">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/auth/register">
            <Button className="bg-rose-100 text-rose-800 hover:bg-rose-200 px-8 py-3 rounded-xl group">
              {t("landing.howItWorks.getStartedButton")}
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}