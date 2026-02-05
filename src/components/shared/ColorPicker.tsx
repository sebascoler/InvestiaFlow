import React from 'react';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#0284c7' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, className = '' }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-3">
        {/* Preset colors */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              className={`
                w-10 h-10 rounded-lg border-2 transition-all
                ${value === color.value 
                  ? 'border-gray-900 scale-110 shadow-lg' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            >
              {value === color.value && (
                <Check size={16} className="text-white mx-auto" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
        
        {/* Custom color input */}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
            title="Custom color"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              // Validate hex color
              if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                onChange(e.target.value);
              }
            }}
            placeholder="#0284c7"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
};
