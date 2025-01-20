/** @type {import('prettier').Config} */
const config = {
    plugins: ['@ianvs/prettier-plugin-sort-imports'],
    importOrder: [
        '^(react/(.*)$)|^(react$)',
        '^(next/(.*)$)|^(next$)',
        '<THIRD_PARTY_MODULES>',
        '',
        '^@/components/ui/(.*)$',
        '^@/components/(.*)$',
        '^@/lib/(.*)$',
        '^@/services/(.*)$',
        '^@/actions/(.*)$',
        '^@/hooks/(.*)$',
        '^@/store/(.*)$',
        '',
        '^[./]',
        '',
        '<TYPES>^(node:)',
        '<TYPES>',
        '<TYPES>^[.]',
    ],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 4,
    arrowParens: 'avoid',
    semi: false,
}

export default config
