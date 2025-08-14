module.exports = {
  apps: [{
    name: "admin",
    script: "npm",
    args: "run preview",
    env: {
      NODE_ENV: "production"
    },
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: "2G",
    max_restarts: 10,
    restart_delay: 4000
  }]
}; 