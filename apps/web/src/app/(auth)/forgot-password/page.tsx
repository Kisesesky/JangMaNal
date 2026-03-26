import { AuthShell } from '../_component/auth-shell';
import { ForgotPasswordFormView } from '../_component/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="비밀번호 찾기"
      description="1단계 인증 확인 후 2단계에서 새 비밀번호를 설정합니다."
      footer="인증번호는 메일 발송 기준으로 5분간 유효합니다."
    >
      <ForgotPasswordFormView />
    </AuthShell>
  );
}
