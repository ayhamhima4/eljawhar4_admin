import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  ClipboardList,
  Coins,
  Package,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { Order, Product } from '../types';
import { formatCurrency } from '../utils/currency';

type ReportPeriod = 'today' | 'yesterday' | 'month' | 'custom';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
  onSelectOrder: (order: Order) => void;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getPeriodBounds(period: ReportPeriod, month: string, from: string, to: string) {
  const today = new Date();
  const todayKey = dateKey(today);

  if (period === 'today') return { start: todayKey, end: todayKey };
  if (period === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const key = dateKey(yesterday);
    return { start: key, end: key };
  }
  if (period === 'custom') return { start: from, end: to };

  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return { start: '', end: '' };
  const start = `${year}-${String(monthNumber).padStart(2, '0')}-01`;
  const monthEnd = dateKey(new Date(year, monthNumber, 0));
  return { start, end: month === todayKey.slice(0, 7) && todayKey < monthEnd ? todayKey : monthEnd };
}

function listDateKeys(start: string, end: string): string[] {
  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  const current = parseDateKey(start);
  const last = parseDateKey(end);
  while (current <= last) {
    dates.push(dateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDate(value: string): string {
  return parseDateKey(value).toLocaleDateString('ar-DZ', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, products, onSelectOrder }) => {
  const now = new Date();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [month, setMonth] = useState(dateKey(now).slice(0, 7));
  const [from, setFrom] = useState(dateKey(now));
  const [to, setTo] = useState(dateKey(now));

  const bounds = getPeriodBounds(period, month, from, to);
  const dates = useMemo(() => listDateKeys(bounds.start, bounds.end), [bounds.start, bounds.end]);
  const reportOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (order.status !== 'delivered' || !order.deliveredAt) return false;
        const deliveredDate = dateKey(new Date(order.deliveredAt));
        return deliveredDate >= bounds.start && deliveredDate <= bounds.end;
      }),
    [orders, bounds.start, bounds.end]
  );

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const reportTotal = reportOrders.reduce(
    (sum, order) => sum + order.totalAmount + order.shippingFee,
    0
  );
  const productsSold = reportOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const dailyRows = dates.map((date) => {
    const dailyOrders = reportOrders.filter((order) => dateKey(new Date(order.deliveredAt!)) === date);
    const dailyProducts = dailyOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const dailyRevenue = dailyOrders.reduce(
      (sum, order) => sum + order.totalAmount + order.shippingFee,
      0
    );
    return { date, orders: dailyOrders.length, products: dailyProducts, revenue: dailyRevenue };
  });

  const soldProducts = useMemo(() => {
    const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
    reportOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = totals.get(item.productId) ?? {
          name: productMap.get(item.productId)?.name ?? item.productName,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.quantity * item.price;
        totals.set(item.productId, current);
      });
    });
    return [...totals.entries()]
      .map(([id, total]) => ({ id, ...total }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [reportOrders, productMap]);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-l from-[#43271a] to-[#684936] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-[#ffdbcc]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">التقارير والإحصائيات المتقدمة</h2>
            <p className="mt-1 text-xs leading-6 text-white/75">
              تقرير يومي للمبالغ التي تم استلامها فعلياً بعد تسليم الطلبات.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/10 p-2.5">
          <CalendarDays className="h-4 w-4 text-[#ffdbcc]" />
          <label htmlFor="reports-period" className="sr-only">الفترة الزمنية</label>
          <select
            id="reports-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as ReportPeriod)}
            className="rounded-lg border border-white/20 bg-[#5c3d2e] px-2.5 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-[#ffdbcc]"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">اليوم السابق</option>
            <option value="month">شهر محدد</option>
            <option value="custom">نطاق مخصص</option>
          </select>
          {period === 'month' && (
            <input
              aria-label="الشهر المحدد"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="rounded-lg border border-white/20 bg-white px-2 py-2 text-xs text-[#43271a]"
            />
          )}
          {period === 'custom' && (
            <>
              <label className="flex items-center gap-1.5 text-xs text-white/80">
                من
                <input
                  aria-label="من تاريخ"
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(event) => setFrom(event.target.value)}
                  className="rounded-lg border border-white/20 bg-white px-2 py-2 text-xs text-[#43271a]"
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-white/80">
                إلى
                <input
                  aria-label="إلى تاريخ"
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(event) => setTo(event.target.value)}
                  className="rounded-lg border border-white/20 bg-white px-2 py-2 text-xs text-[#43271a]"
                />
              </label>
            </>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#e7e1de] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold">صافي المقبوضات للفترة</span>
            <Coins className="h-5 w-5 text-[#1b322a]" />
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#1b322a]">{formatCurrency(reportTotal)}</p>
          <p className="mt-1 text-[11px] text-[#82746e]">يشمل الطلبات المسلّمة فقط</p>
        </div>
        <div className="rounded-3xl border border-[#e7e1de] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold">الطلبات المستلمة</span>
            <ShoppingBag className="h-5 w-5 text-[#43271a]" />
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#43271a]">{reportOrders.length}</p>
          <p className="mt-1 text-[11px] text-[#82746e]">طلب ضمن الفترة المحددة</p>
        </div>
        <div className="rounded-3xl border border-[#e7e1de] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#82746e]">
            <span className="font-semibold">إجمالي المنتجات المسلّمة</span>
            <Package className="h-5 w-5 text-[#9e3d50]" />
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#43271a]">{productsSold}</p>
          <p className="mt-1 text-[11px] text-[#82746e]">وحدة ضمن الطلبات المستلمة</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#e7e1de] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#f3ede9] px-5 py-4">
          <CalendarDays className="h-4 w-4 text-[#9e3d50]" />
          <h3 className="text-sm font-bold text-[#43271a]">ملخص المبيعات يومًا بيوم</h3>
          <span className="mr-auto text-[11px] text-[#82746e]">
            {bounds.start && bounds.end ? `${formatDate(bounds.start)} — ${formatDate(bounds.end)}` : 'اختر فترة صالحة'}
          </span>
        </div>
        {dates.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#82746e]">تاريخ البداية يجب أن يسبق تاريخ النهاية.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-right text-xs">
              <thead className="bg-[#f8f2ef] text-[#50443f]">
                <tr>
                  <th className="px-5 py-3 font-semibold">التاريخ</th>
                  <th className="px-5 py-3 font-semibold">الطلبات المستلمة</th>
                  <th className="px-5 py-3 font-semibold">المنتجات المسلّمة</th>
                  <th className="px-5 py-3 font-semibold">الدخل المقبوض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3ede9]">
                {dailyRows.slice().reverse().map((row) => (
                  <tr key={row.date} className="hover:bg-[#fdfbf9]">
                    <td className="px-5 py-3 font-medium text-[#43271a]">{formatDate(row.date)}</td>
                    <td className="px-5 py-3 tabular-nums text-[#50443f]">{row.orders}</td>
                    <td className="px-5 py-3 tabular-nums text-[#50443f]">{row.products}</td>
                    <td className="px-5 py-3 font-bold tabular-nums text-[#1b322a]">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-[#e7e1de] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#f3ede9] px-5 py-4">
            <ClipboardList className="h-4 w-4 text-[#9e3d50]" />
            <h3 className="text-sm font-bold text-[#43271a]">الطلبات الداخلة في التقرير</h3>
          </div>
          {reportOrders.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#82746e]">لا توجد طلبات مستلمة خلال الفترة.</p>
          ) : (
            <div className="max-h-[440px] divide-y divide-[#f3ede9] overflow-y-auto">
              {reportOrders
                .slice()
                .sort((a, b) => b.deliveredAt!.localeCompare(a.deliveredAt!))
                .map((order) => (
                  <button
                    key={order.databaseId ?? order.id}
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="flex w-full items-start justify-between gap-3 px-5 py-4 text-right transition-colors hover:bg-[#fdfbf9]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-[#43271a]">
                        الطلب #{order.id} · {order.customerName}
                      </span>
                      <span className="mt-1 block text-[11px] text-[#82746e]">
                        {new Date(order.deliveredAt!).toLocaleString('ar-DZ')} · {order.itemsSummary}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-[#1b322a]">
                      {formatCurrency(order.totalAmount + order.shippingFee)}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#e7e1de] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#f3ede9] px-5 py-4">
            <Package className="h-4 w-4 text-[#9e3d50]" />
            <h3 className="text-sm font-bold text-[#43271a]">المنتجات المباعة خلال الفترة</h3>
          </div>
          {soldProducts.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#82746e]">لا توجد منتجات ضمن طلبات مستلمة في هذه الفترة.</p>
          ) : (
            <div className="max-h-[440px] divide-y divide-[#f3ede9] overflow-y-auto">
              {soldProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <span className="min-w-0 truncate text-xs font-semibold text-[#43271a]">{product.name}</span>
                  <span className="shrink-0 text-left text-xs text-[#50443f]">
                    {product.quantity} وحدة
                    <strong className="mr-3 text-[#1b322a]">{formatCurrency(product.revenue)}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="text-[11px] leading-5 text-[#82746e]">
        يشمل التقرير الطلبات التي تم تأكيد تسليمها فقط، ويستخدم تاريخ التسليم المسجل. الطلبات المعلقة أو المشحونة التي لم تصل للزبون مستبعدة من جميع المجاميع المالية.
      </p>
    </div>
  );
};
