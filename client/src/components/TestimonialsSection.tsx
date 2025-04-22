import { Button } from "../components/ui/button";
import { useTranslation } from "react-i18next";

export default function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section
      id="testimonials"
      className="w-full py-20 md:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-rose-50 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
            {t("landing.testimonials.tagline")}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700">
            {t("landing.testimonials.title")}
          </h2>
          <p className="text-gray-600 md:text-xl/relaxed">
            {t("landing.testimonials.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-pink-200 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-md">
              <div className="flex flex-col space-y-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic text-lg">
                  {t("landing.testimonials.testimonial1.quote")}
                </p>
                <div className="flex items-center space-x-4 pt-4 border-t border-rose-100">
                  <div className="rounded-full bg-rose-100 h-14 w-14 flex items-center justify-center text-rose-700 font-bold text-lg">
                    MA
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("landing.testimonials.testimonial1.name")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("landing.testimonials.testimonial1.role")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group mt-8 md:mt-16">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-rose-200 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-md">
              <div className="flex flex-col space-y-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic text-lg">
                  {t("landing.testimonials.testimonial2.quote")}
                </p>
                <div className="flex items-center space-x-4 pt-4 border-t border-rose-100">
                  <div className="rounded-full bg-rose-100 h-14 w-14 flex items-center justify-center text-rose-700 font-bold text-lg">
                    NE
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("landing.testimonials.testimonial2.name")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("landing.testimonials.testimonial2.role")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
