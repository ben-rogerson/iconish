/// <reference types="vitest" />

import { type AliasOptions } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve as pathResolve } from 'path'
import { compilerOptions } from './tsconfig.json'

// https://github.com/vitejs/vite/issues/88#issuecomment-864348862
const alias: AliasOptions = Object.entries(compilerOptions.paths).reduce(
  (acc, [key, [value]]) => {
    const aliasKey = key.substring(0, key.length - 2)
    const path = value.substring(0, value.length - 2)
    return {
      ...acc,
      [aliasKey]: pathResolve(__dirname, path),
    }
  },
  {}
)

export const plugins = [react()]
export const resolve = { alias }

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  resolve,
  test: {
    // root: "src",
    globals: true,
    environment: 'jsdom',
    testTimeout: 2000,
    setupFiles: pathResolve(__dirname, 'vitest-setup.ts'),
    include: ['**/*.test.tsx', '**/*.test.ts'],
    // coverage: {
    //   enabled: true,
    // },
  },
})
