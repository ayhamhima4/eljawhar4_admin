export type ProductCategory =
  | 'قوالب سيليكون'
  | 'أدوات وأقماع تزيين'
  | 'صواني وخبز'
  | 'شوكولاتة ومواد خام'
  | 'ألوان ونكهات'
  | 'تغليف وصناديق';

export type ProductUnit = 'قطعة' | 'طقم' | 'كجم' | 'جرام' | 'درزن' | 'عبوة' | 'لتر';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  minStockThreshold: number;
  unit: ProductUnit;
  imageUrl: string;
  sku: string;
  barcode?: string;
  description: string;
  isFoodItem: boolean; // items like chocolate, flour, gel colors, almond powder that expire
  expiryDate?: string; // YYYY-MM-DD
  productionDate?: string; // YYYY-MM-DD
  batchNumber?: string;
  clicksCount: number;
  salesCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit?: ProductUnit;
  imageUrl?: string;
}

export interface Order {
  id: string; // e.g. BK-1082
  databaseId?: string;
  customerName: string;
  customerType?: string;
  customerPhone: string;
  customerCity: string;
  shippingAddress: string;
  items: OrderItem[];
  itemsSummary: string; // e.g. "طقم قوالب سيليكون + 2 ملونات جل كيك"
  totalAmount: number;
  subtotal?: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'unknown';
  status: OrderStatus;
  notes?: string;
  coupon?: string;
  createdAt: string; // ISO string
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeType: 'restock' | 'sale' | 'waste' | 'adjustment';
  delta: number;
  previousStock: number;
  newStock: number;
  batchNumber?: string;
  reason: string;
  timestamp: string;
}

export interface ExpiryAlert {
  productId: string;
  productName: string;
  category: ProductCategory;
  expiryDate: string;
  daysRemaining: number;
  status: 'expired' | 'critical' | 'warning' | 'good'; // critical <= 15 days, warning <= 45 days
  stock: number;
  unit: ProductUnit;
  batchNumber?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  shippedOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  totalProductsCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalWarehouseUnits: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export interface RealProductDemand {
  productId: string;
  name: string;
  category: ProductCategory;
  orderedUnits: number;
  totalRevenue: number;
  ordersCount: number;
}
