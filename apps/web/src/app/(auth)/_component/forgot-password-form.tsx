'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  forgotPasswordStep1Schema,
  forgotPasswordStep2Schema,
  type ForgotPasswordStep1Form,
  type ForgotPasswordStep2Form,
} from '../_model/auth.schema';
import { authService } from '../_service/auth.service';

const initialStep1: ForgotPasswordStep1Form = {
  email: '',
  code: '',
};

const initialStep2: ForgotPasswordStep2Form = {
  newPassword: '',
  newPasswordConfirm: '',
};

export function ForgotPasswordFormView() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<ForgotPasswordStep1Form>(initialStep1);
  const [step2, setStep2] = useState<ForgotPasswordStep2Form>(initialStep2);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');

  const step1Errors = useMemo(() => {
    const parsed = forgotPasswordStep1Schema.safeParse(step1);
    if (parsed.success) return {} as Record<string, string>;

    return parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path[0]?.toString();
      if (!key || acc[key]) return acc;
      acc[key] = issue.message;
      return acc;
    }, {});
  }, [step1]);

  const step2Errors = useMemo(() => {
    const parsed = forgotPasswordStep2Schema.safeParse(step2);
    if (parsed.success) return {} as Record<string, string>;

    return parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = issue.path[0]?.toString();
      if (!key || acc[key]) return acc;
      acc[key] = issue.message;
      return acc;
    }, {});
  }, [step2]);

  const submitStep1 = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');
    setMessage('');
    if (Object.keys(step1Errors).length > 0) return;

    try {
      setIsLoading(true);
      await authService.requestPasswordResetCode({ email: step1.email });
      await authService.verifyPasswordResetCode(step1);
      setMessage('인증이 완료되었습니다. 새 비밀번호를 입력해주세요.');
      setStep(2);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitStep2 = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');
    setMessage('');
    if (Object.keys(step2Errors).length > 0) return;

    try {
      setIsLoading(true);
      await authService.resetPassword(step2);
      setMessage('비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다.');
      setTimeout(() => router.push('/login'), 900);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <form className="space-y-4" onSubmit={submitStep1}>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={step1.email}
              onChange={(event) => setStep1((prev) => ({ ...prev, email: event.target.value }))}
            />
            {step1Errors.email ? <p className="text-xs text-red-600">{step1Errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">인증번호</Label>
            <Input
              id="code"
              value={step1.code}
              onChange={(event) => setStep1((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="6자리"
            />
            {step1Errors.code ? <p className="text-xs text-red-600">{step1Errors.code}</p> : null}
          </div>

          <Button className="w-full" type="submit" disabled={isLoading || Object.keys(step1Errors).length > 0}>
            {isLoading ? '인증 중...' : '인증 후 다음'}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={submitStep2}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={step2.newPassword}
              onChange={(event) => setStep2((prev) => ({ ...prev, newPassword: event.target.value }))}
            />
            {step2Errors.newPassword ? <p className="text-xs text-red-600">{step2Errors.newPassword}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPasswordConfirm">새 비밀번호 확인</Label>
            <Input
              id="newPasswordConfirm"
              type="password"
              value={step2.newPasswordConfirm}
              onChange={(event) => setStep2((prev) => ({ ...prev, newPasswordConfirm: event.target.value }))}
            />
            {step2Errors.newPasswordConfirm ? (
              <p className="text-xs text-red-600">{step2Errors.newPasswordConfirm}</p>
            ) : null}
          </div>

          <Button className="w-full" type="submit" disabled={isLoading || Object.keys(step2Errors).length > 0}>
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </form>
      )}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

      <p className="text-center text-sm text-slate-600">
        <Link href="/login" className="underline underline-offset-2">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
