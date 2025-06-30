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

    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                unit: true,
                category: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(shoppingLists)
  } catch (error) {
    console.error("Error fetching shopping lists:", error)
    return NextResponse.json(
      { message: "Fout bij ophalen boodschappenlijsten" },
      { status: 500 }
    )
  }
}
