import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getLiveRate, usdToInr } from '@/lib/currency'

export const revalidate = 3600

export default async function HomePage() {
  const rate = await getLiveRate()

  const plans = [
    { id: '10', amountUsd: 10 },
    { id: '15', amountUsd: 15 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <h1 className="text-xl font-semibold tracking-tight">Volarisys</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Technology Consulting</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">
            Technology Consulting Session
          </h2>
          <p className="text-muted-foreground">
            Book a one-on-one expert consulting session. Select your preferred plan below.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Live rate: 1 USD = ₹{rate.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          {plans.map((plan, index) => {
            const amountInr = usdToInr(plan.amountUsd, rate)
            return (
              <Card key={plan.id} className={index === 1 ? 'ring-2 ring-foreground' : ''}>
                {index === 1 && (
                  <div className="px-4 pt-3">
                    <span className="inline-flex items-center rounded-full bg-foreground text-background px-2.5 py-0.5 text-xs font-medium">
                      Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>Technology Consulting</CardTitle>
                  <CardDescription>1-hour expert consulting session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold tracking-tight">${plan.amountUsd}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ≈ ₹{amountInr.toLocaleString('en-IN')} · per session
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/book/${plan.id}`} className="w-full">
                    <Button className="w-full" variant={index === 1 ? 'default' : 'outline'}>
                      Book for ${plan.amountUsd}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Payments secured by Razorpay · UPI · Cards · Netbanking accepted
        </p>
      </main>
    </div>
  )
}
