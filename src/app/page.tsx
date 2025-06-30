import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Calendar, ChefHat, ShoppingCart, Users, CheckCircle, Star, ArrowRight, Package } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              MealPlanner
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-300">
              Plan your meals, manage your inventory, and generate smart shopping lists. 
              The modern way to organize your kitchen and save time.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link 
                  href="/calendar" 
                  className="btn-primary-modern inline-flex items-center gap-2 justify-center"
                >
                  <Calendar className="h-5 w-5" />
                  Go to Calendar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/signup" 
                    className="btn-primary-modern inline-flex items-center gap-2 justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    href="/api/auth/signin" 
                    className="btn-secondary-modern inline-flex items-center gap-2 justify-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Everything you need for meal planning</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Streamline your kitchen workflow with our comprehensive meal planning platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-modern p-6 text-center fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Meal Planning</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Plan your meals with our intuitive calendar interface. Schedule breakfast, lunch, and dinner effortlessly.
              </p>
            </div>

            <div className="card-modern p-6 text-center fade-in" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-4">
                <ChefHat className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recipe Management</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Store and organize your favorite recipes with ingredients, instructions, and nutritional information.
              </p>
            </div>

            <div className="card-modern p-6 text-center fade-in" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white mb-4">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Shopping Lists</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Automatically generate shopping lists based on your planned meals and current inventory levels.
              </p>
            </div>

            <div className="card-modern p-6 text-center fade-in" style={{animationDelay: '0.3s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white mb-4">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Track your pantry items, expiration dates, and quantities to reduce food waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl mb-6">Why choose MealPlanner?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Save Time & Money</h3>
                    <p className="text-slate-600 dark:text-slate-300">Reduce food waste and unnecessary purchases with smart planning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Stress-Free Planning</h3>
                    <p className="text-slate-600 dark:text-slate-300">Never wonder &ldquo;what&rsquo;s for dinner?&rdquo; again with advance meal planning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Healthier Eating</h3>
                    <p className="text-slate-600 dark:text-slate-300">Make better food choices with intentional meal planning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Mobile-First Design</h3>
                    <p className="text-slate-600 dark:text-slate-300">Access your meal plans anywhere with our responsive PWA</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-modern p-8 text-center">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Join thousands of users who have simplified their meal planning with our platform.
              </p>
              {!session && (
                <Link 
                  href="/auth/signup" 
                  className="btn-primary-modern inline-flex items-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Status Section for Logged In Users */}
      {session && (
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="card-modern p-8">
              <h2 className="text-2xl font-bold mb-6">Welcome back, {session.user?.name || session.user?.email}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link href="/calendar" className="group block">
                  <div className="card-modern p-6 text-center group-hover:scale-105 transition-transform">
                    <Calendar className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Calendar</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">View and plan your meals</p>
                  </div>
                </Link>
                <Link href="/meals" className="group block">
                  <div className="card-modern p-6 text-center group-hover:scale-105 transition-transform">
                    <ChefHat className="h-12 w-12 text-teal-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Meals</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Manage your recipes</p>
                  </div>
                </Link>
                <Link href="/inventory" className="group block">
                  <div className="card-modern p-6 text-center group-hover:scale-105 transition-transform">
                    <Package className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Inventory</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Track your pantry</p>
                  </div>
                </Link>
                <Link href="/shopping" className="group block">
                  <div className="card-modern p-6 text-center group-hover:scale-105 transition-transform">
                    <ShoppingCart className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Shopping</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Generate shopping lists</p>
                  </div>
                </Link>
              </div>
              
              {session.user?.isAdmin && (
                <div className="mt-8 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Admin Panel</span>
                  </div>
                  <Link href="/admin" className="inline-flex items-center gap-1 text-white hover:text-purple-100">
                    Manage Users
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
