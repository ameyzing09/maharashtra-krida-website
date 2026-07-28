module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  // supabase/functions runs on Deno, not this project's Node/Vite toolchain —
  // it's linted and checked separately via `npm run lint:functions` /
  // `npm run check:functions` (see that directory's own deno.json), which
  // understand Deno globals and npm: specifiers that this ESLint config does
  // not. Both run in CI, so that directory is not unchecked.
  ignorePatterns: ['dist', '.eslintrc.cjs', 'supabase/functions'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'eslint-comments'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // `any` is banned outright, and so is switching the ban off. Without this,
    // a file-level `/* eslint-disable @typescript-eslint/no-explicit-any */`
    // silently reopens the door and CI stays green — which is exactly how the
    // one in eventService.ts survived. Dead directives are caught separately by
    // --report-unused-disable-directives in the lint script.
    'eslint-comments/no-restricted-disable': [
      'error',
      '@typescript-eslint/no-explicit-any',
    ],
  },
}
