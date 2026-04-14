export async function POST(request: Request) {
  try {
    const { code, amountUsd } = await request.json()

    if (!code || !amountUsd) {
      return Response.json({ error: 'Missing code or amountUsd' }, { status: 400 })
    }

    const raw = process.env.COUPONS ?? ''
    const coupons: Record<string, number> = {}
    for (const entry of raw.split(',')) {
      const [k, v] = entry.trim().split(':')
      if (k && v) coupons[k.toUpperCase()] = Number(v)
    }

    const discount = coupons[code.toUpperCase().trim()]

    if (discount === undefined) {
      return Response.json({ valid: false, message: 'Invalid coupon code' }, { status: 200 })
    }

    if (discount >= amountUsd) {
      return Response.json({ valid: false, message: 'Coupon discount exceeds plan price' }, { status: 200 })
    }

    return Response.json({ valid: true, discountUsd: discount })
  } catch {
    return Response.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
