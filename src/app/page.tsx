import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/lib/types'
import { getLiveRate, usdToInr } from '@/lib/currency'

export const revalidate = 3600

export default async function HomePage() {
  const rate = await getLiveRate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">BookingMVP</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Expert consulting sessions</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold tracking-tight mb-3">
            Book a Consulting Session
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One-on-one expert sessions in Software Development, Cyber Security,
            DevOps, and Cloud Architecture.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Live rate: 1 USD = ₹{rate.toFixed(2)}
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan, index) => {
            const amountInr = usdToInr(plan.amountUsd, rate)
            return (
              <Card
                key={plan.id}
                className={index === 1 ? 'ring-2 ring-foreground' : ''}
              >
                {index === 1 && (
                  <div className="px-4 pt-3">
                    <span className="inline-flex items-center rounded-full bg-foreground text-background px-2.5 py-0.5 text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold tracking-tight">
                      ${plan.amountUsd}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      ≈ ₹{amountInr.toLocaleString('en-IN')} · per session
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <svg
                          className="size-4 text-green-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={`/book/${plan.id}`} className="w-full">
                    <Button
                      className="w-full"
                      variant={index === 1 ? 'default' : 'outline'}
                    >
                      Get Started — ${plan.amountUsd}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Indian & international cards · UPI · Netbanking · Wallets — all accepted via Razorpay
        </p>
      </main>
    </div>
  )
}
