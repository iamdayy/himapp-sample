module.exports = {
  apps: [
    {
      name: 'Himapp',
      port: '3000',
      exec_mode: 'cluster',
      script: './.output/server/index.mjs'
    }
  ]
}