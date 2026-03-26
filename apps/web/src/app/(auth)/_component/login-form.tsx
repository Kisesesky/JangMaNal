'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '../_service/auth.service';
import { loginSchema, type LoginForm } from '../_model/auth.schema';

const initialForm: LoginForm = {
  email: '',
  password: '',
};

export function LoginFormView() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState<LoginForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => {
    const parsed = loginSchema.safeParse(form);
    if (parsed.success) return {} as Record<string, string>;

    return parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path[0]?.toString();
      if (!key || acc[key]) return acc;
      acc[key] = issue.message;
      return acc;
    }, {});
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');
    if (hasErrors) return;

    try {
      setIsLoading(true);
      const response = await authService.login(form);
      const user = response.user ?? {
        id: 'temp-user',
        email: form.email,
        name: form.email.split('@')[0],
      };
      const accessToken = response.accessToken ?? 'dev-token';
      setSession({ user, accessToken });
      router.push('/compare');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="you@example.com"
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="8자 이상"
        />
        {errors.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
      </div>

      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

      <Button className="w-full" type="submit" disabled={isLoading || hasErrors}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/signup" className="text-slate-600 underline underline-offset-2">
          회원가입
        </Link>
        <Link href="/forgot-password" className="text-slate-600 underline underline-offset-2">
          비밀번호 찾기
        </Link>
      </div>

      <div className="space-y-2 pt-2">
        <p className="text-xs font-medium text-slate-500">소셜 로그인</p>
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline">
            Google
          </Button>
          <Button type="button" variant="outline">
            Naver
          </Button>
          <Button type="button" variant="outline">
            Kakao
          </Button>
        </div>
      </div>
    </form>
  );
}
