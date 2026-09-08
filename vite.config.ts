import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `npm run dev` serves plain HTTP on localhost. `npm run dev:phone` runs with
// mode "https", which adds a self-signed cert — browser geolocation only works
// in a secure context, so testing on a phone over the LAN needs HTTPS.
// Vite loads plain `.env` in every mode, so the API key still comes through.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'https' ? [basicSsl()] : [])],
}))
