'use client'

import { useState } from 'react'
import { DashboardClient } from '@/components/dashboard-client'

const demoInsights = {
  trend: [
    { label: 'Mon', dateLabel: 'Mon', revenue: 120, units: 2 },
    { label: 'Tue', dateLabel: 'Tue', revenue: 80, units: 1 },
    { label: 'Wed', dateLabel: 'Wed', revenue: 200, units: 4 },
    { label: 'Thu', dateLabel: 'Thu', revenue: 150, units: 3 },
    { label: 'Fri', dateLabel: 'Fri', revenue: 300, units: 5 },
    { label: 'Sat', dateLabel: 'Sat', revenue: 90, units: 2 },
    { label: 'Sun', dateLabel: 'Sun', revenue: 60, units: 1 },
  ],
  mostSold: [
    { productId: 1, name: 'Wireless Headphones', units: 12, revenue: 1199.88 },
    { productId: 2, name: 'USB-C Cable (2m)', units: 45, revenue: 584.55 },
    { productId: 3, name: 'Portable Speaker', units: 8, revenue: 399.92 },
  ],
  totalSales: 18,
  totalRevenue: 1000,
  totalUnits: 65,
}

const demoProducts = [
  {
    id: 1,
    userId: 'demo',
    name: 'Wireless Headphones',
    description: 'High-quality noise-cancelling headphones with premium sound.',
    costPrice: '35.00',
    sellingPrice: '99.99',
    quantity: 45,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 'demo',
    name: 'USB-C Cable (2m)',
    description: 'Durable fast charging cable for all your devices.',
    costPrice: '2.50',
    sellingPrice: '12.99',
    quantity: 150,
    imageUrl:
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=800&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: 'demo',
    name: 'Portable Speaker',
    description: 'Waterproof Bluetooth speaker with rich bass.',
    costPrice: '15.00',
    sellingPrice: '49.99',
    quantity: 28,
    imageUrl:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    userId: 'demo',
    name: 'Phone Stand',
    description: 'Adjustable metal phone stand for desk or bedside.',
    costPrice: '4.00',
    sellingPrice: '15.99',
    quantity: 87,
    imageUrl:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=800&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    userId: 'demo',
    name: 'Screen Protector Pack',
    description: 'Tempered glass screen protector pack, 5 pieces.',
    costPrice: '8.00',
    sellingPrice: '19.99',
    quantity: 200,
    imageUrl:
      'https://images.unsplash.com/photo-1616763355603-9755a640a2a9?w=600&h=800&fit=crop',
    imageFile: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function DemoPage() {
  return (
    <DashboardClient
      user={{
        name: 'Demo Admin',
        email: 'demo@inventory.local',
      }}
      products={demoProducts}
      insights={demoInsights}
      isDemo
    />
  )
}
