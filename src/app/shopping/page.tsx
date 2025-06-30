"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, ShoppingCart, Check, Trash2 } from "lucide-react"

interface ShoppingListItem {
  id: string
  quantity: number
  isPurchased: boolean
  notes?: string
  ingredient: {
    id: string
    name: string
    unit: string
    category?: string
  }
}

interface ShoppingList {
  id: string
  name: string
  isCompleted: boolean
  createdAt: string
  items: ShoppingListItem[]
}

export default function ShoppingPage() {
  const { data: session, status } = useSession()
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchShoppingLists()
    }
  }, [session])

  const fetchShoppingLists = async () => {
    try {
      const response = await fetch("/api/shopping-lists")
      if (response.ok) {
        const data = await response.json()
        setShoppingLists(data)
      }
    } catch (error) {
      console.error("Error fetching shopping lists:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItemPurchased = async (listId: string, itemId: string, isPurchased: boolean) => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPurchased: !isPurchased }),
      })

      if (response.ok) {
        setShoppingLists(prev =>
          prev.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map(item =>
                    item.id === itemId ? { ...item, isPurchased: !isPurchased } : item
                  )
                }
              : list
          )
        )
      }
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const deleteShoppingList = async (listId: string) => {
    if (!confirm("Weet je zeker dat je deze boodschappenlijst wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setShoppingLists(prev => prev.filter(list => list.id !== listId))
      }
    } catch (error) {
      console.error("Error deleting shopping list:", error)
    }
  }

  const generateWeeklyList = async () => {
    try {
      const response = await fetch("/api/shopping-lists/generate", {
        method: "POST",
      })

      if (response.ok) {
        await fetchShoppingLists()
      }
    } catch (error) {
      console.error("Error generating shopping list:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Boodschappenlijsten laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-emerald-600 hover:text-emerald-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Terug
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Boodschappenlijsten</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={generateWeeklyList}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Weeklijst genereren</span>
              </button>
              <Link
                href="/shopping/new"
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nieuwe lijst</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {shoppingLists.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Geen boodschappenlijsten</h2>
            <p className="text-gray-500 mb-6">Maak je eerste boodschappenlijst of genereer er automatisch een</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={generateWeeklyList}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Weeklijst genereren</span>
              </button>
              <Link
                href="/shopping/new"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Handmatige lijst</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {shoppingLists.map((list) => {
              const purchasedCount = list.items.filter(item => item.isPurchased).length
              const totalCount = list.items.length
              const progressPercentage = totalCount > 0 ? (purchasedCount / totalCount) * 100 : 0

              return (
                <div key={list.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{list.name}</h3>
                      <p className="text-sm text-gray-500">
                        Aangemaakt op {new Date(list.createdAt).toLocaleDateString("nl-NL")}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {purchasedCount}/{totalCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteShoppingList(list.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {list.items.length === 0 ? (
                    <p className="text-gray-500 italic">Geen items in deze lijst</p>
                  ) : (
                    <div className="space-y-2">
                      {list.items
                        .sort((a, b) => {
                          if (a.isPurchased !== b.isPurchased) {
                            return a.isPurchased ? 1 : -1
                          }
                          return a.ingredient.name.localeCompare(b.ingredient.name)
                        })
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border ${
                              item.isPurchased
                                ? "bg-gray-50 border-gray-200"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <button
                              onClick={() => toggleItemPurchased(list.id, item.id, item.isPurchased)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                item.isPurchased
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-gray-300 hover:border-emerald-600"
                              }`}
                            >
                              {item.isPurchased && <Check className="w-3 h-3" />}
                            </button>
                            
                            <div className={`flex-1 ${item.isPurchased ? "line-through text-gray-500" : ""}`}>
                              <span className="font-medium">{item.ingredient.name}</span>
                              <span className="text-gray-600 ml-2">
                                {item.quantity} {item.ingredient.unit}
                              </span>
                              {item.ingredient.category && (
                                <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded">
                                  {item.ingredient.category}
                                </span>
                              )}
                            </div>
                            
                            {item.notes && (
                              <span className="text-xs text-gray-500">{item.notes}</span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
