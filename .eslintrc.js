module.exports = {
		"env": {
        "browser": true,
				"node": true,
        "es2020": true
    },
		"root": true,
    "extends": "eslint:recommended",
    "globals": {
			"Emojis": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "eqeqeq": "error"
    }
};
