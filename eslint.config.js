import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,  // disables ESLint rules that conflict with Prettier
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'warn',  // shows Prettier issues as warnings
    },
  }
)