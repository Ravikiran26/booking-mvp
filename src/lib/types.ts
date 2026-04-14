export type Plan = {
  id: string
  name: string
  amountUsd: number
  description: string
}

export const PLANS: Plan[] = [
  {
    id: '10',
    name: 'Technology Consulting',
    amountUsd: 10,
    description: 'One-on-one expert technology consulting session',
  },
  {
    id: '15',
    name: 'Technology Consulting',
    amountUsd: 15,
    description: 'One-on-one expert technology consulting session',
  },
]
