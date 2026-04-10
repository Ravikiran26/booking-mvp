export type Slot = {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  price: number
  is_booked: boolean
}

export type Booking = {
  id: string
  slot_id: string
  client_name: string
  client_email: string
  payment_id: string
  razorpay_order_id: string
  status: string
  created_at: string
  slots?: Pick<Slot, 'title' | 'date' | 'start_time' | 'end_time' | 'price'>
}
