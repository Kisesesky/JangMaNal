import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthShellProps = {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <Card className="border-slate-300/80 shadow-lg shadow-slate-300/30 backdrop-blur">
      <CardHeader className="space-y-2">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">JangMaNal</div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        <div className="border-t border-slate-200 pt-4 text-center text-sm text-slate-600">{footer}</div>
        <div className="text-center text-xs text-slate-500">
          <Link href="/compare" className="underline underline-offset-2">
            둘러보기로 이동
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
