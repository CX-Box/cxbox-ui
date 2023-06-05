import {defineConfig} from "rollup";
import typescript from "@rollup/plugin-typescript";
import {apiExtractor} from "rollup-plugin-api-extractor";
import terser from "@rollup/plugin-terser";
import {nodeResolve} from '@rollup/plugin-node-resolve'
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
    plugins: [
      terser()
    ]
  },

  external: ['@reduxjs/toolkit', 'axios', 'rxjs'],
  plugins: [typescript(), nodeResolve(), commonjs(), apiExtractor({configFile: 'api-extractor.json'})]
})

