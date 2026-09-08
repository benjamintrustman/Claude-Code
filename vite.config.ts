import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `npm run dev` serves plain HTTP on localhost. `npm run dev:phone` runs with
// mode "https" — browser geolocation only works in a secure context, so
// testing on a phone over the LAN needs HTTPS.
//
// If `bash scripts/setup-certs.sh` has generated an mkcert certificate we use
// it, since your devices trust it and you get no warning. Otherwise we fall
// back to a throwaway self-signed cert, which works but has to be tapped past.
const certDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'certs')
const keyFile = path.join(certDir, 'key.pem')
const certFile = path.join(certDir, 'cert.pem')
const hasLocalCert = fs.existsSync(keyFile) && fs.existsSync(certFile)

export default defineConfig(({ mode }) => {
  const useHttps = mode === 'https'
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(useHttps && !hasLocalCert ? [basicSsl()] : []),
    ],
    server:
      useHttps && hasLocalCert
        ? { https: { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) } }
        : {},
  }
})
