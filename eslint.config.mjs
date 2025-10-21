// @ts-check
import { Linter } from "eslint"
import eslint from '@eslint/js'
import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'

/** @type {(Linter.Config<Linter.RulesRecord> | { readonly rules: Readonly<Linter.RulesRecord>; } | Linter.FlatConfig)[]} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  // Ignore files
  {
    ignores: ['public/scripts/*', 'scripts/*', '.astro/', 'src/env.d.ts']
  }
]
