module.exports = {
  apps: [
    {
      name: "zyka",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3005",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
  ],
};
