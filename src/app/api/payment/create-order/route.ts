import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { planId, amountInr } = await request.json()

    if (!planId || !amountInr) {
      return Response.json({ error: 'Missing planId or amountInr' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amountInr * 100), // paise
      currency: 'INR',
      receipt: `bk_${planId}_${Date.now().toString().slice(-8)}`,
    })

    return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (error) {
    console.error('Create order error:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
