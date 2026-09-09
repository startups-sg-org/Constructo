import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Uma feature esconde a própria implementação e expõe uma API pública
    // pequena (docs/ARCHITECTURE.md); nenhum arquivo aqui dentro deveria
    // conseguir alcançar outra feature, nem pelo alias nem por caminho
    // relativo. app/ continua livre para compor features via @features/*.
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@features/*'],
            message: 'Uma feature não importa de outra feature. Extraia o que for realmente compartilhado para @shared.',
          },
          {
            // Pega qualquer import relativo que atravesse o nome de outra
            // feature (ex.: '../../map/types/obra'), não importa a
            // profundidade: '**' absorve os '../' que vierem antes.
            group: ['**/map/**', '**/navbar/**', '**/sidebar/**'],
            message: 'Uma feature não acessa arquivos internos de outra feature por caminho relativo. Extraia o que for realmente compartilhado para @shared.',
          },
        ],
      }],
    },
  },
])
