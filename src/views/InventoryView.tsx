import React, { useState } from 'react';
import {
  Boxes,
  Clock,
  AlertTriangle,
  PlusCircle,
  History,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { Product, ExpiryAlert, InventoryLog } from '../types';

interface InventoryViewProps {
  products: Product[];
  expiryAlerts: ExpiryAlert[];
  inventoryLogs: InventoryLog[];
  onOpenRestock: (product: Product) => void;
  onOpenEditProduct: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  expiryAlerts,
  inventoryLogs,
  onOpenRestock,
  onOpenEditProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'expiry' | 'low_stock' | 'logs'>('expiry');

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockThreshold);

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#43271a]">المخزون الفعلي وتتبع تواريخ الصلاحية</h2>
          <p className="text-xs text-[#82746e]">
            إدارة مباشرة لسلامة مواد الخبز الغذائية وتنبيهات نفاد الكميات بدون أي بيانات تجريبية
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#ffdad6]/60 border border-[#ba1a1a]/20 px-3 py-1.5 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
            <span className="text-xs font-bold text-[#ba1a1a] tabular-nums">
              {expiryAlerts.filter((a) => a.status === 'critical' || a.status === 'expired').length} تنبيهات حرجة
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#ffd9dd]/60 border border-[#9e3d50]/20 px-3 py-1.5 rounded-2xl">
            <Boxes className="w-4 h-4 text-[#9e3d50]" />
            <span className="text-xs font-bold text-[#9e3d50] tabular-nums">
              {lowStockProducts.length} مواد أوشكت
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7e1de] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('expiry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'expiry'
              ? 'bg-[#43271a] text-[#fef8f4] shadow-xs'
              : 'bg-white text-[#50443f] hover:bg-[#ede7e3]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#ffdbcc]" />
          <span>مراقبة تواريخ الصلاحية ({expiryAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('low_stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'low_stock'
              ? 'bg-[#43271a] text-[#fef8f4] shadow-xs'
              : 'bg-white text-[#50443f] hover:bg-[#ede7e3]'
          }`}
        >
          <Boxes className="w-4 h-4 text-[#ffdbcc]" />
          <span>نواقص المخزون والتزويد ({lowStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-[#43271a] text-[#fef8f4] shadow-xs'
              : 'bg-white text-[#50443f] hover:bg-[#ede7e3]'
          }`}
        >
          <History className="w-4 h-4 text-[#ffdbcc]" />
          <span>سجل حركات الجرد والوارد ({inventoryLogs.length})</span>
        </button>
      </div>

      {/* SubTab 1: Expiry Alerts */}
      {activeSubTab === 'expiry' && (
        <div className="flex flex-col gap-4">
          <div className="bg-[#fff5ea] p-4 rounded-3xl border border-[#d97706]/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#d97706] shrink-0 mt-0.5" />
            <div className="text-xs text-[#b45309] leading-relaxed">
              <strong className="block text-sm font-bold text-[#78350f] mb-0.5">
                نظام حماية جودة مواد الخبز وتواريخ الصلاحية
              </strong>
              يقوم النظام بحساب الفارق الزمني يومياً بين تاريخ صلاحية الشوكولاتة، الألوان، النكهات، والخمائر، وإرسال تنبيه فوري عند الاقتراب من فترة 15 يوماً للتصرف (عروض ترويجية، تخفيضات، أو سحب الدفعة).
            </div>
          </div>

          {expiryAlerts.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#cde9dc]/50 flex items-center justify-center text-[#1b322a]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
                لا توجد مواد تقترب صلاحيتها من الانتهاء حالياً
              </h3>
              <p className="text-xs text-[#82746e] max-w-md leading-relaxed">
                عند إضافة مواد غذائية (كالشوكولاتة، الألوان الغذائية، دقيق اللوز، وحبيبات التزيين) وتفعيل خيار تتبع الصلاحية، سيقوم النظام بمراقبتها وحساب الأيام المتبقية يومياً.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expiryAlerts.map((alert) => {
                const product = products.find((p) => p.id === alert.productId);
                const isCritical = alert.status === 'critical' || alert.status === 'expired';

                return (
                  <div
                    key={alert.productId}
                    className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between gap-3 transition-all ${
                      isCritical
                        ? 'bg-white border-[#ba1a1a]/40 shadow-[0_4px_16px_rgba(186,26,26,0.06)]'
                        : 'bg-white border-[#e7e1de]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-[#82746e] font-medium">{alert.category}</span>
                          <h3 className="text-sm font-bold text-[#43271a] mt-0.5">{alert.productName}</h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tabular-nums shrink-0 ${
                            alert.status === 'expired'
                              ? 'bg-[#ba1a1a] text-white'
                              : isCritical
                              ? 'bg-[#ba1a1a] text-white animate-pulse'
                              : 'bg-[#fff5ea] text-[#d97706] border border-[#d97706]/30'
                          }`}
                        >
                          {alert.daysRemaining <= 0
                            ? 'انتهت الصلاحية'
                            : `متبقي ${alert.daysRemaining} يوم`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-2xl bg-[#f8f2ef] text-xs">
                        <div>
                          <span className="text-[#82746e] block text-[10px]">تاريخ الانتهاء</span>
                          <strong className="text-[#1d1b19] tabular-nums font-bold">
                            {alert.expiryDate}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#82746e] block text-[10px]">رقم التشغيلة</span>
                          <strong className="text-[#50443f]">
                            {alert.batchNumber || 'دفعة عامة'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#82746e] block text-[10px]">المخزون المتوفر</span>
                          <strong className="text-[#43271a] tabular-nums font-bold">
                            {alert.stock} {alert.unit}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#82746e] block text-[10px]">الحالة الصحية</span>
                          <strong
                            className={
                              isCritical ? 'text-[#ba1a1a]' : 'text-[#d97706]'
                            }
                          >
                            {isCritical ? 'عاجل جداً' : 'تنبيه استباقي'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#f3ede9]">
                      {product && (
                        <>
                          <button
                            onClick={() => onOpenRestock(product)}
                            className="flex-1 py-2 rounded-xl bg-[#43271a] text-white text-xs font-semibold hover:bg-[#5c3d2e] transition-colors"
                          >
                            تزويد دفعة جديدة طازجة
                          </button>
                          <button
                            onClick={() => onOpenEditProduct(product)}
                            className="py-2 px-3 rounded-xl bg-[#f3ede9] text-[#43271a] text-xs font-medium hover:bg-[#ede7e3]"
                          >
                            تعديل الصلاحية / السعر
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Low Stock & Restock */}
      {activeSubTab === 'low_stock' && (
        <div className="flex flex-col gap-4">
          {lowStockProducts.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#cde9dc]/50 flex items-center justify-center text-[#1b322a]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#43271a]">
                لا توجد نواقص في المخزون حالياً
              </h3>
              <p className="text-xs text-[#82746e]">
                جميع المواد المسجلة تتوفر بكميات تفوق الحد الأدنى للتنبيه.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-[#f8f2ef]"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-[#43271a]">{product.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#82746e] mt-1">
                        <span>الحد الأدنى: {product.minStockThreshold} {product.unit}</span>
                        <span>·</span>
                        <span className="text-[#ba1a1a] font-bold">
                          المتبقي: {product.stock} {product.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenRestock(product)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#43271a] text-[#ffdbcc] text-xs font-semibold hover:bg-[#5c3d2e] shadow-sm shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>تزويد</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Inventory Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-[#e7e1de] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e7e1de] flex items-center justify-between bg-[#f8f2ef]">
            <span className="text-xs font-bold text-[#43271a]">
              سجل حركات المخزون والمبيعات والوارد
            </span>
            <span className="text-xs text-[#82746e]">سجل تدقيق فعلي</span>
          </div>

          {inventoryLogs.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
              <History className="w-10 h-10 text-[#d4c3bc]" />
              <h3 className="text-sm font-bold text-[#43271a]">لا توجد حركات مسجلة في المخزن حتى الآن</h3>
              <p className="text-xs text-[#82746e]">
                سيتم توثيق كل حركة وارد، أو مبيعات، أو تعديل يدوي في المخزون هنا تلقائياً.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f3ede9]">
              {inventoryLogs.map((log) => {
                const isPositive = log.delta > 0;
                return (
                  <div
                    key={log.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#fdfbf9] text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isPositive ? 'bg-[#cde9dc] text-[#1b322a]' : 'bg-[#ffd9dd] text-[#9e3d50]'
                        }`}
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#1d1b19] truncate">{log.productName}</span>
                        <span className="text-[11px] text-[#82746e]">{log.reason}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-left">
                      <div className="text-right">
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            isPositive ? 'text-[#1b322a]' : 'text-[#ba1a1a]'
                          }`}
                        >
                          {isPositive ? `+${log.delta}` : log.delta}
                        </span>
                        <span className="text-[10px] text-[#82746e] block">
                          الرصيد: {log.newStock}
                        </span>
                      </div>

                      <span className="text-[10px] text-[#82746e] tabular-nums hidden sm:inline">
                        {new Date(log.timestamp).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
