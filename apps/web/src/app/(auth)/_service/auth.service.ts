import type {
  ForgotPasswordStep1Form,
  ForgotPasswordStep2Form,
  LoginForm,
  SignupForm,
} from '../_model/auth.schema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(payload: LoginForm) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('로그인에 실패했습니다.');
    return res.json();
  },

  async signup(payload: SignupForm) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('회원가입에 실패했습니다.');
    return res.json();
  },

  async requestPasswordResetCode(payload: Pick<ForgotPasswordStep1Form, 'email'>) {
    void payload;
    await delay(400);
    return { message: '인증번호를 발송했습니다.' };
  },

  async verifyPasswordResetCode(payload: ForgotPasswordStep1Form) {
    void payload;
    await delay(400);
    return { verified: true };
  },

  async resetPassword(payload: ForgotPasswordStep2Form) {
    void payload;
    await delay(400);
    return { message: '비밀번호가 변경되었습니다.' };
  },
};
