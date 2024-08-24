module.exports = {
  apps: [
    {
      name: 'Himapp',
      port: '3000',
      exec_mode: 'cluster',
      script: 'node ./.output/server/index.mjs'
    }
  ]
}