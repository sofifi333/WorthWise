/**
 * Landing Page (Home)
 * Main entry point for WorthWise application
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, BarChart3, Sparkles, GraduationCap, DollarSign, ArrowRight, CheckCircle2, Award, Users, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 relative z-10 overflow-visible min-h-0">
              <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Data-Driven College Decisions</span>
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 break-words overflow-visible">
                Find Your Perfect
                <br />
                College Investment
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 max-w-xl leading-relaxed">
                Compare programs, analyze ROI, and calculate true costs. Make the smartest decision for your future with real data and insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/planner">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-7 h-auto font-semibold shadow-lg hover:shadow-xl transition-all group">
                    Get Started for Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/methodology">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-7 h-auto font-semibold border-2 hover:bg-slate-50">
                    View Methodology
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">No Sign-up Required</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">100% Free</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Dashboard Preview */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-slate-200/60 shadow-2xl p-8 space-y-6">
                {/* Mock Dashboard Elements */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Total Cost</div>
                      <div className="text-2xl font-bold text-slate-900">$84,500</div>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>

                {/* Chart visualization */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">ROI Analysis</span>
                    <span className="text-green-600 font-semibold">+24% Better</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 h-32 items-end">
                    <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg h-16 relative group hover:from-blue-600 hover:to-blue-500 transition-all">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">$45k</div>
                    </div>
                    <div className="bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg h-24 relative group hover:from-indigo-600 hover:to-indigo-500 transition-all">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">$68k</div>
                    </div>
                    <div className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-lg h-full relative group hover:from-purple-600 hover:to-purple-500 transition-all">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap">$92k</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center text-slate-500">
                    <div>Y1</div>
                    <div>Y3</div>
                    <div>Y5</div>
                  </div>
                </div>

                {/* Comparison metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Payback Period</div>
                    <div className="text-lg font-bold text-slate-900">8.2 years</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Graduation Rate</div>
                    <div className="text-lg font-bold text-slate-900">87%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 break-words overflow-visible">2,500+</div>
                <div className="text-slate-600 mt-2 font-medium">Colleges Analyzed</div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-300 transition-all hover:shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 break-words overflow-visible">95%</div>
                <div className="text-slate-600 mt-2 font-medium">Data Accuracy</div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 break-words overflow-visible">10K+</div>
                <div className="text-slate-600 mt-2 font-medium">Program Comparisons</div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-indigo-300 transition-all hover:shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 break-words overflow-visible">5+</div>
                <div className="text-slate-600 mt-2 font-medium">Data Sources</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-6 break-words overflow-visible">
              Everything You Need to Make
              <br />
              an Informed Decision
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools and real data to help you compare college options and calculate your return on investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-400 transition-all hover:shadow-xl bg-white/80 backdrop-blur group hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calculator className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">True Cost Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Calculate the real cost of college including tuition, housing, food, transportation, and all hidden expenses. Get accurate projections for your total investment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-400 transition-all hover:shadow-xl bg-white/80 backdrop-blur group hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Analyze return on investment with projected earnings at 1, 3, and 5 years post-graduation. See payback periods and debt-to-income ratios.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-400 transition-all hover:shadow-xl bg-white/80 backdrop-blur group hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Compare up to 4 programs simultaneously. Visualize differences in cost, debt, earnings, and graduation rates to find the best fit for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-6 break-words overflow-visible">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Three simple steps to understand your college investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform relative z-10">
                  1
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Select Your Programs</h3>
                <p className="text-slate-600 leading-relaxed">
                  Choose institutions and majors you&apos;re considering. Search from over 2,500 colleges and hundreds of programs.
                </p>
              </div>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[40px] left-[calc(50%+45px)] w-[calc(100%-50px)] h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 z-0"></div>
            </div>

            <div className="relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform relative z-10">
                  2
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Customize Your Scenario</h3>
                <p className="text-slate-600 leading-relaxed">
                  Adjust housing, expenses, financial aid, and loan terms to match your specific situation and get accurate projections.
                </p>
              </div>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[40px] left-[calc(50%+45px)] w-[calc(100%-50px)] h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 z-0"></div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform relative z-10">
                3
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Analyze & Compare</h3>
              <p className="text-slate-600 leading-relaxed">
                Review detailed KPIs, visualizations, and side-by-side comparisons. Export results and make your decision with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Best
            <br />
            College Investment?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Start planning today with real data from trusted government sources. No signup required, completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/planner">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-7 h-auto font-bold shadow-2xl hover:shadow-xl hover:scale-105 transition-all group">
                Start Planning Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/methodology">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-2 border-white text-white hover:bg-white/20 text-lg px-10 py-7 h-auto font-bold">
                View Methodology
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Instant Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Footer */}
      <section className="py-12 bg-slate-50 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Trusted Data Sources</h3>
            <p className="text-slate-600 mb-6">All data sourced from official U.S. government databases</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">U.S. Dept. of Education</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">HUD</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium">Bureau of Economic Analysis</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium">Energy Information Admin</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
