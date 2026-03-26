'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { compareService } from '../_service/compare.service';

type Summary = Awaited<ReturnType<typeof compareService.getAdminSummary>>;

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    void compareService.getAdminSummary().then(setSummary);
  }, []);

  if (!summary) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">관리 지표 로딩 중...</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">총 상품 수</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.productCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">연동 마트 수</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.martCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">카테고리 수</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.categoryCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">평균 가격</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.averagePrice.toLocaleString()}원</p>
        </CardContent>
      </Card>
    </div>
  );
}
