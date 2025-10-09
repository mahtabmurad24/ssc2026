import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, jerseyName, class: studentClass, section, mobileNumber, trxId, paymentNumber, paymentMethod, location, customLocation } = body

    // Validate required fields
    if (!name || !studentClass || !section || !mobileNumber) {
      return NextResponse.json(
        { error: 'Name, class, section, and mobile number are required' },
        { status: 400 }
      )
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      )
    }

    if (paymentMethod === 'bkash' && (!trxId || !paymentNumber)) {
      return NextResponse.json(
        { error: 'Transaction ID and payment number are required for bKash' },
        { status: 400 }
      )
    }

    if (paymentMethod === 'cash' && !location) {
      return NextResponse.json(
        { error: 'Location is required for cash payment' },
        { status: 400 }
      )
    }

    if (location === 'Other' && !customLocation) {
      return NextResponse.json(
        { error: 'Custom location is required' },
        { status: 400 }
      )
    }

    // Create the order
    const order = await db.jerseyOrder.create({
      data: {
        name,
        jerseyName,
        class: studentClass,
        section,
        mobileNumber,
        trxId,
        paymentNumber,
        paymentMethod,
        location,
        customLocation,
        status: 'pending'
      }
    })

    return NextResponse.json(
      {
        message: 'Order created successfully',
        orderId: order.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const orders = await db.jerseyOrder.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
