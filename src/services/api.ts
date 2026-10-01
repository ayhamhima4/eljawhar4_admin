import {
  Product,
  Order,
  InventoryLog,
  ExpiryAlert,
  DashboardStats,
  RealProductDemand,
  OrderStatus,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'eljawhara_live_products_v2',
  ORDERS: 'eljawhara_live_orders_v2',
  LOGS: 'eljawhara_live_logs_v2',
  CONFIG: 'eljawhara_live_config_v2',
};

// Clean legacy mock keys if present
try {
  localStorage.removeItem('eljawhara_admin_products_v1');
  localStorage.removeItem('eljawhara_admin_orders_v1');
  localStorage.removeItem('eljawhara_admin_inventory_logs_v1');
} catch {
  // ignore in SSR / restricted environments
}

// Strictly Empty Initial Data - No Mock Data, No Fake Statistics, No Fake Orders
const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_ORDERS: Order[] = [];
const INITIAL_LOGS: InventoryLog[] = [];

export interface ApiConfiguration {
  backendUrl: string;
  useRemoteBackend: boolean;
  storefrontUrl: string;
  apiKey?: string;
  autoRefreshIntervalSeconds: number;
}

const DEFAULT_CONFIG: ApiConfiguration = {
  backendUrl: 'https://api.eljawhara-omega.vercel.app/api/v1',
  useRemoteBackend: false, // Set to true when external backend endpoint is linked
  storefrontUrl: 'https://eljawhara-omega.vercel.app/',
  autoRefreshIntervalSeconds: 30,
};

// Storage helper functions
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

// Calculate days between two dates
export function getDaysRemaining(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Real Data Service Layer
export const BakeryAdminApi = {
  // Config
  getConfig(): ApiConfiguration {
    return loadFromStorage<ApiConfiguration>(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  },

  saveConfig(newConfig: Partial<ApiConfiguration>): ApiConfiguration {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    saveToStorage(STORAGE_KEYS.CONFIG, updated);
    return updated;
  },

  // Products - Real Only
  async getProducts(): Promise<Product[]> {
    const config = this.getConfig();
    if (config.useRemoteBackend && config.backendUrl) {
      try {
        const response = await fetch(`${config.backendUrl}/products`, {
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : data.products || [];
        }
      } catch (err) {
        console.warn('Failed to fetch from remote backend, using local real storage:', err);
      }
    }
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  async addProduct(newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'clicksCount' | 'salesCount'>): Promise<Product> {
    const products = await this.getProducts();
    const created: Product = {
      ...newProduct,
      id: 'prod-' + Date.now().toString().slice(-6),
      clicksCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const config = this.getConfig();
    if (config.useRemoteBackend && config.backendUrl) {
      try {
        await fetch(`${config.backendUrl}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify(created),
        });
      } catch (err) {
        console.warn('Failed to sync product with remote backend:', err);
      }
    }

    products.unshift(created);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Log real addition
    await this.logInventoryChange({
      productId: created.id,
      productName: created.name,
      changeType: 'restock',
      delta: created.stock,
      previousStock: 0,
      newStock: created.stock,
      reason: 'إضافة صنف جديد فعلياً للمخزن',
    });

    return created;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`المنتج بالرقم ${id} غير موجود`);
    }

    const previousStock = products[index].stock;
    const updated: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    const config = this.getConfig();
    if (config.useRemoteBackend && config.backendUrl) {
      try {
        await fetch(`${config.backendUrl}/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.warn('Failed to sync product update with remote backend:', err);
      }
    }

    // If stock changed, record log
    if (updates.stock !== undefined && updates.stock !== previousStock) {
      await this.logInventoryChange({
        productId: updated.id,
        productName: updated.name,
        changeType: updates.stock > previousStock ? 'restock' : 'adjustment',
        delta: updates.stock - previousStock,
        previousStock,
        newStock: updates.stock,
        reason: 'تحديث بيانات ومخزون المنتج',
      });
    }

    return updated;
  },

  async quickAdjustPrice(id: string, delta: number): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) throw new Error('المنتج غير موجود');
    const newPrice = Math.max(1, product.price + delta);
    return this.updateProduct(id, { price: newPrice });
  },

  async quickAdjustStock(id: string, delta: number): Promise<Product> {
    const product = await this.getProductById(id);
    if (!product) throw new Error('المنتج غير موجود');
    const newStock = Math.max(0, product.stock + delta);
    return this.updateProduct(id, { stock: newStock });
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);

    const config = this.getConfig();
    if (config.useRemoteBackend && config.backendUrl) {
      try {
        await fetch(`${config.backendUrl}/products/${id}`, {
          method: 'DELETE',
          headers: {
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
        });
      } catch (err) {
        console.warn('Failed to delete on remote backend:', err);
      }
    }

    return true;
  },

  // Orders - Real Only (from customers)
  async getOrders(): Promise<Order[]> {
    const config = this.getConfig();
    if (config.useRemoteBackend && config.backendUrl) {
      try {
        const response = await fetch(`${config.backendUrl}/orders`, {
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : data.orders || [];
        }
      } catch (err) {
        console.warn('Failed to fetch orders from remote backend:', err);
      }
    }
    return loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('الطلب غير موجود');

    orders[index].status = newStatus;
    orders[index].updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    const config = this.getConfig();
    if (config.useRemoteBackend && config.backendUrl) {
      try {
        await fetch(`${config.backendUrl}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.warn('Failed to update order status on remote backend:', err);
      }
    }

    return orders[index];
  },

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orders = await this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: 'BK-' + (1000 + orders.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Deduct stock for ordered items
    for (const item of newOrder.items) {
      const prod = await this.getProductById(item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        await this.updateProduct(prod.id, {
          stock: newStock,
          salesCount: (prod.salesCount || 0) + item.quantity,
        });
        await this.logInventoryChange({
          productId: prod.id,
          productName: prod.name,
          changeType: 'sale',
          delta: -item.quantity,
          previousStock: prod.stock,
          newStock,
          reason: `طلب شراء فعلي #${newOrder.id}`,
        });
      }
    }

    return newOrder;
  },

  // Expiry Alerts Tracking - Real Only from existing food items
  async getExpiryAlerts(): Promise<ExpiryAlert[]> {
    const products = await this.getProducts();
    const alerts: ExpiryAlert[] = [];

    products.forEach((p) => {
      if (p.isFoodItem && p.expiryDate) {
        const daysRemaining = getDaysRemaining(p.expiryDate);
        let status: ExpiryAlert['status'] = 'good';

        if (daysRemaining <= 0) {
          status = 'expired';
        } else if (daysRemaining <= 15) {
          status = 'critical';
        } else if (daysRemaining <= 45) {
          status = 'warning';
        }

        alerts.push({
          productId: p.id,
          productName: p.name,
          category: p.category,
          expiryDate: p.expiryDate,
          daysRemaining,
          status,
          stock: p.stock,
          unit: p.unit,
          batchNumber: p.batchNumber,
        });
      }
    });

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  // Inventory Logs & Restock
  async getInventoryLogs(): Promise<InventoryLog[]> {
    return loadFromStorage<InventoryLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  },

  async logInventoryChange(log: Omit<InventoryLog, 'id' | 'timestamp'>): Promise<InventoryLog> {
    const logs = await this.getInventoryLogs();
    const newLog: InventoryLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    saveToStorage(STORAGE_KEYS.LOGS, logs.slice(0, 100));
    return newLog;
  },

  async restockProduct(productId: string, addedQuantity: number, batchNumber?: string, newExpiryDate?: string): Promise<Product> {
    const product = await this.getProductById(productId);
    if (!product) throw new Error('المنتج غير موجود');

    const previousStock = product.stock;
    const newStock = previousStock + addedQuantity;

    const updates: Partial<Product> = {
      stock: newStock,
    };

    if (batchNumber) updates.batchNumber = batchNumber;
    if (newExpiryDate) updates.expiryDate = newExpiryDate;

    const updated = await this.updateProduct(productId, updates);

    await this.logInventoryChange({
      productId: product.id,
      productName: product.name,
      changeType: 'restock',
      delta: addedQuantity,
      previousStock,
      newStock,
      batchNumber,
      reason: `تزويد دفعة وارد للمخزن (+${addedQuantity} ${product.unit})`,
    });

    return updated;
  },

  // Pure Real Calculations: No Mock Numbers
  async getDashboardStats(): Promise<DashboardStats> {
    const products = await this.getProducts();
    const orders = await this.getOrders();
    const expiryAlerts = await this.getExpiryAlerts();

    const confirmedOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalSales = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter((o) => o.status === 'processing').length;
    const shippedOrdersCount = orders.filter((o) => o.status === 'shipped').length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrdersCount = orders.filter((o) => o.status === 'cancelled').length;

    const inStockCount = products.filter((p) => p.stock > p.minStockThreshold).length;
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockThreshold).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const totalWarehouseUnits = products.reduce((acc, p) => acc + p.stock, 0);

    const expiringSoonCount = expiryAlerts.filter((a) => a.status === 'critical' || a.status === 'warning').length;
    const expiredCount = expiryAlerts.filter((a) => a.status === 'expired').length;

    return {
      totalSales,
      totalOrdersCount: orders.length,
      pendingOrdersCount,
      shippedOrdersCount,
      deliveredOrdersCount,
      cancelledOrdersCount,
      totalProductsCount: products.length,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalWarehouseUnits,
      expiringSoonCount,
      expiredCount,
    };
  },

  // Real Top Products by Demand (from actual orders only)
  async getRealProductDemand(): Promise<RealProductDemand[]> {
    const orders = await this.getOrders();
    const products = await this.getProducts();
    const demandMap: Record<string, { orderedUnits: number; totalRevenue: number; ordersCount: number }> = {};

    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          if (!demandMap[item.productId]) {
            demandMap[item.productId] = {
              orderedUnits: 0,
              totalRevenue: 0,
              ordersCount: 0,
            };
          }
          demandMap[item.productId].orderedUnits += item.quantity;
          demandMap[item.productId].totalRevenue += item.quantity * item.price;
          demandMap[item.productId].ordersCount += 1;
        });
      });

    const result: RealProductDemand[] = [];
    for (const [productId, stats] of Object.entries(demandMap)) {
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        result.push({
          productId,
          name: prod.name,
          category: prod.category,
          orderedUnits: stats.orderedUnits,
          totalRevenue: stats.totalRevenue,
          ordersCount: stats.ordersCount,
        });
      }
    }

    return result.sort((a, b) => b.orderedUnits - a.orderedUnits);
  },

  // Backup & Portability
  exportDatabaseJSON(): string {
    const data = {
      products: loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
      orders: loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
      logs: loadFromStorage(STORAGE_KEYS.LOGS, INITIAL_LOGS),
      config: loadFromStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products && Array.isArray(parsed.products)) {
        saveToStorage(STORAGE_KEYS.PRODUCTS, parsed.products);
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        saveToStorage(STORAGE_KEYS.ORDERS, parsed.orders);
      }
      if (parsed.logs && Array.isArray(parsed.logs)) {
        saveToStorage(STORAGE_KEYS.LOGS, parsed.logs);
      }
      return true;
    } catch {
      return false;
    }
  },

  clearAllData(): void {
    saveToStorage(STORAGE_KEYS.PRODUCTS, []);
    saveToStorage(STORAGE_KEYS.ORDERS, []);
    saveToStorage(STORAGE_KEYS.LOGS, []);
  },
};
