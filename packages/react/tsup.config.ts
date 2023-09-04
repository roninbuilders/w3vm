import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'es2021',
  splitting: true,
  clean: true,
  bundle: true,
  dts: true,
})