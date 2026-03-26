import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
});

export const signupSchema = z
  .object({
    profileImageUrl: z.string().url().optional().or(z.literal('')),
    email: z.string().email('유효한 이메일을 입력해주세요.'),
    code: z.string().length(6, '인증번호 6자리를 입력해주세요.'),
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
    phoneNumber: z.string().min(9, '전화번호를 입력해주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirm: z.string().min(8, '비밀번호 확인을 입력해주세요.'),
    agreeTerms: z.boolean().refine((v) => v, '약관 동의가 필요합니다.'),
    agreePrivacy: z.boolean().refine((v) => v, '개인정보 동의가 필요합니다.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

export const forgotPasswordStep1Schema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  code: z.string().length(6, '인증번호 6자리를 입력해주세요.'),
});

export const forgotPasswordStep2Schema = z
  .object({
    newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다.'),
    newPasswordConfirm: z.string().min(8, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ['newPasswordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotPasswordStep1Form = z.infer<typeof forgotPasswordStep1Schema>;
export type ForgotPasswordStep2Form = z.infer<typeof forgotPasswordStep2Schema>;
