import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-blue">SmartMotion</h1>
          <Link
            href="/auth/signin"
            className="text-primary-blue hover:underline font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-block bg-blue-100 text-primary-blue text-sm font-semibold px-4 py-2 rounded-full mb-6">
            Your Personal Fitness Guide
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Learn, move, and grow stronger—at your own pace
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            SmartMotion helps you understand your body, build healthy habits, and reach your fitness goals with personalized education and supportive tracking.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-primary-blue hover:bg-blue-600 text-white font-semibold py-4 px-12 rounded-full shadow-lg transition-all hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Your Journey
          </Link>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-5">
              🎯
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Made for You</h3>
            <p className="text-gray-600 leading-relaxed">
              Get a personalized plan that fits your experience level, goals, and schedule—no guesswork needed.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-5">
              📚
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Learn as You Go</h3>
            <p className="text-gray-600 leading-relaxed">
              Understand the "why" behind each movement with bite-sized lessons and daily knowledge checks.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-5">
              📈
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">See Your Progress</h3>
            <p className="text-gray-600 leading-relaxed">
              Celebrate every workout, build momentum with streaks, and watch yourself transform over time.
            </p>
          </div>
        </div>

        {/* Social Proof / Trust */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary-blue to-blue-500 p-8 md:p-12 rounded-3xl text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to feel stronger and more confident?
          </h3>
          <p className="text-blue-100 mb-6 text-lg">
            Join SmartMotion and discover how small, consistent steps lead to big results.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-primary-blue hover:bg-gray-50 font-semibold py-4 px-12 rounded-full transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 text-center text-gray-500 text-sm">
        <p>© 2025 SmartMotion. Your journey to better movement starts here.</p>
      </footer>
    </main>
  )
}
