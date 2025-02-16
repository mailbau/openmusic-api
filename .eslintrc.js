module.exports = {
    "env": {
        "commonjs": true,
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "airbnb-base"
    ],
    "parserOptions": {
        "ecmaVersion": 12
    },
    "rules": {
        "indent": ["error", 4],
        "quotes": ["error", "single"],
        "no-console": "off",
        "no-unused-vars": "warn",
        "no-underscore-dangle": "off",
        "linebreak-style": ["warn", "windows"],
        "prefer-const": [
            "error",
            {
                "destructuring": "all"
            }
        ],
        "max-len": ["error", { "code": 150 }],
        "object-curly-spacing": "warn",
        "comma-dangle": "off",
        "object-curly-newline": "off",
        "operator-linebreak": "off",
        "prefer-template": "off"
    }
}