'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCompareStore } from '@/store/compare-store';
import { FilterBar } from '../_component/filter-bar';
import { ProductCard } from '../_component/product-card';
import type { CompareFilter } from '../_model/product.model';
import { compareService } from '../_service/compare.service';

const initialFilter: CompareFilter = {
  keyword: '',
  category: '전체',
  sort: 'price_asc',
};

export default function ComparePage() {
  const [filter, setFilter] = useState<CompareFilter>(initialFilter);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof compareService.listProducts>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cartProducts = useCompareStore((state) => state.products);
  const addProduct = useCompareStore((state) => state.addProduct);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const clear = useCompareStore((state) => state.clear);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoading(true);
      const result = await compareService.listProducts(filter);
      if (alive) {
        setProducts(result);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, [filter]);

  const totalPrice = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.price, 0),
    [cartProducts],
  );

  return (
    <div className="space-y-5">
      <FilterBar filter={filter} onChange={setFilter} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="col-span-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">로딩 중...</p>
        ) : products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} />)
        ) : (
          <p className="col-span-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            조건에 맞는 상품이 없습니다.
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">장바구니 견적</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cartProducts.length === 0 ? (
            <p className="text-sm text-slate-500">상품을 담아 비교해보세요.</p>
          ) : (
            cartProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.mart}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.price.toLocaleString()}원</span>
                  <Button size="sm" variant="ghost" onClick={() => removeProduct(item.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-700">총 금액</p>
            <p className="text-xl font-bold text-slate-900">{totalPrice.toLocaleString()}원</p>
          </div>

          <Button variant="secondary" className="w-full" onClick={clear}>
            장바구니 비우기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
