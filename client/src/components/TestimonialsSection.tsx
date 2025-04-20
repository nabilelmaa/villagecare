import { Button } from "../components/ui/button";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full py-20 md:py-32 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-rose-50 to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
            Hear Their Stories
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-900 to-rose-700">
            Lives Transformed Through Connection
          </h2>
          <p className="text-gray-600 md:text-xl/relaxed">
            Real stories from elders and volunteers who have experienced the
            VillageCare difference.
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
                  "VillageCare has been a blessing. My volunteer Sarah comes by
                  twice a week to help with groceries and just to chat. It's
                  made such a difference in my life."
                </p>
                <div className="flex items-center space-x-4 pt-4 border-t border-rose-100">
                  <div className="rounded-full bg-rose-100 h-14 w-14 flex items-center justify-center text-rose-700 font-bold text-lg">
                    MA
                  </div>
                  <div>
                    <p className="font-medium">Meryem, AB</p>
                    <p className="text-sm text-gray-500">
                      Elder • Member for 1 year
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
                  "Volunteering through VillageCare has been incredibly
                  rewarding. I've formed a wonderful friendship with Mr.
                  Salah, and I look forward to our weekly walks."
                </p>
                <div className="flex items-center space-x-4 pt-4 border-t border-rose-100">
                  <div className="rounded-full bg-rose-100 h-14 w-14 flex items-center justify-center text-rose-700 font-bold text-lg">
                    NE
                  </div>
                  <div>
                    <p className="font-medium">Nabil, EL</p>
                    <p className="text-sm text-gray-500">
                      Volunteer • Member for 2 years
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl px-6"
          >
            Read More Stories
          </Button>
        </div>
      </div>
    </section>
  );
}
