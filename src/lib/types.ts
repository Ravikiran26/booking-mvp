export type Plan = {
  id: string
  name: string
  amountUsd: number
  description: string
}

export const PLANS: Plan[] = [
  {
    id: '150',
    name: 'Technology Consulting',
    amountUsd: 150,
    description: 'One-on-one expert technology consulting session',
  },
  {
    id: '200',
    name: 'Technology Consulting',
    amountUsd: 200,
    description: 'One-on-one expert technology consulting session',
  },
]
