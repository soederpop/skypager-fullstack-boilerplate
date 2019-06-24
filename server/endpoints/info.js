export default function infoEndpoint(app, options, { runtime }) {

  app.get('/info', (req, res) => {
    runtime.info('[APP] INFO Request')
    res.status(200).json({
      cwd: runtime.cwd,
      gitInfo: runtime.gitInfo
    })
  })

  return app
}