js
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const repo = env.VITE_REPO_NAME || '';
  return {
    base: repo ? `/${repo}/` : '/',       // Dynamic base for GitHub Pages!
    server: { port: 5173 }
  };
});