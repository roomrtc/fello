module.exports = function (grunt) {
	grunt.registerTask('linkAssets', [
		'sails-linker:devJs',
		'sails-linker:devStyles',
		'sails-linker:devStylesDashboard',
		'sails-linker:devStylesClientRoom',
		'sails-linker:devStylesEmbedDrawer',
		'sails-linker:devTpl',
		'sails-linker:devJsJade',
		'sails-linker:devStylesJade',
		'sails-linker:devTplJade',
		'sails-linker:devJsDashboard',
		'sails-linker:devJsClientRoom'
	]);
};
