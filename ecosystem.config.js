module.exports = {
  apps: [
    {
      name: "plen",
      script: "npm",
      args: "start",
      env: {
        PORT: 4049,
        NODE_ENV: "production",
      },
      env_production: {
        PORT: 4049,
        NODE_ENV: "production",
      }
    }
  ]
};
