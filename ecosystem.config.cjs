module.exports = {
  apps: [
    {
      name: "awda-records-front",
      script: "start.cjs",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
    },
  ],
};
