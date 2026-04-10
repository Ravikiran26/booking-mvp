export async function getLiveRate(): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', {
      next: { revalidate: 3600 }, // cache for 1 hour
    })

    if (!res.ok) throw new Error('Rate fetch failed')

    const data = await res.json()
    return data.rates.INR as number
  } catch {
    // Fallback to a safe rate if API is down
    return 84
  }
}

export function usdToInr(usd: number, rate: number): number {
  return Math.round(usd * rate)
}
