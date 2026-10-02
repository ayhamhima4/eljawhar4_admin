import React, { useState, useEffect } from 'react';
import { X, Sliders, Calendar, Package, AlertCircle } from 'lucide-react';
import { Product, ProductCategory, ProductUnit } from '../../types';

// Preset images
import siliconeMoldImg from '../../assets/images/silicone_mold_pastry_1790865611304.jpg';
import pipingTipsImg from '../../assets/images/piping_nozzles_set_1790865623325.jpg';
import cakePansImg from '../../assets/images/cake_tart_pans_1790865634472.jpg';
import belgianChocImg from '../../assets/images/belgian_chocolate_drops_1790865645995.jpg';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  product: Product | null; // null if adding new
}

const CATEGORIES: ProductCategory[] = [
  'قوالب سيليكون',
  'أدوات وأقماع تزيين',
  'صواني وخبز',
  'شوكولاتة ومواد خام',
  'ألوان ونكهات',
  'تغليف وصناديق',
];

const UNITS: ProductUnit[] = ['قطعة', 'طقم', 'كجم', 'جرام', 'درزن', 'عبوة', 'لتر'];

const PRESET_IMAGES = [
  { label: 'قوالب سيليكون', url: siliconeMoldImg },
  { label: 'أقماع تزيين', url: pipingTipsImg },
  { label: 'صواني قاطو وتارت', url: cakePansImg },
  { label: 'شوكولاتة بلجيكية خام', url: belgianChocImg },
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('قوالب سيليكون');
  const [price, setPrice] = useState(85);
  const [stock, setStock] = useState(20);
  const [minStockThreshold, setMinStockThreshold] = useState(10);
  const [unit, setUnit] = useState<ProductUnit>('قطعة');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(siliconeMoldImg);
  const [isFoodItem, setIsFoodItem] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setSubmitError('');
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price);
      setStock(product.stock);
      setMinStockThreshold(product.minStockThreshold || 10);
      setUnit(product.unit);
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setDescription(product.description || '');
      setImageUrl(product.imageUrl || siliconeMoldImg);
      setIsFoodItem(product.isFoodItem);
      setExpiryDate(product.expiryDate || '');
      setProductionDate(product.productionDate || '');
      setBatchNumber(product.batchNumber || '');
    } else {
      // New product starts completely blank
      setName('');
      setCategory('قوالب سيليكون');
      setPrice(0);
      setStock(0);
      setMinStockThreshold(5);
      setUnit('قطعة');
      setSku('');
      setBarcode('');
      setDescription('');
      setImageUrl(siliconeMoldImg);
      setIsFoodItem(false);
      setExpiryDate('');
      setProductionDate('');
      setBatchNumber('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSave({
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        minStockThreshold: Number(minStockThreshold),
        unit,
        sku: sku.trim(),
        barcode: barcode.trim(),
        description: description.trim(),
        imageUrl,
        isFoodItem,
        expiryDate: isFoodItem && expiryDate ? expiryDate : undefined,
        productionDate: isFoodItem && productionDate ? productionDate : undefined,
        batchNumber: isFoodItem && batchNumber ? batchNumber : undefined,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'تعذر حفظ المنتج، يرجى المحاولة مجدداً.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="bg-[#fef8f4] w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#e7e1de] my-auto flex flex-col gap-5 text-[#1d1b19] max-h-[92vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e7e1de] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffdbcc] text-[#43271a] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#43271a]">
                {product ? 'تعديل تفاصيل الصنف' : 'إضافة صنف حلويات جديد'}
              </h2>
              <p className="text-xs text-[#82746e]">
                {product ? `تحديث السعر والمخزون وتاريخ الصلاحية لـ: ${product.name}` : 'إدراج أداة خبز أو مادة خام جديدة في المتجر'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#82746e] hover:text-[#43271a] hover:bg-[#ede7e3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#50443f]">اسم الصنف / المنتج بالكامل *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: قالب سيليكون كروي للموس، أو شوكولاتة بلجيكية 54%"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-sm text-[#1d1b19] focus:outline-none focus:ring-2 focus:ring-[#43271a]"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#50443f]">القسم / التصنيف *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-sm text-[#1d1b19] focus:outline-none focus:ring-2 focus:ring-[#43271a]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#50443f]">وحدة القياس والبيع *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-sm text-[#1d1b19] focus:outline-none focus:ring-2 focus:ring-[#43271a]"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Stock, Min Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#50443f]">سعر البيع (د.ج) *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-sm font-bold text-[#43271a] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#43271a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#50443f]">الكمية المتوفرة بالمخزون *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-sm font-bold text-[#43271a] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#43271a]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#50443f]">حد أدنى للتنبيه بالنقص</label>
              <input
                type="number"
                min="1"
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#43271a]"
              />
            </div>
          </div>

          {/* Food Item & Expiry Tracking Section (Critical Requirement) */}
          <div className="bg-[#f3ede9] p-4 rounded-2xl border border-[#d4c3bc]/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9e3d50]" />
                <span className="text-xs sm:text-sm font-bold text-[#43271a]">
                  متابعة تاريخ الصلاحية والدفعات (Expiry Tracking)
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-[#50443f]">مادة غذائية / كيميائية صالحة للاستهلاك</span>
                <input
                  type="checkbox"
                  checked={isFoodItem}
                  onChange={(e) => setIsFoodItem(e.target.checked)}
                  className="w-4 h-4 accent-[#43271a] rounded"
                />
              </label>
            </div>

            {isFoodItem ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#d4c3bc]/50">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#50443f]">تاريخ انتهاء الصلاحية *</label>
                  <input
                    type="date"
                    required={isFoodItem}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#43271a]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#50443f]">تاريخ الإنتاج (اختياري)</label>
                  <input
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#43271a]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#50443f]">رقم التشغيلة / الدفعة (Batch/Lot)</label>
                  <input
                    type="text"
                    placeholder="LOT-2026-X"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#43271a]"
                  />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#82746e]">
                قوالب السيليكون والأدوات المعدنية لا تتطلب تواريخ انتهاء، فعّل الخيار أعلاه للألوان والشوكولاتة ودقيق اللوز والخمائر.
              </p>
            )}
          </div>

          {/* Image Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#50443f]">صورة المنتج</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(preset.url)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                    imageUrl === preset.url
                      ? 'border-[#43271a] bg-[#ffdbcc]/30 ring-2 ring-[#43271a]/30'
                      : 'border-[#e7e1de] bg-white hover:border-[#82746e]'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-12 object-cover rounded-lg"
                  />
                  <span className="text-[10px] text-[#50443f] truncate w-full text-center">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="أو ضع رابط صورة مخصص (URL)"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs text-[#50443f] focus:outline-none focus:ring-1 focus:ring-[#43271a]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#50443f]">الوصف وتفاصيل الاستخدام للحلواني</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مواصفات المقاس ودرجة الحرارة أو طريقة الحفظ..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs text-[#1d1b19] focus:outline-none focus:ring-2 focus:ring-[#43271a]"
            />
          </div>

          {/* Buttons */}
          {submitError && (
            <p role="alert" className="text-sm text-red-700" dir="rtl">
              تعذر حفظ المنتج: {submitError}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e7e1de]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#d4c3bc] text-xs sm:text-sm font-medium text-[#50443f] hover:bg-[#ede7e3] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#43271a] text-[#fef8f4] text-xs sm:text-sm font-semibold hover:bg-[#5c3d2e] shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج للمتجر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
