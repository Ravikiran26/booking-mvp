export type Plan = {
  id: string
  name: string
  amountUsd: number
  description: string
  features: string[]
}

export type Payment = {
  id: string
  plan_name: string
  amount_usd: number
  amount_inr: number
  client_name: string
  client_email: string
  payment_id: string
  razorpay_order_id: string
  status: string
  created_at: string
}

export const PLANS: Plan[] = [
  {
    id: '150',
    name: 'Standard Session',
    amountUsd: 150,
    description: '1-hour one-on-one consulting session',
    features: [
      'Software Development',
      'Cyber Security',
      'DevOps',
      'Cloud Architecture',
    ],
  },
  {
    id: '200',
    name: 'Premium Session',
    amountUsd: 200,
    description: '1-hour deep-dive session with follow-up report',
    features: [
      'Everything in Standard',
      'Written summary & action plan',
      'Priority scheduling',
      '1 follow-up email',
    ],
  },
]
