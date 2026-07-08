'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { products, sales } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getProducts() {
  const userId = await getUserId()
  return db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(desc(products.createdAt))
}

export async function getProductById(id: number) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
  return result[0] || null
}

export async function createProduct(data: {
  name: string
  description?: string
  costPrice: number
  sellingPrice: number
  quantity: number
  imageUrl?: string
  imageFile?: string
}) {
  const userId = await getUserId()
  const result = await db
    .insert(products)
    .values({
      ...data,
      userId,
      costPrice: data.costPrice.toString(),
      sellingPrice: data.sellingPrice.toString(),
    })
    .returning()
  revalidatePath('/dashboard')
  return result[0]
}

export async function updateProduct(
  id: number,
  data: {
    name?: string
    description?: string
    costPrice?: number
    sellingPrice?: number
    quantity?: number
    imageUrl?: string
    imageFile?: string
  }
) {
  const userId = await getUserId()
  
  // Convert numbers to strings for numeric fields
  const updateData: any = { ...data }
  if (data.costPrice !== undefined) {
    updateData.costPrice = data.costPrice.toString()
  }
  if (data.sellingPrice !== undefined) {
    updateData.sellingPrice = data.sellingPrice.toString()
  }

  const result = await db
    .update(products)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), eq(products.userId, userId)))
    .returning()
  revalidatePath('/dashboard')
  return result[0]
}

export async function deleteProduct(id: number) {
  const userId = await getUserId()
  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.userId, userId)))
  revalidatePath('/dashboard')
}

export async function recordSale(data: {
  productId: number
  quantitySold: number
}) {
  const userId = await getUserId()
  
  // Get product
  const product = await getProductById(data.productId)
  if (!product) throw new Error('Product not found')
  
  // Calculate amounts
  const sellingPrice = parseFloat(product.sellingPrice as any)
  const costPrice = parseFloat(product.costPrice as any)
  const totalAmount = sellingPrice * data.quantitySold
  const costAmount = costPrice * data.quantitySold
  
  // Create sale record
  const saleResult = await db
    .insert(sales)
    .values({
      userId,
      productId: data.productId,
      quantitySold: data.quantitySold,
      totalAmount: totalAmount.toString(),
      costAmount: costAmount.toString(),
    })
    .returning()
  
  // Update product quantity
  const newQuantity = Math.max(0, (product.quantity || 0) - data.quantitySold)
  await db
    .update(products)
    .set({
      quantity: newQuantity,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, data.productId), eq(products.userId, userId)))
  
  revalidatePath('/dashboard')
  return saleResult[0]
}

export async function getSalesHistory() {
  const userId = await getUserId()
  return db
    .select()
    .from(sales)
    .where(eq(sales.userId, userId))
    .orderBy(desc(sales.createdAt))
}

export async function getSalesInsights() {
  const userId = await getUserId()

  const allSales = await db
    .select({
      productId: sales.productId,
      productName: products.name,
      quantitySold: sales.quantitySold,
      totalAmount: sales.totalAmount,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(eq(sales.userId, userId))
    .orderBy(desc(sales.createdAt))

  const days = 7
  const trend = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - i)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const daySales = allSales.filter((sale) => {
      const soldAt = new Date(sale.createdAt)
      return soldAt >= date && soldAt < nextDate
    })

    trend.push({
      label: date.toLocaleDateString('en-GH', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' }),
      revenue: daySales.reduce(
        (sum, sale) => sum + parseFloat(sale.totalAmount as string),
        0,
      ),
      units: daySales.reduce((sum, sale) => sum + sale.quantitySold, 0),
    })
  }

  const productTotals = new Map<
    number,
    { name: string; units: number; revenue: number }
  >()

  for (const sale of allSales) {
    const existing = productTotals.get(sale.productId) ?? {
      name: sale.productName,
      units: 0,
      revenue: 0,
    }

    existing.units += sale.quantitySold
    existing.revenue += parseFloat(sale.totalAmount as string)
    productTotals.set(sale.productId, existing)
  }

  const mostSold = [...productTotals.entries()]
    .map(([productId, data]) => ({
      productId,
      name: data.name,
      units: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, 5)

  const totalRevenue = allSales.reduce(
    (sum, sale) => sum + parseFloat(sale.totalAmount as string),
    0,
  )
  const totalUnits = allSales.reduce((sum, sale) => sum + sale.quantitySold, 0)

  return {
    trend,
    mostSold,
    totalSales: allSales.length,
    totalRevenue,
    totalUnits,
  }
}

export async function getInventoryStats() {
  const userId = await getUserId()
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
  
  const allSales = await db
    .select()
    .from(sales)
    .where(eq(sales.userId, userId))
  
  // Calculate stats
  let totalCostValue = 0
  let totalInventoryValue = 0
  let totalProfit = 0
  let totalQuantity = 0
  
  for (const product of allProducts) {
    const costPrice = parseFloat(product.costPrice as any)
    const sellingPrice = parseFloat(product.sellingPrice as any)
    const qty = product.quantity || 0
    
    totalCostValue += costPrice * qty
    totalInventoryValue += sellingPrice * qty
    totalQuantity += qty
  }
  
  for (const sale of allSales) {
    const profit = parseFloat(sale.totalAmount as any) - parseFloat(sale.costAmount as any)
    totalProfit += profit
  }
  
  return {
    totalProducts: allProducts.length,
    totalQuantity,
    totalCostValue,
    totalInventoryValue,
    totalProfit,
    totalSalesRecords: allSales.length,
  }
}
