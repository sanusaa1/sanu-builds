import React, { useState } from 'react';
import { X, Ruler, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const dataInches = [
    { size: 'XS', chest: '36 - 38', length: '27.5', shoulder: '18.5', sleeve: '8.5' },
    { size: 'S', chest: '38 - 40', length: '28.5', shoulder: '19.5', sleeve: '9.0' },
    { size: 'M', chest: '41 - 43', length: '29.5', shoulder: '20.5', sleeve: '9.5' },
    { size: 'L', chest: '44 - 46', length: '30.5', shoulder: '21.5', sleeve: '10.0' },
    { size: 'XL', chest: '47 - 49', length: '31.5', shoulder: '22.5', sleeve: '10.5' },
    { size: 'XXL', chest: '50 - 52', length: '32.5', shoulder: '23.5', sleeve: '11.0' },
  ];

  const dataCm = [
    { size: 'XS', chest: '91 - 96', length: '70', shoulder: '47', sleeve: '21.5' },
    { size: 'S', chest: '96 - 101', length: '72', shoulder: '49.5', sleeve: '23' },
    { size: 'M', chest: '104 - 109', length: '75', shoulder: '52', sleeve: '24' },
    { size: 'L', chest: '112 - 117', length: '77.5', shoulder: '54.5', sleeve: '25.5' },
    { size: 'XL', chest: '119 - 124', length: '80', shoulder: '57', sleeve: '26.5' },
    { size: 'XXL', chest: '127 - 132', length: '82.5', shoulder: '59.5', sleeve: '28' },
  ];

  const rows = unit === 'inches' ? dataInches : dataCm;

  return (
    <div
      id="size-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="size-guide-modal-content"
        className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-lg tracking-tight">Sanu Builds Size Matrix</h3>
          </div>
          <button
            id="size-guide-close-btn"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500 font-medium">
              Measurements taken laid flat. All Sanu Builds Oversized tees are relaxed drop-shoulder cut.
            </p>
            <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 shrink-0">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  unit === 'inches' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  unit === 'cm' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chest ({unit})</th>
                  <th className="py-3 px-4">Length ({unit})</th>
                  <th className="py-3 px-4">Shoulder ({unit})</th>
                  <th className="py-3 px-4">Sleeve ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-neutral-900">{row.size}</td>
                    <td className="py-2.5 px-4 text-neutral-600">{row.chest}</td>
                    <td className="py-2.5 px-4 text-neutral-600">{row.length}</td>
                    <td className="py-2.5 px-4 text-neutral-600">{row.shoulder}</td>
                    <td className="py-2.5 px-4 text-neutral-600">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 space-y-1.5 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Fit Recommendation:</span>
            </div>
            <p>
              • <strong>For Signature Oversized Look:</strong> Pick your true regular size (built with built-in drop shoulders).
            </p>
            <p>
              • <strong>For Tailored / Slim Look:</strong> Order one size down from your usual clothing size.
            </p>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
