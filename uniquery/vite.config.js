import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'src/data/chatKnowledge.js',
        'src/components/EligibilityCalculatorModal.jsx',
        'src/components/CompareView.jsx',
        'src/components/ExploreWizard.jsx',
        'src/components/ExploreResults.jsx',
        'src/components/NoticesView.jsx',
        'src/App.jsx'
      ]
    }
  }
})
