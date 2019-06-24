const runtime = require('@skypager/node')
const { clear, print, randomBanner } = runtime.cli

runtime.servers.register('app', () => require('../server'))

async function main() {
  clear()
  randomBanner('Skypager')
  print(`🚀 Starting Fullstack Application`)

  const port = await runtime.networking.findOpenPort(
    parseInt(runtime.argv.port || process.env.PORT || 3000, 10)
  )

  const hostname = runtime.argv.hostname || process.env.HOST || 'localhost'

  /** 
   * This will look for any module in server/endpoints/*.js.  
   * 
   * It expects that each module will export a default function that gets passed the express app.
  */
  const endpoints = await runtime.fsx.readdirAsync(runtime.resolve('server', 'endpoints'))

  endpoints.forEach((file) => {
    runtime.endpoints.register(file.replace('.js', ''), () => require(runtime.resolve('server', 'endpoints', file)))
  })

  const server = runtime.server('app', {
    port,
    hostname,
    endpoints: 'all',
    enableLogging: true,
    showBanner: false
  })

  if (runtime.argv.open) {
    runtime.opener.openInBrowser(`http://${server.hostname}:${server.port}`)
  }

  await server.start()

  if (runtime.argv.interactive) {
    await runtime.repl('interactive').launch({ server: server, runtime })
  } else {
    const endpoints = server.tryGet('endpoints', [])
    print(`Server is listening on ${server.hostname}:${server.port}`)  
    
    if (endpoints && endpoints.length) {
      print(`Server endpoints:`)
      runtime.endpoints.available.forEach((endpoint) => {
        const enabled = (endpoints === 'all' || endpoints.indexOf(endpoint) > -1)
        if (enabled) {
          print(`✅  ${endpoint}`, 4)
        } else {
          print(`⭕️  ${endpoint} (not enabled)`, 4)
        }
      })
    }
  }
}

async function setupDevelopment() {

}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
