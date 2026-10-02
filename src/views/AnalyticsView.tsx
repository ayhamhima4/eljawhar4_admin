import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Boxes,
  PieChart,
  Calendar,
  ChefHat,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';
import { DashboardStats, Product, Order, RealProductDemand } from '../types';
import { formatCurrency } from '../utils/currency';

type DateFilter = 'today' | 'yesterday' | 'month' | 'custom';

function localDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localMonthKey(date: Date): string {
  return localDateKey(date).slice(0, 7);
}

interface AnalyticsViewProps {
  stats: DashboardStats;
  products: Product[];
  orders: Order[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  products,
  orders,
}) => {
  const today = new Date();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedMonth, setSelectedMonth] = useState(localMonthKey(today));
  const [fromDate, setFromDate] = useState(localDateKey(today));
  const [toDate, setToDate] = useState(localDateKey(today));
  const selectedOrders = orders.filter((order) => {
    if (order.status === 'processing' || order.status === 'cancelled' || !order.shippedAt) return false;
    const shippedDate = localDateKey(order.shippedAt);
    if (!shippedDate) return false;
    if (dateFilter === 'today') return shippedDate === localDateKey(new Date());
    if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return shippedDate === localDateKey(yesterday);
    }
    if (dateFilter === 'month') return shippedDate.startsWith(selectedMonth);
    return (!fromDate || shippedDate >= fromDate) && (!toDate || shippedDate <= toDate);
  });
  const receivedOrders = orders.filter((order) => {
    if (order.status !== 'delivered' || !order.deliveredAt) return false;
    const deliveredDate = localDateKey(order.deliveredAt);
    if (!deliveredDate) return false;
    if (dateFilter === 'today') return deliveredDate === localDateKey(new Date());
    if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return deliveredDate === localDateKey(yesterday);
    }
    if (dateFilter === 'month') return deliveredDate.startsWith(selectedMonth);
    return (!fromDate || deliveredDate >= fromDate) && (!toDate || deliveredDate <= toDate);
  });
  const pendingOrders = orders.filter(
    (order) => order.status === 'processing' || order.status === 'shipped'
  );
  const shippedSales = selectedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const receivedAmount = receivedOrders.reduce(
    (sum, order) => sum + order.totalAmount + order.shippingFee,
    0
  );
  const pendingAmount = pendingOrders.reduce(
    (sum, order) => sum + order.totalAmount + order.shippingFee,
    0
  );
  const averageOrderValue =
    selectedOrders.length > 0 ? Math.round(shippedSales / selectedOrders.length) : 0;
  const deliveredFromSelection = selectedOrders.filter((order) => order.status === 'delivered').length;
  const fulfillmentRate =
    selectedOrders.length > 0
      ? Math.round((deliveredFromSelection / selectedOrders.length) * 100)
      : 0;

  const categorySalesMap: Record<string, { units: number; revenue: number }> = {};
  selectedOrders.forEach((order) => {
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

  const customerSegmentMap: Record<string, { ordersCount: number; totalRevenue: number }> = {};
  selectedOrders.forEach((order) => {
    const type = order.customerType || 'عميل تجزئة';
    if (!customerSegmentMap[type]) {
      customerSegmentMap[type] = { ordersCount: 0, totalRevenue: 0 };
    }
    customerSegmentMap[type].ordersCount += 1;
    customerSegmentMap[type].totalRevenue += order.totalAmount;
  });

  const demandMap = new Map<string, RealProductDemand>();
  selectedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      const existing = demandMap.get(item.productId) ?? {
        productId: item.productId,
        name: product?.name ?? item.productName,
        category: product?.category ?? 'مستلزمات عامة',
        orderedUnits: 0,
        totalRevenue: 0,
        ordersCount: 0,
      };
      existing.orderedUnits += item.quantity;
      existing.totalRevenue += item.quantity * item.price;
      existing.ordersCount += 1;
      demandMap.set(item.productId, existing);
    });
  });
  const realDemand = [...demandMap.values()].sort((a, b) => b.orderedUnits - a.orderedUnits);

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
        <div className="flex flex-wrap items-center gap-2 bg-white border border-[#e7e1de] p-2.5 rounded-2xl text-xs text-[#50443f]">
          <Calendar className="w-4 h-4 text-[#82746e]" />
          <label htmlFor="analytics-date-filter" className="sr-only">الفترة الزمنية</label>
          <select
            id="analytics-date-filter"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            className="rounded-lg border border-[#e7e1de] bg-white px-2 py-1.5"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">اليوم السابق</option>
            <option value="month">شهر محدد</option>
            <option value="custom">نطاق مخصص</option>
          </select>
          {dateFilter === 'month' ? (
            <input
              aria-label="الشهر المحدد"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-lg border border-[#e7e1de] px-2 py-1.5"
            />
          ) : dateFilter === 'custom' ? (
            <>
              <label className="flex items-center gap-1">
                من
                <input
                  aria-label="من تاريخ"
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="rounded-lg border border-[#e7e1de] px-2 py-1.5"
                />
              </label>
              <label className="flex items-center gap-1">
                إلى
                <input
                  aria-label="إلى تاريخ"
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  className="rounded-lg border border-[#e7e1de] px-2 py-1.5"
                />
              </label>
            </>
          ) : null}
        </div>
      </div>

      {/* Real Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Real Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">مبيعات الطلبات المشحونة</span>
            <div className="w-8 h-8 rounded-xl bg-[#cde9dc]/60 text-[#1b322a] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#43271a] tabular-nums">
                {formatCurrency(shippedSales)}
              </span>
            </div>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              من {selectedOrders.length} طلبات شُحنت خلال الفترة
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">الأموال المقبوضة خلال الفترة</span>
            <div className="w-8 h-8 rounded-xl bg-[#cde9dc]/60 text-[#1b322a] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-[#1b322a] tabular-nums">
              {formatCurrency(receivedAmount)}
            </span>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              من {receivedOrders.length} طلب تم تأكيد استلامه
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold text-[#50443f]">أموال معلقة حتى التسليم</span>
            <div className="w-8 h-8 rounded-xl bg-[#ffdbcc]/70 text-[#43271a] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-[#9e3d50] tabular-nums">
              {formatCurrency(pendingAmount)}
            </span>
            <span className="text-[11px] text-[#82746e] mt-1 block">
              من {pendingOrders.length} طلب نشط، عبر جميع الفترات
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
                {formatCurrency(averageOrderValue)}
              </span>
              <span className="text-xs font-semibold text-[#82746e]">/ طلب</span>
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
              {deliveredFromSelection} من أصل {selectedOrders.length} تم تسليمها بنجاح
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
                          {formatCurrency(data.revenue)}
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
                      {formatCurrency(data.totalRevenue)}
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
                      {formatCurrency(item.totalRevenue)}
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
