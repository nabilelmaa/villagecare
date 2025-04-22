import HeroSection from "./components/HeroSection"
import HowItWorksSection from "./components/HowItWorksSection"
import ServicesSection from "./components/ServicesSection"
import TestimonialsSection from "./components/TestimonialsSection"
import ContactSection from "./components/ContactSection"

export default function App() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-white to-rose-50">
      <main className="flex-1 w-full mx-auto">
        <HeroSection />
        <HowItWorksSection />
        <ServicesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
    </div>
  )
}
