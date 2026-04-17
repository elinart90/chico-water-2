import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OrderStatus, CustomerSegment } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return `GH₵ ${Number(amount).toFixed(2)}`
}

export function generateOrderNumber() {
  const num = Math.floor(Math.random() * 90000) + 10000
  return `CW-${num}`
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending', confirmed: 'Confirmed', packed: 'Packed',
  in_transit: 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  household: 'Household', retail: 'Retail',
  wholesale: 'Wholesale', corporate: 'Corporate',
}

export const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Oti', 'Ahafo', 'Bono East', 'North East', 'Savannah', 'Western North',
]

export const DELIVERY_FEE = 15
