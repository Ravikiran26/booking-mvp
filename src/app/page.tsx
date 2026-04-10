import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Slot } from '@/lib/types'

export const dynamic = 'force-dynamic'

function formatTime(time: string) {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${m} ${suffix}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const categoryColors: Record<string, string> = {
  'Software Developer': 'bg-blue-50 text-blue-700 ring-blue-700/10',
  'Cyber Security': 'bg-red-50 text-red-700 ring-red-700/10',
  'DevOps': 'bg-orange-50 text-orange-700 ring-orange-700/10',
  'Cloud Architecture': 'bg-purple-50 text-purple-700 ring-purple-700/10',
}

export default async function HomePage() {
  const supabase = createAdminClient()

  const { data: slots, error } = await supabase
    .from('slots')
    .select('*')
    .eq('is_booked', false)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">BookingMVP</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Expert consulting sessions</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Admin</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Book a Session</h2>
          <p className="text-muted-foreground text-base">
            One-on-one expert consulting sessions — $150 / hour. Pick a slot below.
          </p>
        </div>

        {/* Slot grid */}
        {error ? (
          <div className="text-center py-20 text-muted-foreground">
            Failed to load available slots. Please try again.
          </div>
        ) : !slots || slots.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium mb-1">No slots available</p>
            <p className="text-sm">Check back soon for new openings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(slots as Slot[]).map((slot) => (
              <Card key={slot.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{slot.title}</CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0 ${
                        categoryColors[slot.title] ?? 'bg-gray-50 text-gray-700 ring-gray-700/10'
                      }`}
                    >
                      Open
                    </span>
                  </div>
                  <CardDescription>{formatDate(slot.date)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </div>
                  <div className="text-2xl font-semibold tracking-tight">
                    ${slot.price}
                    <span className="text-sm font-normal text-muted-foreground"> / hr</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/book/${slot.id}`} className="w-full">
                    <Button className="w-full" size="sm">Book Now</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
