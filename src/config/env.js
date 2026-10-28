require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: process.env.DB_DIALECT || 'postgres',
    usePgMem: process.env.USE_PG_MEM === 'true' || process.env.NODE_ENV === 'test',
  },
};

module.exports = config;
