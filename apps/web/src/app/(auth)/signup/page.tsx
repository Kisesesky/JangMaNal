import Link from 'next/link';
import { AuthShell } from '../_component/auth-shell';
import { SignupFormView } from '../_component/signup-form';

export default function SignupPage() {
  return (
    <AuthShell
      title="회원가입"
      description="이메일 인증과 약관 동의를 통해 계정을 생성합니다."
      footer={
        <>
          이미 계정이 있다면{' '}
          <Link href="/login" className="underline underline-offset-2">
            로그인
          </Link>
        </>
      }
    >
      <SignupFormView />
    </AuthShell>
  );
}
