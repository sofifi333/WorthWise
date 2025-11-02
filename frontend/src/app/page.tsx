/**
 * Landing Page (Home)
 * Main entry point for WorthWise application
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700/50 rounded-full backdrop-blur-sm border border-blue-400/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium">Make Data-Driven Decisions</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Find Your Perfect
                <br />
                <span className="text-blue-300">College Investment</span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 max-w-xl">
                Compare programs, analyze ROI, and calculate true costs. Make the smartest decision for your future with real data and insights.
              </p>
              
              <Link href="/planner">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-semibold">
                  Get Started Free
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>

            {/* Right Column - Image/Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
                  <img 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect fill='%23f0f9ff' width='800' height='600'/%3E%3Cg fill-opacity='0.15'%3E%3Cpath fill='%230ea5e9' d='M100 150h150v300H100z'/%3E%3Cpath fill='%2338bdf8' d='M280 200h150v250H280z'/%3E%3Cpath fill='%2322d3ee' d='M460 100h150v350H460z'/%3E%3Cpath fill='%2306b6d4' d='M640 180h60v270h-60z'/%3E%3C/g%3E%3C/svg%3E"
                    alt="Analytics visualization" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-900">2,500+</div>
              <div className="text-zinc-600 mt-2">Colleges Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900">95%</div>
              <div className="text-zinc-600 mt-2">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900">$50K+</div>
              <div className="text-zinc-600 mt-2">Avg. Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-zinc-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              Everything You Need to Make an Informed Decision
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Comprehensive tools and real data to help you compare college options and calculate your return on investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">True Cost Calculator</h3>
                <p className="text-zinc-600">
                  Calculate the real cost of college including tuition, housing, food, transportation, and all hidden expenses. Get accurate projections for your total investment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">ROI Analysis</h3>
                <p className="text-zinc-600">
                  Analyze return on investment with projected earnings at 1, 3, and 5 years post-graduation. See payback periods and debt-to-income ratios.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Side-by-Side Comparison</h3>
                <p className="text-zinc-600">
                  Compare up to 4 programs simultaneously. Visualize differences in cost, debt, earnings, and graduation rates to find the best fit for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-600">
              Three simple steps to understand your college investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Select Your Programs</h3>
              <p className="text-zinc-600">
                Choose institutions and majors you&apos;re considering. Search from over 2,500 colleges and hundreds of programs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Customize Your Scenario</h3>
              <p className="text-zinc-600">
                Adjust housing, expenses, financial aid, and loan terms to match your specific situation and get accurate projections.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Analyze & Compare</h3>
              <p className="text-zinc-600">
                Review detailed KPIs, visualizations, and side-by-side comparisons. Export results and make your decision with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Best College Investment?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start planning today with real data from trusted government sources. No signup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/planner">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-semibold">
                Start Planning
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/methodology">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-semibold">
                Learn Our Methodology
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Data Sources Footer */}
      <section className="py-8 bg-zinc-100 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-zinc-600 mb-2">Trusted data from official U.S. government sources:</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
            <span>U.S. Dept. of Education</span>
            <span>•</span>
            <span>HUD</span>
            <span>•</span>
            <span>Bureau of Economic Analysis</span>
            <span>•</span>
            <span>Energy Information Administration</span>
          </div>
        </div>
      </section>
    </div>
  );
}
