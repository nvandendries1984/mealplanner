import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Niet geautoriseerd" }, { status: 401 })
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          }
        }
      },
      orderBy: [
        { expirationDate: 'asc' },
        { ingredient: { name: 'asc' } }
      ]
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { message: "Fout bij ophalen voorraad" },
      { status: 500 }
    )
  }
}
