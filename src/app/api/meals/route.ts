import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Niet geautoriseerd" }, { status: 401 })
    }

    const meals = await prisma.meal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(meals)
  } catch (error) {
    console.error("Error fetching meals:", error)
    return NextResponse.json(
      { message: "Fout bij ophalen maaltijden" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Niet geautoriseerd" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, instructions, servings, prepTime, cookTime } = body

    if (!name) {
      return NextResponse.json(
        { message: "Naam is verplicht" },
        { status: 400 }
      )
    }

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        name,
        description,
        instructions,
        servings: servings || 1,
        prepTime,
        cookTime,
      }
    })

    return NextResponse.json(meal, { status: 201 })
  } catch (error) {
    console.error("Error creating meal:", error)
    return NextResponse.json(
      { message: "Fout bij aanmaken maaltijd" },
      { status: 500 }
    )
  }
}
