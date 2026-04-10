import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      slotId,
      clientName,
      clientEmail,
    } = await request.json()

    // Verify signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return Response.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Save booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        client_name: clientName,
        client_email: clientEmail,
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking insert error:', bookingError)
      return Response.json({ error: 'Failed to save booking' }, { status: 500 })
    }

    // Mark slot as booked
    const { error: slotError } = await supabase
      .from('slots')
      .update({ is_booked: true })
      .eq('id', slotId)

    if (slotError) {
      console.error('Slot update error:', slotError)
    }

    return Response.json({ success: true, bookingId: booking.id })
  } catch (error) {
    console.error('Verify error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
