/**
 * Import/sync products from DILITRUST FITNESS EQUIPMENTS.xlsx
 * Run: npm run db:import-fitness
 *
 * Rules:
 * - costPrice = COST W/O SHIPPN (first number in cell)
 * - quantity = QUANTITY (leading integer; 0 if blank)
 * - sellingPrice = ACT SELLING PRICE, else EST SELLING PRICE, else 0 (no estimates)
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Pool } from 'pg'
import XLSX from 'xlsx'
import { resolveDatabaseUrl } from './db-url.mjs'

const EXCEL_FILE = 'DILITRUST FITNESS EQUIPMENTS.xlsx'
const SECTION_HEADERS = new Set(['KETTLE BELL', 'HEX DUMBELL', 'NORMAL DUMBBELLS'])

const LEGACY_NAME_ALIASES = {
  'Spinning Bike': 'SPINNING BIKE',
  'Yoga Mat 183×61×0.6': 'YOGA MAT 183*61*0.6',
  'Yoga Mat 185×80×0.8': 'YOGA MAT 185*80*0.8',
  'Mini Stepper': 'MINI STEPPER',
  'Gym Stepper': 'GYM STEPPER',
  'Resistant Band': 'RESISTANT BAND',
  'Foot Pad': 'FOOT PAD',
  'Waist Shaping Belt': 'WAIST SHAPING BELT',
  'Knee Pad': 'KNEE PAD',
  'Fitness Belt': 'FITNESS BELT',
  'Fitness Gloves': 'FITNESS GLOVES',
  'Waist Belt': 'WAIST BELT',
  'Accountable Jump Rope W/B': 'ACCOUNTABLE JUMB ROPE W B',
  'Yoga Ball 25cm': 'YOGA BALLS -25CM',
  'Yoga Ball 55cm': 'YOGA BALLS -55CM',
  'Dumbbells Colored (2.5kg)': 'DUMB BELLS COLORED',
  'Kettle Bells (2kg)': 'KETTLE BELLS',
  'Hex Dumbbells (2.5kg)': 'HEX DUMBELLS',
  'Stepping Board': 'STEPPING BOARD',
  '50kg Dumbbell Set Adjustable': '50KG DUMBELL SET ADJUSTABLE',
  'Weight Lifting Bench': 'WEIGHT LIFTING BENCH',
  'Kettle Bell 6kg': 'KETTLE BELL 6KG',
  'Kettle Bell 8kg': 'KETTLE BELL 8KG',
  'Kettle Bell 10kg': 'KETTLE BELL 10KG',
  'Kettle Bell 20kg': 'KETTLE BELL 20KG',
  'Hex Dumbbell 15kg (pair)': 'HEX DUMBELL 15KG',
  'Hex Dumbbell 5kg': 'HEX DUMBELL 5KG',
  'Hex Dumbbell 10kg': 'HEX DUMBELL 10KG',
  'Normal Dumbbell 5kg (pair)': 'NORMAL DUMBBELLS 5KG',
}

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

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0
  const normalized = String(value).replace(/,/g, '')
  const match = normalized.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

function parseQuantity(value) {
  if (value === null || value === undefined || value === '') return 0
  const match = String(value).trim().match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function parseSellingPrice(estSelling, actSelling) {
  const act = String(actSelling ?? '').trim()
  if (act) return parseNumber(act)

  const est = String(estSelling ?? '').trim()
  if (est) return parseNumber(est)

  return 0
}

function parseProductsFromWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  const products = []
  let currentSection = ''

  for (const row of rows) {
    const name = String(row[0] ?? '').trim()
    const costRaw = row[1]
    const quantityRaw = row[2]
    const estSelling = row[5]
    const actSelling = row[6]

    if (!name || name === 'FITNESS ACCESSORIES') continue

    const costText = String(costRaw ?? '').trim()
    const quantityText = String(quantityRaw ?? '').trim()

    if (SECTION_HEADERS.has(name)) {
      currentSection = name
      continue
    }

    if (currentSection && /^\d+KG/i.test(name) && costText) {
      products.push({
        name: `${currentSection} ${name.toUpperCase()}`,
        costPrice: parseNumber(costText),
        quantity: parseQuantity(quantityText),
        sellingPrice: parseSellingPrice(estSelling, actSelling),
        description: costText.includes('/') ? costText : undefined,
      })
      continue
    }

    if (!costText) continue

    currentSection = ''

    products.push({
      name,
      costPrice: parseNumber(costText),
      quantity: parseQuantity(quantityText),
      sellingPrice: parseSellingPrice(estSelling, actSelling),
      description:
        costText.includes('/') || quantityText.includes('(')
          ? [costText, quantityText].filter(Boolean).join(' · ')
          : undefined,
    })
  }

  return products
}

async function main() {
  loadEnvLocal()

  const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL)
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const excelPath = join(process.cwd(), EXCEL_FILE)
  const products = parseProductsFromWorkbook(excelPath)
  const seedEmail = process.env.SEED_USER_EMAIL ?? 'bluebird23szn@gmail.com'

  const pool = new Pool({
    connectionString: databaseUrl,
  })

  const userResult = await pool.query(
    'SELECT id, name, email FROM "user" WHERE email = $1',
    [seedEmail],
  )

  if (userResult.rows.length === 0) {
    throw new Error(`No user found for email: ${seedEmail}`)
  }

  const userId = userResult.rows[0].id
  console.log(`Importing ${products.length} products for ${userResult.rows[0].name} (${seedEmail})`)

  const existingResult = await pool.query(
    'SELECT id, name FROM products WHERE "userId" = $1',
    [userId],
  )

  const existingByName = new Map(
    existingResult.rows.map((row) => [row.name.toLowerCase(), row]),
  )

  let inserted = 0
  let updated = 0

  for (const product of products) {
    const aliasMatch = Object.entries(LEGACY_NAME_ALIASES).find(
      ([, excelName]) => excelName.toLowerCase() === product.name.toLowerCase(),
    )

    let existing =
      existingByName.get(product.name.toLowerCase()) ??
      (aliasMatch
        ? existingByName.get(aliasMatch[0].toLowerCase())
        : undefined)

    if (existing) {
      await pool.query(
        `UPDATE products
         SET name = $1,
             description = $2,
             "costPrice" = $3,
             "sellingPrice" = $4,
             quantity = $5,
             "updatedAt" = NOW()
         WHERE id = $6 AND "userId" = $7`,
        [
          product.name,
          product.description ?? null,
          product.costPrice.toFixed(2),
          product.sellingPrice.toFixed(2),
          product.quantity,
          existing.id,
          userId,
        ],
      )
      updated++
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

  const importedNames = new Set(products.map((product) => product.name.toLowerCase()))
  const legacyNames = new Set(
    Object.keys(LEGACY_NAME_ALIASES).map((name) => name.toLowerCase()),
  )

  let removed = 0
  for (const row of existingResult.rows) {
    const lowerName = row.name.toLowerCase()
    if (importedNames.has(lowerName)) continue
    if (!legacyNames.has(lowerName)) continue

    await pool.query('DELETE FROM products WHERE id = $1 AND "userId" = $2', [
      row.id,
      userId,
    ])
    removed++
  }

  console.log(`Done. Updated: ${updated}, inserted: ${inserted}, removed legacy duplicates: ${removed}`)
  console.log('\nImported products:')
  for (const product of products) {
    console.log(
      `- ${product.name} | cost: ${product.costPrice} | qty: ${product.quantity} | sell: ${product.sellingPrice}`,
    )
  }

  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
