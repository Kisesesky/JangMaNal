import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),
  port: parseInt(process.env.PORT || '3001', 10),
  frontendBaseUrl: process.env.FRONTEND_BASE_URL,
}));