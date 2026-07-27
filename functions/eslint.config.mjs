import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from 'eslint-plugin-jsdoc';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    {
        ignores: ["eslint.config.mjs", "node_modules/**"],
    },
    {
        files: ["**/*.js"],
        extends: compat.extends("eslint:recommended", "google"),

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.commonjs,
            },

            ecmaVersion: 2020,
            sourceType: "module",
        },
        plugins: {
            jsdoc: jsdoc,
        },
        rules: {
            "no-restricted-globals": ["error", "name", "length"],
            "prefer-arrow-callback": "error",
            "valid-jsdoc": "off",
            "require-jsdoc": "off",

            quotes: ["error", "single", {
                allowTemplateLiterals: true,
            }],

            semi: ["error", "never"],
            "jsdoc/require-jsdoc": ["error", {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true,
                },
            }],
        },
    },
    {
        files: ["**/*.spec.*"],

        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },

        rules: {},
    },
])