const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log(`Database connection established successfully. [Engine: ${env.db.usePgMem ? 'PostgreSQL in-memory (pg-mem)' : 'PostgreSQL'}]`);

    // In development or when using in-memory mode, synchronize schema automatically
    if (env.db.usePgMem || env.nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database schema synchronized.');
    }

    const server = app.listen(env.port, () => {
      console.log(`🚀 Healthcare Backend Server is listening on http://localhost:${env.port}`);
      console.log(`📋 API Health Check: http://localhost:${env.port}/api/health`);
    });

    const shutdown = async () => {
      console.log('\nShutting down server gracefully...');
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing database connection:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    return server;
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
