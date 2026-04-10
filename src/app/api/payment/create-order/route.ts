import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { slotId, amount } = await request.json()

    if (!slotId || !amount) {
      return Response.json({ error: 'Missing slotId or amount' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `bk_${slotId.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
    })

    return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (error) {
    console.error('Create order error:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
