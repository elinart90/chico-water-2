export type CustomerSegment = 'household' | 'retail' | 'wholesale' | 'corporate'
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'in_transit' | 'delivered' | 'cancelled'
export type PaymentMethod = 'momo' | 'card' | 'cash'
export type UserRole = 'customer' | 'salesperson' | 'admin' | 'driver'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  segment?: CustomerSegment
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: 'bottled' | 'sachet' | 'empty_bottle'
  size: string
  price_household: number
  price_retail: number
  price_wholesale: number
  price_corporate: number
  stock: number
  unit: string
  image_url?: string
  active: boolean
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_name: string
  customer_phone: string
  segment: CustomerSegment
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: 'pending' | 'paid'
  delivery_address: string
  delivery_region: string
  delivery_notes?: string
  preferred_date?: string
  salesperson_id?: string
  driver_id?: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
}
