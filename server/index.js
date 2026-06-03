import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupApi } from './routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API végpontok
setupApi(app)

// Statikus fájlok kiszolgálása (build után)
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// Minden egyéb útvonalat a React SPA kezel
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Raktárkezelő szerver fut a ${PORT} porton`)
})
