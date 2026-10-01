import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DesktopSidebar, MobileBottomNav, ActiveTab } from './components/Navigation';
import { Toast, ToastData } from './components/Toast';
import { EditProductModal } from './components/modals/EditProductModal';
import { RestockModal } from './components/modals/RestockModal';
import { OrderDetailsModal } from './components/modals/OrderDetailsModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';

import { OverviewView } from './views/OverviewView';
import { ProductsView } from './views/ProductsView';
import { OrdersView } from './views/OrdersView';
import { InventoryView } from './views/InventoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { ApiSettingsView } from './views/ApiSettingsView';

import { BakeryAdminApi } from './services/api';
import { Product, Order, DashboardStats, ExpiryAlert, InventoryLog, RealProductDemand, OrderStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Application Data States (100% Real Database Derived)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrdersCount: 0,
    pendingOrdersCount: 0,
    shippedOrdersCount: 0,
    deliveredOrdersCount: 0,
    cancelledOrdersCount: 0,
    totalProductsCount: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalWarehouseUnits: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
  });
  const [realDemand, setRealDemand] = useState<RealProductDemand[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      message,
      type,
    });
  }, []);

  // Fetch all live data from real service
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [prods, ords, alerts, logs, st, demand] = await Promise.all([
        BakeryAdminApi.getProducts(),
        BakeryAdminApi.getOrders(),
        BakeryAdminApi.getExpiryAlerts(),
        BakeryAdminApi.getInventoryLogs(),
        BakeryAdminApi.getDashboardStats(),
        BakeryAdminApi.getRealProductDemand(),
      ]);

      setProducts(prods);
      setOrders(ords);
      setExpiryAlerts(alerts);
      setInventoryLogs(logs);
      setStats(st);
      setRealDemand(demand);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('حدث خطأ أثناء تحميل البيانات', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick adjust price (+/-)
  const handleQuickAdjustPrice = async (productId: string, delta: number) => {
    try {
      const updated = await BakeryAdminApi.quickAdjustPrice(productId, delta);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`تم تحديث سعر "${updated.name}" إلى ${updated.price} ر.س`);
    } catch {
      showToast('تعذر تعديل السعر', 'error');
    }
  };

  // Quick adjust stock (+/-)
  const handleQuickAdjustStock = async (productId: string, delta: number) => {
    try {
      const updated = await BakeryAdminApi.quickAdjustStock(productId, delta);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`تم تعديل مخزون "${updated.name}" إلى ${updated.stock} ${updated.unit}`);
      loadData();
    } catch {
      showToast('تعذر تعديل المخزون', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (window.confirm(`هل أنت متأكد من حذف المنتج: "${product.name}" من المتجر؟`)) {
      try {
        await BakeryAdminApi.deleteProduct(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast('تم حذف المنتج بنجاح من قاعدة البيانات');
        loadData();
      } catch {
        showToast('تعذر حذف المنتج', 'error');
      }
    }
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        // Update existing
        const updated = await BakeryAdminApi.updateProduct(editingProduct.id, productData);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast('تم حفظ تعديلات المنتج وتاريخ الصلاحية بنجاح');
      } else {
        // Add new
        const created = await BakeryAdminApi.addProduct(productData as any);
        setProducts((prev) => [created, ...prev]);
        showToast('تم إدراج الصنف الجديد في متجر الحلويات بنجاح');
      }
      loadData();
    } catch {
      showToast('فشل حفظ بيانات المنتج', 'error');
    }
  };

  // Restock product
  const handleRestock = async (
    productId: string,
    quantity: number,
    batchNumber?: string,
    newExpiryDate?: string
  ) => {
    try {
      const updated = await BakeryAdminApi.restockProduct(
        productId,
        quantity,
        batchNumber,
        newExpiryDate
      );
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`تمت إضافة ${quantity} ${updated.unit} إلى مخزون "${updated.name}"`);
      loadData();
    } catch {
      showToast('تعذر إعادة تزويد المخزون', 'error');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await BakeryAdminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }

      const statusArabic =
        newStatus === 'processing'
          ? 'قيد التجهيز'
          : newStatus === 'shipped'
          ? 'تم الشحن'
          : newStatus === 'delivered'
          ? 'مكتمل وتم التسليم'
          : 'ملغي';

      showToast(`تم تحديث حالة الطلب #${orderId} إلى (${statusArabic})`);
      loadData();
    } catch {
      showToast('فشل تحديث حالة الطلب', 'error');
    }
  };

  // Real Counts for navigation badges
  const pendingOrdersCount = stats.pendingOrdersCount;
  const expiringItemsCount = stats.expiringSoonCount + stats.expiredCount;

  return (
    <div className="min-h-screen bg-[#fef8f4] text-[#1d1b19] flex flex-col font-['Readex_Pro',sans-serif]" dir="rtl">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <Header
        onOpenAddProduct={() => {
          setEditingProduct(null);
          setIsAddEditModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        expiryAlerts={expiryAlerts}
        unreadAlertsCount={expiringItemsCount + pendingOrdersCount}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main Body Layout (Sidebar + Content Viewport) */}
      <div className="flex-1 flex pt-16 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingOrdersCount={pendingOrdersCount}
          expiringItemsCount={expiringItemsCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-5xl">
          {activeTab === 'overview' && (
            <OverviewView
              stats={stats}
              products={products}
              orders={orders}
              realDemand={realDemand}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setIsAddEditModalOpen(true);
              }}
              onOpenEditProduct={(prod) => {
                setEditingProduct(prod);
                setIsAddEditModalOpen(true);
              }}
              onQuickAdjustPrice={handleQuickAdjustPrice}
              onQuickAdjustStock={handleQuickAdjustStock}
              onDeleteProduct={handleDeleteProduct}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setIsAddEditModalOpen(true);
              }}
              onOpenEditProduct={(prod) => {
                setEditingProduct(prod);
                setIsAddEditModalOpen(true);
              }}
              onOpenRestock={(prod) => setRestockProduct(prod)}
              onQuickAdjustPrice={handleQuickAdjustPrice}
              onQuickAdjustStock={handleQuickAdjustStock}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              expiryAlerts={expiryAlerts}
              inventoryLogs={inventoryLogs}
              onOpenRestock={(prod) => setRestockProduct(prod)}
              onOpenEditProduct={(prod) => {
                setEditingProduct(prod);
                setIsAddEditModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              stats={stats}
              products={products}
              orders={orders}
              realDemand={realDemand}
            />
          )}

          {activeTab === 'api_settings' && (
            <ApiSettingsView
              onTriggerToast={showToast}
              onRefreshData={loadData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        expiringItemsCount={expiringItemsCount}
      />

      {/* Modals & Drawers */}
      <EditProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <RestockModal
        isOpen={Boolean(restockProduct)}
        onClose={() => setRestockProduct(null)}
        product={restockProduct}
        onRestock={handleRestock}
      />

      <OrderDetailsModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        expiryAlerts={expiryAlerts}
        pendingOrders={orders.filter((o) => o.status === 'processing')}
        onSelectOrder={(ord) => {
          setSelectedOrder(ord);
          setIsNotificationsOpen(false);
        }}
        onSelectExpiryProduct={(productId) => {
          const found = products.find((p) => p.id === productId);
          if (found) {
            setEditingProduct(found);
            setIsAddEditModalOpen(true);
          }
        }}
      />
    </div>
  );
}
