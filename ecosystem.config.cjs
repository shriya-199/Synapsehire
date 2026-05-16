module.exports = {
  apps: [
    {
      name: 'synapsehire-api',
      cwd: './synapsehire-backend',
      script: 'src/server.js',
      instances: process.env.WEB_CONCURRENCY || 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000
      },
      max_memory_restart: '768M',
      kill_timeout: 10000,
      listen_timeout: 10000,
      wait_ready: false,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log'
    }
  ]
};
