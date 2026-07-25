module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  // supabase/functions runs on Deno, not this project's Node/Vite toolchain —
  // it's checked separately via `deno check` / `deno test` (see that
  // directory's own deno.json), which understand Deno globals and npm:
  // specifiers that this ESLint config does not.
  ignorePatterns: ['dist', '.eslintrc.cjs', 'supabase/functions'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
