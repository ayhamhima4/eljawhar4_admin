import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Boxes,
  PieChart,
  BarChart3,
  Calendar,
  ChefHat,
  TrendingUp,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { DashboardStats, RealProductDemand, Product, Order } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats;
  products: Product[];
  orders: Order[];
  realDemand: RealProductDemand[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  products,
  orders,
  realDemand,
}) => {
  const confirmedOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalSales = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const averageOrderValue = confirmedOrders.length > 0 ? Math.round(totalSales / confirmedOrders.length) : 0;

  // Real delivery fulfillment rate
  const fulfillmentRate =
    orders.length > 0 ? Math.round((stats.deliveredOrdersCount / orders.length) * 100) : 0;

  // Real Sales by Category computed directly from actual orders
  const categorySalesMap: Record<string, { units: number; revenue: number }> = {};
  confirmedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const category = prod ? prod.category : 'مستلزمات عامة';
      if (!categorySalesMap[category]) {
        categorySalesMap[category] = { units: 0, revenue: 0 };
      }
      categorySalesMap[category].units += item.quantity;
      categorySalesMap[category].revenue += item.quantity * item.price;
    });
  });

  const totalUnitsSold = Object.values(categorySalesMap).reduce((sum, c) => sum + c.units, 0) || 1;

  // Real Customer Segments breakdown from actual orders
  const customerSegmentMap: Record<string, { ordersCount: number; totalRevenue: number }> = {};
  confirmedOrders.forEach((order) => {
    const type = order.customerType || 'عميل تجزئة';
    if (!customerSegmentMap[type]) {
      customerSegmentMap[type] = { ordersCount: 0, totalRevenue: 0 };
    }
    customerSegmentMap[type].ordersCount += 1;
    customerSegmentMap[type].totalRevenue += order.totalAmount;
  });

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#43271a]">تحليلات الأداء والمبيعات الفعلية</h2>
          <p className="text-xs text-[#82746e]">
            إحصائيات موثقة ومحسوبة مباشرة من حركة طلبات وقاعدة بيانات المتجر
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#e7e1de] px-3.5 py-1.5 rounded-2xl text-xs text-[#50443f]">
          <Calendar className="w-4 h-4 text-[#82746e]" />
          <span>السجل التراكمي المباشر</span>
        </div>
      </div>

      {/* Real Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Real Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">صافي المبيعات المحققة</span>
            <div className="w-8 h-8 rounded-xl bg-[#cde9dc]/60 text-[#1b322a] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#43271a] tabular-nums">
                {totalSales.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">ر.س</span>
            </div>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              من {confirmedOrders.length} طلبات مؤكدة
            </span>
          </div>
        </div>

        {/* Metric 2: Real AOV */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">متوسط قيمة السلة (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-[#ffdbcc]/70 text-[#43271a] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#43271a] tabular-nums">
                {averageOrderValue}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">ر.س / طلب</span>
            </div>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              معدل إنفاق العميل في كل فاتورة
            </span>
          </div>
        </div>

        {/* Metric 3: Real Catalog Size */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">إجمالي أصناف الكتالوج</span>
            <div className="w-8 h-8 rounded-xl bg-[#f3ede9] text-[#43271a] flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#43271a] tabular-nums">
                {products.length}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">أصناف مسجلة</span>
            </div>
            <span className="text-[11px] text-[#1b322a] mt-1 block font-medium">
              {stats.inStockCount} صنف متوفر بمخزون وافر
            </span>
          </div>
        </div>

        {/* Metric 4: Real Fulfillment Rate */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">نسبة إنجاز وتسليم الطلبات</span>
            <div className="w-8 h-8 rounded-xl bg-[#cde9dc]/60 text-[#1b322a] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#43271a] tabular-nums">
                {fulfillmentRate}%
              </span>
            </div>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              {stats.deliveredOrdersCount} من أصل {orders.length} تم تسليمها بنجاح
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section (All calculated dynamically) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Real Sales */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#f3ede9] pb-3">
            <h3 className="text-sm sm:text-base font-bold text-[#43271a] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#9e3d50]" />
              <span>مبيعات أقسام الحلويات من واقع الطلبات الفعلية</span>
            </h3>
            <span className="text-xs text-[#82746e]">حجم المبيعات</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {Object.keys(categorySalesMap).length === 0 ? (
              <p className="text-xs text-[#82746e] p-4 text-center bg-[#f8f2ef] rounded-2xl">
                بانتظار تسجيل أولى مبيعات الأقسام
              </p>
            ) : (
              Object.entries(categorySalesMap).map(([catName, data]) => {
                const percentage = Math.round((data.units / totalUnitsSold) * 100);
                return (
                  <div key={catName} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#1d1b19] font-medium">{catName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#43271a] tabular-nums">
                          {data.revenue} ر.س
                        </span>
                        <span className="text-[#82746e]">
                          ({data.units} وحدة · {percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f3ede9] overflow-hidden">
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

        {/* Real Customer Demographics & Segment Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#f3ede9] pb-3">
            <h3 className="text-sm sm:text-base font-bold text-[#43271a] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9e3d50]" />
              <span>توزيع المبيعات بحسب نوع الزبائن</span>
            </h3>
            <span className="text-xs text-[#82746e]">فئات المشترين</span>
          </div>

          <div className="flex flex-col gap-3">
            {Object.keys(customerSegmentMap).length === 0 ? (
              <p className="text-xs text-[#82746e] p-4 text-center bg-[#f8f2ef] rounded-2xl">
                لا توجد طلبات زبائن مسجلة حتى الآن
              </p>
            ) : (
              Object.entries(customerSegmentMap).map(([segment, data]) => (
                <div
                  key={segment}
                  className="p-3.5 rounded-2xl bg-[#f8f2ef] border border-[#e7e1de]/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#43271a]">
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#1d1b19] block">{segment}</span>
                      <span className="text-[11px] text-[#82746e]">{data.ordersCount} طلبات مسجلة</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-[#1b322a] text-sm tabular-nums block">
                      {data.totalRevenue} ر.س
                    </span>
                    <span className="text-[10px] text-[#82746e]">إجمالي المشتريات</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real Top Demanded Products Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#f3ede9] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1b322a]" />
            <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
              جدول الأصناف الأكثر طلباً ومبيعاً بالكامل
            </h3>
          </div>
          <span className="text-xs text-[#82746e]">محسوب من السلات الفعلية</span>
        </div>

        {realDemand.length === 0 ? (
          <p className="text-xs text-[#82746e] p-6 text-center bg-[#f8f2ef] rounded-2xl">
            لا توجد طلبات مسجلة بعد لعرض جدول الأصناف الأكثر طلباً ومبيعاً
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#f8f2ef] border-b border-[#e7e1de] text-[#50443f]">
                  <th className="py-3 px-4 font-semibold">#</th>
                  <th className="py-3 px-4 font-semibold">الصنف</th>
                  <th className="py-3 px-4 font-semibold">القسم</th>
                  <th className="py-3 px-4 font-semibold">الكمية المطلوبة</th>
                  <th className="py-3 px-4 font-semibold">عدد الطلبات</th>
                  <th className="py-3 px-4 font-semibold">إجمالي الدخل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3ede9]">
                {realDemand.map((item, index) => (
                  <tr key={item.productId} className="hover:bg-[#fdfbf9]">
                    <td className="py-3 px-4 font-bold text-[#82746e]">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-[#1d1b19]">{item.name}</td>
                    <td className="py-3 px-4 text-[#50443f]">{item.category}</td>
                    <td className="py-3 px-4 font-bold text-[#1b322a] tabular-nums">
                      {item.orderedUnits} وحدة
                    </td>
                    <td className="py-3 px-4 text-[#50443f] tabular-nums">{item.ordersCount} طلب</td>
                    <td className="py-3 px-4 font-bold text-[#43271a] tabular-nums">
                      {item.totalRevenue} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
