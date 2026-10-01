import React, { useState } from 'react';
import { X, PlusCircle, Calendar, Tag } from 'lucide-react';
import { Product } from '../../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onRestock: (productId: string, quantity: number, batchNumber?: string, newExpiryDate?: string) => Promise<void>;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  product,
  onRestock,
}) => {
  const [quantity, setQuantity] = useState(20);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await onRestock(
        product.id,
        Number(quantity),
        batchNumber.trim() || undefined,
        expiryDate || undefined
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#fef8f4] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#e7e1de] flex flex-col gap-5 text-[#1d1b19]"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-[#e7e1de] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#cde9dc] text-[#1b322a] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#43271a]">إعادة تزويد المخزون (Restock)</h3>
              <p className="text-xs text-[#82746e] truncate max-w-[240px]">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#82746e] hover:text-[#43271a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#f3ede9] p-3 rounded-xl flex items-center justify-between text-xs text-[#50443f]">
          <span>المخزون الحالي:</span>
          <span className="font-bold text-[#43271a] text-sm tabular-nums">
            {product.stock} {product.unit}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#50443f]">
              الكمية المضافة للوارد الجديد ({product.unit}) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3bc] text-base font-bold text-[#43271a] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#43271a]"
            />
          </div>

          {product.isFoodItem && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#50443f] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9e3d50]" />
                  <span>تاريخ انتهاء الصلاحية للدفعة الجديدة</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#43271a]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#50443f] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#82746e]" />
                  <span>رقم التشغيلة / الدفعة (Batch No)</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: LOT-2026-B"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#d4c3bc] text-xs focus:outline-none focus:ring-2 focus:ring-[#43271a]"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-xs text-[#50443f] pt-1">
            <span>المخزون المتوقع بعد الإضافة:</span>
            <span className="font-bold text-[#1b322a] text-sm tabular-nums">
              {product.stock + Number(quantity)} {product.unit}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#e7e1de]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#43271a] text-[#fef8f4] text-xs font-semibold hover:bg-[#5c3d2e] shadow-sm transition-all"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'تأكيد إضافة الكمية للمخزن'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#d4c3bc] text-xs text-[#50443f] hover:bg-[#ede7e3]"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
