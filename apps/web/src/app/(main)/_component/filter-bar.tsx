'use client';

import { Input } from '@/components/ui/input';
import type { CompareFilter, ProductCategory } from '../_model/product.model';

type FilterBarProps = {
  filter: CompareFilter;
  onChange: (value: CompareFilter) => void;
};

const categories: Array<ProductCategory | '전체'> = ['전체', '과일', '채소', '유제품', '냉동식품', '간편식'];

export function FilterBar({ filter, onChange }: FilterBarProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <Input
        value={filter.keyword}
        placeholder="상품명 검색 (예: 딸)"
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter.category === category ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
            onClick={() => onChange({ ...filter, category })}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${
            filter.sort === 'price_asc' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}
          onClick={() => onChange({ ...filter, sort: 'price_asc' })}
        >
          가격 낮은순
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${
            filter.sort === 'popularity_desc' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
          }`}
          onClick={() => onChange({ ...filter, sort: 'popularity_desc' })}
        >
          구매 많은순
        </button>
      </div>
    </div>
  );
}
