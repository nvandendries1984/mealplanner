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

    const plannedMeals = await prisma.plannedMeal.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        meal: {
          select: {
            id: true,
            name: true,
            description: true,
            servings: true,
          }
        }
      },
      orderBy: {
        plannedDate: 'asc'
      }
    })

    return NextResponse.json(plannedMeals)
  } catch (error) {
    console.error("Error fetching planned meals:", error)
    return NextResponse.json(
      { message: "Fout bij ophalen geplande maaltijden" },
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
    const { mealId, plannedDate, mealType, servings } = body

    if (!mealId || !plannedDate || !mealType) {
      return NextResponse.json(
        { message: "Maaltijd, datum en type zijn verplicht" },
        { status: 400 }
      )
    }

    // Check if meal exists and belongs to user
    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId: session.user.id
      }
    })

    if (!meal) {
      return NextResponse.json(
        { message: "Maaltijd niet gevonden" },
        { status: 404 }
      )
    }

    // Create planned meal
    const plannedMeal = await prisma.plannedMeal.create({
      data: {
        userId: session.user.id,
        mealId,
        plannedDate: new Date(plannedDate),
        mealType,
        servings: servings || meal.servings,
      },
      include: {
        meal: {
          select: {
            id: true,
            name: true,
            description: true,
            servings: true,
          }
        }
      }
    })

    return NextResponse.json(plannedMeal, { status: 201 })
  } catch (error) {
    console.error("Error creating planned meal:", error)
    return NextResponse.json(
      { message: "Fout bij plannen van maaltijd" },
      { status: 500 }
    )
  }
}
