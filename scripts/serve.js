const runtime = require('@skypager/node')
const { clear, print, randomBanner } = runtime.cli

runtime.servers.register('app', () => require('../server'))

async function main() {
  clear()
  randomBanner('Skypager')
  print(`Starting Sheets Server`)

  const port = await runtime.networking.findOpenPort(
    parseInt(runtime.argv.port || process.env.PORT || 3000, 10)
  )

  const hostname = runtime.argv.hostname || process.env.HOST || 'localhost'

  const server = runtime.server('app', {
    port,
    hostname,
  })

  if (runtime.argv.open) {
    runtime.opener.openInBrowser(`http://${server.hostname}:${server.port}`)
  }

  await server.start()

  if (runtime.argv.interactive) {
    await runtime.repl('interactive').launch({ server: server, runtime })
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
