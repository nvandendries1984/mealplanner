"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Clock, Users, ChefHat } from "lucide-react"

interface Meal {
  id: string
  name: string
  description: string | null
  instructions: string
  prepTime: number | null
  servings: number | null
  imageUrl: string | null
  createdAt: string
  ingredients: {
    id: string
    name: string
    amount: number
    unit: string
  }[]
}

export default function MealsPage() {
  const { data: session, status } = useSession()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      redirect("/auth/signin")
      return
    }

    fetchMeals()
  }, [session, status])

  const fetchMeals = async () => {
    try {
      const response = await fetch("/api/meals")
      if (!response.ok) {
        throw new Error("Failed to fetch meals")
      }
      const data = await response.json()
      setMeals(data)
    } catch {
      setError("Failed to load meals")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/calendar"
              className="nav-link-modern flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Calendar
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Meals</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Manage your recipes and meal library
              </p>
            </div>
            <Link
              href="/meals/add"
              className="btn-primary-modern flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Meal
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {meals.length === 0 ? (
          <div className="text-center py-16">
            <div className="card-modern p-12 max-w-md mx-auto">
              <ChefHat className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-2">No meals yet</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Start building your meal library by adding your first recipe
              </p>
              <Link
                href="/meals/add"
                className="btn-primary-modern inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Your First Meal
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div key={meal.id} className="card-modern overflow-hidden group">
                {/* Meal Image */}
                <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-emerald-600" />
                </div>
                
                {/* Meal Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">
                    {meal.name}
                  </h3>
                  
                  {meal.description && (
                    <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {meal.description}
                    </p>
                  )}

                  {/* Meal Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-300">
                    {meal.prepTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{meal.prepTime} min</span>
                      </div>
                    )}
                    {meal.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{meal.servings} servings</span>
                      </div>
                    )}
                  </div>

                  {/* Ingredients Preview */}
                  {meal.ingredients.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Ingredients:</p>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                          <span key={ingredient.id}>
                            {ingredient.name}
                            {index < Math.min(meal.ingredients.length, 3) - 1 ? ", " : ""}
                          </span>
                        ))}
                        {meal.ingredients.length > 3 && (
                          <span className="text-slate-500">
                            {" "}and {meal.ingredients.length - 3} more...
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/meals/${meal.id}`}
                      className="btn-primary-modern flex-1 text-center"
                    >
                      View Recipe
                    </Link>
                    <Link
                      href={`/meals/${meal.id}/edit`}
                      className="btn-secondary-modern px-4"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
