import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'jangmanal',
  synchronize: (process.env.TYPEORM_SYNC || 'true') === 'true',
}));
