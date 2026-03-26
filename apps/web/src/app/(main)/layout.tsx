import { MainNav } from './_component/main-nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">JangMaNal</p>
          <h1 className="text-2xl font-bold text-slate-900">앱형 장보기 비교</h1>
        </div>
      </header>
      {children}
      <MainNav />
    </div>
  );
}
