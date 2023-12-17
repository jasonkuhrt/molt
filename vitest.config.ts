import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      ignoreSourceErrors: true,
      enabled: true,
    },
  },
})
