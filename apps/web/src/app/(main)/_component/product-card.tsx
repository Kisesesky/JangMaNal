'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CompareProductItem } from '../_model/product.model';

type ProductCardProps = {
  product: CompareProductItem;
  onAdd: (product: CompareProductItem) => void;
};

const martLabel: Record<CompareProductItem['mart'], string> = {
  emart: '이마트',
  lotte: '롯데마트',
  homeplus: '홈플러스',
  marketkurly: '마켓컬리',
  wisely: '와이즐리',
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-slate-100">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Badge>{martLabel[product.mart]}</Badge>
          <span className="text-sm text-slate-500">{product.category}</span>
        </div>
        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold text-slate-900">{product.name}</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">구매지수 {product.popularity}</p>
            <p className="text-lg font-bold">{product.price.toLocaleString()}원</p>
          </div>
          <Button size="sm" onClick={() => onAdd(product)}>
            담기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
