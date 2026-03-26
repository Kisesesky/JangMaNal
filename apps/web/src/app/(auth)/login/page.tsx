import Link from 'next/link';
import { AuthShell } from '../_component/auth-shell';
import { LoginFormView } from '../_component/login-form';

export default function LoginPage() {
  return (
    <AuthShell
      title="로그인"
      description="이메일/비밀번호 또는 소셜 계정으로 로그인하세요."
      footer={
        <>
          계정이 없다면{' '}
          <Link href="/signup" className="underline underline-offset-2">
            회원가입
          </Link>
        </>
      }
    >
      <LoginFormView />
    </AuthShell>
  );
}
