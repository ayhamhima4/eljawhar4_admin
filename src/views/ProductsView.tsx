import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Boxes,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { Product, ProductCategory, StockStatus } from '../types';

interface ProductsViewProps {
  products: Product[];
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onOpenRestock: (product: Product) => void;
  onQuickAdjustPrice: (productId: string, delta: number) => void;
  onQuickAdjustStock: (productId: string, delta: number) => void;
  onDeleteProduct: (productId: string) => void;
}

const CATEGORIES: Array<'الكل' | ProductCategory> = [
  'الكل',
  'قوالب سيليكون',
  'أدوات وأقماع تزيين',
  'صواني وخبز',
  'شوكولاتة ومواد خام',
  'ألوان ونكهات',
  'تغليف وصناديق',
];

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onOpenAddProduct,
  onOpenEditProduct,
  onOpenRestock,
  onQuickAdjustPrice,
  onQuickAdjustStock,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'الكل' | ProductCategory>('الكل');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'expiring_soon'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.batchNumber && p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchCategory =
        selectedCategory === 'الكل' || p.category === selectedCategory;

      // Stock & Expiry filter
      let matchFilter = true;
      if (stockFilter === 'low_stock') {
        matchFilter = p.stock <= p.minStockThreshold;
      } else if (stockFilter === 'expiring_soon') {
        matchFilter = Boolean(p.isFoodItem && p.expiryDate && p.expiryDate <= '2026-11-20');
      }

      return matchSearch && matchCategory && matchFilter;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#43271a]">إدارة المنتجات والمستلزمات</h2>
          <p className="text-xs text-[#82746e]">
            إجمالي الأصناف: <strong className="text-[#43271a]">{products.length}</strong> صنف في الكتالوج
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-[#ede7e3] rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#43271a] shadow-xs' : 'text-[#82746e]'
              }`}
              title="عرض كبطاقات شبكية"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#43271a] shadow-xs' : 'text-[#82746e]'
              }`}
              title="عرض كجدول بيانات"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#43271a] text-white text-xs sm:text-sm font-semibold hover:bg-[#5c3d2e] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#82746e] absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المنتج، كود SKU، أو رقم التشغيلة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#d4c3bc]/60 text-xs sm:text-sm text-[#1d1b19] focus:outline-none focus:ring-2 focus:ring-[#43271a]"
            />
          </div>

          {/* Quick filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                stockFilter === 'all'
                  ? 'bg-[#43271a] text-white'
                  : 'bg-[#f3ede9] text-[#50443f] hover:bg-[#ede7e3]'
              }`}
            >
              الكل ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                stockFilter === 'low_stock'
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#ffd9dd] text-[#9e3d50] hover:bg-[#ffdad6]'
              }`}
            >
              نواقص المخزون
            </button>
            <button
              onClick={() => setStockFilter('expiring_soon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                stockFilter === 'expiring_soon'
                  ? 'bg-[#d97706] text-white'
                  : 'bg-[#fff5ea] text-[#b45309] hover:bg-[#fde68a]'
              }`}
            >
              صلاحية تقترب
            </button>
          </div>
        </div>

        {/* Category Filter Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#f3ede9]">
          <span className="text-xs font-semibold text-[#82746e] ml-2 shrink-0">التصنيف:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ffdbcc] text-[#43271a] font-bold border border-[#43271a]/30'
                  : 'bg-[#f8f2ef] text-[#50443f] hover:bg-[#ede7e3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display: Grid or Table or Pure Empty State */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f8f2ef] flex items-center justify-center text-[#82746e]">
            <Boxes className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#43271a]">المخزن فارغ حالياً - لم يتم إدراج أصناف بعد</h3>
          <p className="text-xs text-[#82746e] max-w-md leading-relaxed">
            لا توجد أي بيانات تجريبية وهمية. يمكنك الآن البدء بإدراج مستلزمات الحلويات، قوالب السيليكون، والمواد الخام الحقيقية مع تحديد الأسعار والكميات وتواريخ الصلاحية.
          </p>
          <button
            onClick={onOpenAddProduct}
            className="mt-2 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#43271a] text-white text-xs font-semibold hover:bg-[#5c3d2e] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول صنف للمتجر</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center gap-3">
          <Boxes className="w-12 h-12 text-[#d4c3bc]" />
          <h3 className="text-base font-bold text-[#43271a]">لا توجد منتجات تطابق البحث</h3>
          <p className="text-xs text-[#82746e]">
            جرّب تغيير كلمات البحث أو إعادة ضبط فلتر الأقسام
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('الكل');
              setStockFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#43271a] text-white text-xs font-medium hover:bg-[#5c3d2e]"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.minStockThreshold;

            return (
              <div
                key={product.id}
                className="p-4 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col justify-between gap-3 hover:border-[#43271a] transition-all group"
              >
                <div>
                  <div className="relative overflow-hidden rounded-2xl bg-[#f8f2ef] mb-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#fef8f4]/90 backdrop-blur-md text-[11px] font-semibold text-[#43271a] shadow-xs">
                        {product.category}
                      </span>
                    </div>
                    {product.isFoodItem && (
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-0.5 rounded-lg bg-[#43271a]/80 backdrop-blur-sm text-white text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>صلاحية: {product.expiryDate || 'متابعة'}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#43271a] line-clamp-1" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#82746e] mt-1">
                    <span>كود: {product.sku}</span>
                    {product.batchNumber && <span>· دفعة: {product.batchNumber}</span>}
                  </div>

                  {/* Price & Stock badges */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f3ede9]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-[#82746e]">السعر:</span>
                      <span className="text-base font-bold text-[#43271a] tabular-nums">
                        {product.price}
                      </span>
                      <span className="text-[10px] text-[#82746e]">ر.س</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#82746e]">المخزون:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
                          product.stock === 0
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : isLowStock
                            ? 'bg-[#ffd9dd] text-[#9e3d50]'
                            : 'bg-[#cde9dc] text-[#1b322a]'
                        }`}
                      >
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f3ede9]">
                  {/* Quick price adjusters */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onQuickAdjustPrice(product.id, 5)}
                      className="w-7 h-7 rounded-lg bg-[#f8f2ef] flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc]"
                      title="زيادة السعر 5 ر.س"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onQuickAdjustPrice(product.id, -5)}
                      className="w-7 h-7 rounded-lg bg-[#f8f2ef] flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc]"
                      title="تخفيض السعر 5 ر.س"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Restock & Edit buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenRestock(product)}
                      className="px-2.5 py-1 rounded-xl bg-[#cde9dc]/60 hover:bg-[#cde9dc] text-[#1b322a] text-xs font-bold transition-colors"
                      title="تزويد كميات جديدة للمخزن"
                    >
                      تزويد
                    </button>
                    <button
                      onClick={() => onOpenEditProduct(product)}
                      className="p-1.5 rounded-xl bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#43271a] transition-colors"
                      title="تعديل كامل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-1.5 rounded-xl bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#ba1a1a] transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-[#e7e1de] shadow-sm overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#f8f2ef] border-b border-[#e7e1de] text-[#50443f]">
                <th className="py-3.5 px-4 font-semibold">المنتج</th>
                <th className="py-3.5 px-4 font-semibold">القسم</th>
                <th className="py-3.5 px-4 font-semibold">السعر</th>
                <th className="py-3.5 px-4 font-semibold">المخزون الحالي</th>
                <th className="py-3.5 px-4 font-semibold">تاريخ الصلاحية</th>
                <th className="py-3.5 px-4 font-semibold">تعديل سريع</th>
                <th className="py-3.5 px-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ede9]">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock <= p.minStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-[#fdfbf9] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-[#f8f2ef] shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[#1d1b19] truncate max-w-[200px]">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#82746e]">كود: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#50443f]">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-[#43271a] tabular-nums">
                      {p.price} ر.س
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold tabular-nums ${
                          p.stock === 0
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : isLowStock
                            ? 'bg-[#ffd9dd] text-[#9e3d50]'
                            : 'bg-[#cde9dc] text-[#1b322a]'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.isFoodItem && p.expiryDate ? (
                        <span className="text-[#9e3d50] font-medium tabular-nums">
                          {p.expiryDate}
                        </span>
                      ) : (
                        <span className="text-[#82746e]">أدوات غير قابلة للتلف</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onQuickAdjustPrice(p.id, 5)}
                          className="w-6 h-6 rounded bg-[#f8f2ef] flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc]"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onQuickAdjustPrice(p.id, -5)}
                          className="w-6 h-6 rounded bg-[#f8f2ef] flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc]"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenRestock(p)}
                          className="px-2 py-1 rounded-lg bg-[#cde9dc]/50 text-[#1b322a] font-bold hover:bg-[#cde9dc]"
                        >
                          تزويد
                        </button>
                        <button
                          onClick={() => onOpenEditProduct(p)}
                          className="p-1 rounded-lg text-[#43271a] hover:bg-[#ede7e3]"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
