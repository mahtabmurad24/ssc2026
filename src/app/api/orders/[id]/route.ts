import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get('password')

    // Check admin password
    if (adminPassword !== 'M@ht@fadmin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, amountPaid, totalPrice } = body

    if (!status && amountPaid === undefined && totalPrice === undefined) {
      return NextResponse.json(
        { error: 'At least one field (status, amountPaid, or totalPrice) is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice

    // Calculate remaining price if both amountPaid and totalPrice are provided
    if (amountPaid !== undefined && totalPrice !== undefined) {
      updateData.remainingPrice = totalPrice - amountPaid
    } else if (amountPaid !== undefined || totalPrice !== undefined) {
      // If only one is updated, fetch current values to recalculate
      const currentOrder = await db.jerseyOrder.findUnique({
        where: { id: params.id }
      })
      if (currentOrder) {
        const currentAmountPaid = amountPaid !== undefined ? amountPaid : currentOrder.amountPaid || 0
        const currentTotalPrice = totalPrice !== undefined ? totalPrice : currentOrder.totalPrice || 0
        updateData.remainingPrice = currentTotalPrice - currentAmountPaid
      }
    }

    const order = await db.jerseyOrder.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get('password')

    // Check admin password
    if (adminPassword !== 'M@ht@fadmin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.jerseyOrder.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
