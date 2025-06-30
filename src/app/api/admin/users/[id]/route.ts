import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ message: "Niet geautoriseerd" }, { status: 401 })
    }

    const body = await request.json()
    const { isAdmin } = body

    // Prevent users from removing their own admin status
    if (id === session.user.id && !isAdmin) {
      return NextResponse.json(
        { message: "Je kunt je eigen admin rechten niet intrekken" },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { message: "Fout bij bijwerken gebruiker" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ message: "Niet geautoriseerd" }, { status: 401 })
    }

    // Prevent users from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Je kunt je eigen account niet verwijderen" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Gebruiker verwijderd" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { message: "Fout bij verwijderen gebruiker" },
      { status: 500 }
    )
  }
}
