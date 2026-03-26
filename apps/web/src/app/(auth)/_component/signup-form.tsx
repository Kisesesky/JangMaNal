'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '../_service/auth.service';
import { signupSchema, type SignupForm } from '../_model/auth.schema';

const initialForm: SignupForm = {
  profileImageUrl: '',
  email: '',
  code: '',
  name: '',
  phoneNumber: '',
  password: '',
  passwordConfirm: '',
  agreeTerms: false,
  agreePrivacy: false,
};

export function SignupFormView() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => {
    const parsed = signupSchema.safeParse(form);
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
      await authService.signup(form);
      router.push('/login');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : '회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="profileImageUrl">프로필 이미지 URL (선택)</Label>
        <Input
          id="profileImageUrl"
          value={form.profileImageUrl}
          onChange={(event) => setForm((prev) => ({ ...prev, profileImageUrl: event.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="code">이메일 인증번호</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            placeholder="6자리"
          />
          {errors.code ? <p className="text-xs text-red-600">{errors.code}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">전화번호</Label>
          <Input
            id="phoneNumber"
            value={form.phoneNumber}
            onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
            placeholder="01012345678"
          />
          {errors.phoneNumber ? <p className="text-xs text-red-600">{errors.phoneNumber}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          {errors.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
          <Input
            id="passwordConfirm"
            type="password"
            value={form.passwordConfirm}
            onChange={(event) => setForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))}
          />
          {errors.passwordConfirm ? <p className="text-xs text-red-600">{errors.passwordConfirm}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={form.agreeTerms}
          onChange={(event) => setForm((prev) => ({ ...prev, agreeTerms: event.target.checked }))}
        />
        약관 동의
      </label>
      {errors.agreeTerms ? <p className="text-xs text-red-600">{errors.agreeTerms}</p> : null}

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={form.agreePrivacy}
          onChange={(event) => setForm((prev) => ({ ...prev, agreePrivacy: event.target.checked }))}
        />
        개인정보 처리 동의
      </label>
      {errors.agreePrivacy ? <p className="text-xs text-red-600">{errors.agreePrivacy}</p> : null}

      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

      <Button className="w-full" type="submit" disabled={isLoading || hasErrors}>
        {isLoading ? '가입 처리 중...' : '회원가입'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="underline underline-offset-2">
          로그인
        </Link>
      </p>
    </form>
  );
}
