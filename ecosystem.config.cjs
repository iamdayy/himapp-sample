module.exports = {
  apps: [
    {
      name: 'Himapp',
      port: '3000',
      interpreter: 'bun',
      interpreter_args: 'run',
      script: '.output/server/index.mjs'
    }
  ]
}