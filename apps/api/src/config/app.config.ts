import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
}));
