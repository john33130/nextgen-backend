const sharedRules = {
	'no-return-assign': 0,
	'no-param-reassign': 0,
	'no-plusplus': 0,
	'import/prefer-default-export': 0,
	'no-new': 0,
};

module.exports = {
	extends: ['airbnb-base', 'eslint-config-prettier'],
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	overrides: [
		{
			files: '*.ts',
			extends: ['airbnb-base', 'eslint-config-airbnb-typescript/base', 'eslint-config-prettier'],
			rules: {
				...sharedRules,
			},
		},
	],
	rules: {
		...sharedRules,
	},
};
