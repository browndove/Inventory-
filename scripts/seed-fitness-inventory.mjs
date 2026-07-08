/**
 * One-time seed for fitness accessories inventory.
 * Run: npm run db:seed-fitness
 *
 * Uses SEED_USER_EMAIL from .env.local or defaults to the first non-test user.
 */

import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import { resolveDatabaseUrl } from './db-url.mjs'

function loadEnvLocal() {
  try {
    const contents = readFileSync('.env.local', 'utf8')
    for (const line of contents.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const separator = trimmed.indexOf('=')
      if (separator === -1) continue
      const key = trimmed.slice(0, separator)
      const value = trimmed.slice(separator + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // optional
  }
}

loadEnvLocal()

const fitnessProducts = [
  { name: 'Spinning Bike', costPrice: 516, quantity: 5, sellingPrice: 2000 },
  { name: 'Yoga Mat 183×61×0.6', costPrice: 45, quantity: 40, sellingPrice: 145 },
  { name: 'Yoga Mat 185×80×0.8', costPrice: 72, quantity: 40, sellingPrice: 180 },
  { name: 'Mini Stepper', costPrice: 168, quantity: 5, sellingPrice: 380 },
  { name: 'Gym Stepper', costPrice: 432, quantity: 5, sellingPrice: 750 },
  { name: 'Resistant Band', costPrice: 36, quantity: 30, sellingPrice: 80 },
  { name: 'Foot Pad', costPrice: 13.2, quantity: 30, sellingPrice: 74 },
  { name: 'Waist Shaping Belt', costPrice: 27.36, quantity: 20, sellingPrice: 110 },
  { name: 'Knee Pad', costPrice: 15.6, quantity: 50, sellingPrice: 82 },
  { name: 'Fitness Belt', costPrice: 16.2, quantity: 30, sellingPrice: 90 },
  { name: 'Fitness Gloves', costPrice: 26.4, quantity: 50, sellingPrice: 70 },
  { name: 'Waist Belt', costPrice: 61.2, quantity: 20, sellingPrice: 155 },
  { name: 'Accountable Jump Rope W/B', costPrice: 60, quantity: 30, sellingPrice: 146 },
  { name: 'Yoga Ball 25cm', costPrice: 12, quantity: 15, sellingPrice: 80 },
  { name: 'Yoga Ball 55cm', costPrice: 30, quantity: 20, sellingPrice: 100 },
  {
    name: 'Dumbbells Colored (2.5kg)',
    costPrice: 28.5,
    quantity: 50,
    sellingPrice: 108,
    description: '11.40/kg · 125kg total stock',
  },
  {
    name: 'Kettle Bells (2kg)',
    costPrice: 16.32,
    quantity: 180,
    sellingPrice: 80,
    description: '8.16/kg · 360kg total stock',
  },
  {
    name: 'Hex Dumbbells (2.5kg)',
    costPrice: 25.5,
    quantity: 126,
    sellingPrice: 105,
    description: '10.20/kg · 315kg total stock',
  },
  { name: 'Stepping Board', costPrice: 69.6, quantity: 10, sellingPrice: 300 },
  { name: '50kg Dumbbell Set Adjustable', costPrice: 708, quantity: 5, sellingPrice: 1100 },
  { name: 'Weight Lifting Bench', costPrice: 540, quantity: 8, sellingPrice: 1050 },
  { name: 'Kettle Bell 6kg', costPrice: 250, quantity: 0, sellingPrice: 350 },
  { name: 'Kettle Bell 8kg', costPrice: 280, quantity: 0, sellingPrice: 392 },
  { name: 'Kettle Bell 10kg', costPrice: 310, quantity: 0, sellingPrice: 434 },
  { name: 'Kettle Bell 20kg', costPrice: 510, quantity: 0, sellingPrice: 714 },
  { name: 'Hex Dumbbell 15kg (pair)', costPrice: 840, quantity: 0, sellingPrice: 1176 },
  { name: 'Hex Dumbbell 5kg', costPrice: 450, quantity: 0, sellingPrice: 630 },
  { name: 'Hex Dumbbell 10kg', costPrice: 690, quantity: 0, sellingPrice: 966 },
  { name: 'Normal Dumbbell 5kg (pair)', costPrice: 380, quantity: 0, sellingPrice: 532 },
]

async function main() {
  const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL)
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const pool = new Pool({
    connectionString: databaseUrl,
  })

  const seedEmail =
    process.env.SEED_USER_EMAIL ?? 'bluebird23szn@gmail.com'

  const userResult = await pool.query(
    'SELECT id, name, email FROM "user" WHERE email = $1',
    [seedEmail],
  )

  if (userResult.rows.length === 0) {
    throw new Error(`No user found for email: ${seedEmail}`)
  }

  const userId = userResult.rows[0].id
  console.log(`Seeding ${fitnessProducts.length} products for ${userResult.rows[0].name} (${seedEmail})`)

  const existing = await pool.query(
    'SELECT name FROM products WHERE "userId" = $1',
    [userId],
  )
  const existingNames = new Set(
    existing.rows.map((row) => row.name.toLowerCase()),
  )

  let inserted = 0
  let skipped = 0

  for (const product of fitnessProducts) {
    if (existingNames.has(product.name.toLowerCase())) {
      skipped++
      continue
    }

    await pool.query(
      `INSERT INTO products (name, description, "costPrice", "sellingPrice", quantity, "userId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        product.name,
        product.description ?? null,
        product.costPrice.toFixed(2),
        product.sellingPrice.toFixed(2),
        product.quantity,
        userId,
      ],
    )
    inserted++
  }

  console.log(`Done. Inserted: ${inserted}, skipped (already exist): ${skipped}`)
  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
