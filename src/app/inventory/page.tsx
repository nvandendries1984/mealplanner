"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Package, AlertTriangle, Calendar } from "lucide-react"

interface InventoryItem {
  id: string
  quantity: number
  expirationDate?: string
  location?: string
  notes?: string
  isReserved: boolean
  ingredient: {
    id: string
    name: string
    unit: string
    category?: string
  }
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "expiring" | "reserved">("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchInventory()
    }
  }, [session])

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const getExpiringItems = () => {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    return inventory.filter(item => {
      if (!item.expirationDate) return false
      const expDate = new Date(item.expirationDate)
      return expDate <= threeDaysFromNow && expDate >= now
    })
  }

  const getFilteredItems = () => {
    switch (filter) {
      case "expiring":
        return getExpiringItems()
      case "reserved":
        return inventory.filter(item => item.isReserved)
      default:
        return inventory
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL")
  }

  const getDaysUntilExpiration = (dateString: string) => {
    const expDate = new Date(dateString)
    const now = new Date()
    const diffTime = expDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Voorraad laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const filteredItems = getFilteredItems()
  const expiringItems = getExpiringItems()

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
              <h1 className="text-2xl font-bold text-gray-900">Voorraad</h1>
            </div>
            <Link
              href="/inventory/add"
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Voorraad toevoegen</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Alert for expiring items */}
        {expiringItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">
                {expiringItems.length} item(s) verlopen binnenkort
              </span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Controleer je voorraad en gebruik deze items snel op.
            </p>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "all"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Alle items ({inventory.length})
          </button>
          <button
            onClick={() => setFilter("expiring")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "expiring"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Verloopt snel ({expiringItems.length})
          </button>
          <button
            onClick={() => setFilter("reserved")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "reserved"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Gereserveerd ({inventory.filter(item => item.isReserved).length})
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {filter === "all" ? "Voorraad is leeg" : "Geen items gevonden"}
            </h2>
            <p className="text-gray-500 mb-6">
              {filter === "all" 
                ? "Begin met het toevoegen van ingrediënten aan je voorraad"
                : "Er zijn geen items die aan dit filter voldoen"
              }
            </p>
            {filter === "all" && (
              <Link
                href="/inventory/add"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Eerste item toevoegen</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const daysUntilExpiration = item.expirationDate ? getDaysUntilExpiration(item.expirationDate) : null
              const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 3
              
              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                    item.isReserved 
                      ? "border-blue-500" 
                      : isExpiringSoon 
                        ? "border-yellow-500" 
                        : "border-emerald-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.ingredient.name}</h3>
                    {item.isReserved && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        Gereserveerd
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Hoeveelheid:</span>
                      <span className="font-medium">{item.quantity} {item.ingredient.unit}</span>
                    </div>
                    
                    {item.ingredient.category && (
                      <div className="flex justify-between">
                        <span>Categorie:</span>
                        <span>{item.ingredient.category}</span>
                      </div>
                    )}
                    
                    {item.location && (
                      <div className="flex justify-between">
                        <span>Locatie:</span>
                        <span>{item.location}</span>
                      </div>
                    )}
                    
                    {item.expirationDate && (
                      <div className="flex justify-between items-center">
                        <span>Vervaldatum:</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span className={isExpiringSoon ? "text-yellow-600 font-medium" : ""}>
                            {formatDate(item.expirationDate)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {daysUntilExpiration !== null && (
                      <div className="flex justify-between">
                        <span>Nog:</span>
                        <span className={isExpiringSoon ? "text-yellow-600 font-medium" : ""}>
                          {daysUntilExpiration === 0 
                            ? "Verloopt vandaag" 
                            : daysUntilExpiration === 1 
                              ? "1 dag" 
                              : `${daysUntilExpiration} dagen`
                          }
                        </span>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
