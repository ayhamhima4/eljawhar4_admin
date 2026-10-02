import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Boxes,
  Clock,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  Truck,
  RotateCcw,
  ChefHat,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Product, Order, DashboardStats, RealProductDemand, OrderStatus } from '../types';
import { formatCurrency } from '../utils/currency';

interface OverviewViewProps {
  stats: DashboardStats;
  products: Product[];
  orders: Order[];
  realDemand: RealProductDemand[];
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onQuickAdjustPrice: (productId: string, delta: number) => void;
  onQuickAdjustStock: (productId: string, delta: number) => void;
  onDeleteProduct: (productId: string) => void;
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  products,
  orders,
  realDemand,
  onOpenAddProduct,
  onOpenEditProduct,
  onQuickAdjustPrice,
  onQuickAdjustStock,
  onDeleteProduct,
  onSelectOrder,
  onUpdateOrderStatus,
  onNavigateToTab,
}) => {
  // Show first 4 items for quick action list
  const quickProducts = products.slice(0, 4);
  // Show recent orders
  const recentOrders = orders.slice(0, 4);

  // Real payment method counts from actual orders
  const paymentMethodCounts = orders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* 1. Verified Live System Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b322a]"></span>
          <h2 className="text-sm sm:text-base font-bold text-[#43271a]">
            لوحة الإدارة والمتابعة الفعلية
          </h2>
          <span className="text-xs text-[#82746e] hidden sm:inline">
            (بيانات حقيقية مستمدة حصرياً من قاعدة البيانات وحركات الشراء الفعلية)
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#ede7e3] px-3 py-1 rounded-full text-xs text-[#50443f] font-medium">
          <RotateCcw className="w-3.5 h-3.5 text-[#82746e]" />
          <span>قاعدة بيانات نشطة</span>
        </div>
      </div>

      {/* 2. Real Verified KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real Total Confirmed Sales */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">إجمالي المبيعات المؤكدة</span>
            <div className="w-8 h-8 rounded-xl bg-[#cde9dc]/60 text-[#1b322a] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#43271a] tabular-nums">
                {formatCurrency(stats.totalSales)}
              </span>
            </div>
            <span className="text-[11px] text-[#82746e] font-medium mt-1 block">
              من {stats.totalOrdersCount - stats.cancelledOrdersCount} طلبات مؤكدة
            </span>
          </div>
        </div>

        {/* Card 2: Real Orders Count & Status */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">إجمالي طلبات الزبائن</span>
            <div className="w-8 h-8 rounded-xl bg-[#ffdbcc]/70 text-[#43271a] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#43271a] tabular-nums">
                {stats.totalOrdersCount}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">طلبات مسجلة</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#50443f] mt-1 font-medium">
              <span className="text-[#9e3d50] font-bold">
                {stats.pendingOrdersCount} قيد التجهيز
              </span>
              <span>·</span>
              <span className="text-[#1b322a]">
                {stats.deliveredOrdersCount} تم التسليم
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Real Warehouse Stock Units */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">المخزون الفعلي بالمستودع</span>
            <div className="w-8 h-8 rounded-xl bg-[#f3ede9] text-[#43271a] flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#43271a] tabular-nums">
                {stats.totalWarehouseUnits.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">وحدة متوفرة</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#50443f] mt-1 font-medium">
              <span>موزعة على {stats.totalProductsCount} صنف</span>
              {stats.lowStockCount > 0 && (
                <span className="text-[#ba1a1a] font-bold">({stats.lowStockCount} أوشكت)</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Real Expiry Alerts */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">مراقبة تواريخ الصلاحية</span>
            <div className="w-8 h-8 rounded-xl bg-[#ffd9dd]/60 text-[#9e3d50] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${
                  stats.expiringSoonCount > 0 ? 'text-[#ba1a1a]' : 'text-[#1b322a]'
                }`}
              >
                {stats.expiringSoonCount}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">مواد تقترب صلاحيتها</span>
            </div>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              {stats.expiredCount > 0
                ? `${stats.expiredCount} مادة منتهية تتطلب السحب`
                : 'يتم احتساب الأيام المتبقية يومياً'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Product & Inventory Action Center (CRUD with Instant Adjusters) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#43271a]">
              الإدارة السريعة للمنتجات والمخزون
            </h2>
            <p className="text-xs text-[#82746e] mt-0.5">
              تعديل الأسعار والكميات بنقرة واحدة سريعة مع تحديث المخزن فوراً
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('products')}
              className="text-xs text-[#43271a] font-semibold hover:underline hidden sm:inline"
            >
              عرض كافة الأصناف ({products.length})
            </button>
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#43271a] text-[#fef8f4] text-xs sm:text-sm font-medium shadow-sm hover:bg-[#5c3d2e] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف</span>
            </button>
          </div>
        </div>

        {/* Product Cards Stream or Empty State */}
        {quickProducts.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f8f2ef] flex items-center justify-center text-[#82746e]">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
              لا توجد منتجات مسجلة بالمخزن حالياً
            </h3>
            <p className="text-xs text-[#82746e] max-w-sm leading-relaxed">
              ابدأ بإدراج الأصناف الحقيقية لمستلزمات الحلويات وأدوات الخبز مع تحديد الأسعار والكميات وتواريخ الصلاحية.
            </p>
            <button
              onClick={onOpenAddProduct}
              className="mt-1 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#43271a] text-white text-xs font-semibold hover:bg-[#5c3d2e] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول صنف للمتجر</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {quickProducts.map((item) => {
              const isLowStock = item.stock <= item.minStockThreshold;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between gap-3 hover:border-[#d4c3bc] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-[#f3ede9] shrink-0 border border-[#e7e1de]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-[#43271a] truncate" title={item.name}>
                          {item.name}
                        </h3>
                        {item.stock === 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold shrink-0">
                            نفذ المخزون
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ffd9dd] text-[#9e3d50] text-[10px] font-bold shrink-0">
                            أوشكت
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#cde9dc] text-[#1b322a] text-[10px] font-semibold shrink-0">
                            متوفر
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[#82746e]">السعر:</span>
                          <span className="text-sm font-bold text-[#43271a] tabular-nums">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[#d4c3bc]"></span>
                        <div className="flex items-center gap-1 text-[#50443f]">
                          <span>المخزون:</span>
                          <span
                            className={`font-bold tabular-nums ${
                              isLowStock ? 'text-[#ba1a1a]' : 'text-[#43271a]'
                            }`}
                          >
                            {item.stock}
                          </span>
                          <span className="text-[10px] text-[#82746e]">{item.unit}</span>
                        </div>
                      </div>

                      {item.isFoodItem && item.expiryDate && (
                        <div className="flex items-center gap-1 text-[11px] mt-1 text-[#9e3d50]">
                          <Clock className="w-3 h-3" />
                          <span>انتهاء الصلاحية: {item.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick actions controls row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#f3ede9] bg-[#fdfbf9] px-3 py-1.5 rounded-2xl">
                    {/* Quick price adjusters */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onQuickAdjustPrice(item.id, 5)}
                        className="w-7 h-7 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc] transition-colors"
                        title="زيادة السعر 5 د.ج"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickAdjustPrice(item.id, -5)}
                        className="w-7 h-7 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc] transition-colors"
                        title="تخفيض السعر 5 د.ج"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] text-[#82746e] mr-1 hidden sm:inline">
                        تعديل السعر
                      </span>
                    </div>

                    {/* Stock adjuster and modal buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onQuickAdjustStock(item.id, 1)}
                        className="px-2 py-0.5 rounded-lg bg-[#cde9dc]/50 text-[#1b322a] text-[11px] font-bold hover:bg-[#cde9dc]"
                        title="زيادة المخزون +1"
                      >
                        +1 مخزون
                      </button>
                      <button
                        onClick={() => onOpenEditProduct(item)}
                        className="px-2.5 py-1 rounded-full bg-[#f3ede9] text-[#43271a] text-xs font-semibold hover:bg-[#ffd9dd] transition-colors"
                      >
                        تعديل كامل
                      </button>
                      <button
                        onClick={() => onDeleteProduct(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Real-Time Orders Stream */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#43271a]">تدفق الطلبات المباشرة</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffd9dd] text-[#9e3d50] text-xs font-bold tabular-nums">
              {stats.pendingOrdersCount} طلبات قيد التجهيز
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs text-[#43271a] font-semibold hover:underline"
          >
            عرض سجل كافة الطلبات ({orders.length})
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#f8f2ef] flex items-center justify-center text-[#82746e]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
              لا توجد طلبات واردة من المتجر حتى الآن
            </h3>
            <p className="text-xs text-[#82746e] max-w-sm leading-relaxed">
              ستظهر هنا طلبات الزبائن وتفاصيل الفواتير والمنتجات المطلوبة تلقائياً فور قيام العملاء بإتمام الشراء الفعلي.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => {
              const isProcessing = order.status === 'processing';
              const isShipped = order.status === 'shipped';
              const isDelivered = order.status === 'delivered';

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-4 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-2 hover:border-[#43271a] cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#43271a]" />
                      <span className="text-sm font-bold text-[#43271a]">الطلب #{order.id}</span>
                    </div>

                    {/* Status Badge */}
                    {isProcessing && (
                      <span className="px-2.5 py-1 rounded-full bg-[#ffdbcc] text-[#43271a] text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#43271a] animate-ping" />
                        قيد التجهيز
                      </span>
                    )}
                    {isShipped && (
                      <span className="px-2.5 py-1 rounded-full bg-[#e7e1de] text-[#43271a] text-xs font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#5c3d2e]" />
                        تم الشحن
                      </span>
                    )}
                    {isDelivered && (
                      <span className="px-2.5 py-1 rounded-full bg-[#cde9dc] text-[#1b322a] text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1b322a]" />
                        مكتمل وتم التسليم
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#50443f]">
                    <span className="font-semibold text-[#1d1b19]">{order.customerName}</span>
                    <span className="text-[#82746e]">
                      {new Date(order.createdAt).toLocaleTimeString('ar-DZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#50443f] bg-[#f8f2ef] p-2.5 rounded-xl border border-[#e7e1de]/50">
                    المستلزمات: <span className="text-[#1d1b19] font-medium">{order.itemsSummary}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#82746e]">إجمالي الفاتورة:</span>
                    <span className="text-base font-bold text-[#43271a] tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Real Data Widgets: Real Top Demand from actual orders + Real Payment breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget 1: Real Product Demand from Actual Orders */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#cde9dc]/60 flex items-center justify-center text-[#1b322a]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
                الأصناف الأكثر طلباً من الزبائن فعلياً
              </h3>
            </div>
            <span className="text-xs text-[#82746e]">محسوب من المبيعات</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {realDemand.length === 0 ? (
              <p className="text-xs text-[#82746e] p-5 bg-[#f8f2ef] rounded-2xl text-center">
                لا توجد مبيعات فعلية مسجلة بعد لحساب حجم الطلب
              </p>
            ) : (
              realDemand.slice(0, 4).map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#f8f2ef] border border-[#e7e1de]/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#43271a] text-[#ffdbcc] text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-[#1d1b19] truncate">{item.name}</span>
                      <span className="text-[10px] text-[#82746e]">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xs font-bold text-[#1b322a] tabular-nums block">
                      {item.orderedUnits} وحدة مطلوبة
                    </span>
                    <span className="text-[10px] text-[#82746e] tabular-nums">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Real Payment & Order Methods */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffdbcc]/70 flex items-center justify-center text-[#43271a]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
                طرق الدفع المستخدمة في الطلبات
              </h3>
            </div>
            <span className="text-xs text-[#82746e]">عمليات حقيقية</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {orders.length === 0 ? (
              <p className="text-xs text-[#82746e] p-5 bg-[#f8f2ef] rounded-2xl text-center">
                لا توجد عمليات دفع مسجلة حتى الآن
              </p>
            ) : (
              Object.entries(paymentMethodCounts).map(([method, count]) => {
                const percentage = Math.round((count / orders.length) * 100) || 0;
                return (
                  <div key={method} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#f8f2ef]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#1d1b19]">{method}</span>
                      <span className="font-bold text-[#43271a] tabular-nums">
                        {count} طلبات ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#43271a]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
