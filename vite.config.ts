import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Read VITE_REPO_NAME from .env or GitHub Actions 
  const env = loadEnv(mode, '.', '')
  const repo = env.VITE_REPO_NAME || ''

  return {
    base: repo ? `/${repo}/` : '/',
    server: { port: 5173 },
  }
})
