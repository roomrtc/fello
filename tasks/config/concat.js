/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-concat
 */
module.exports = function(grunt) {

	grunt.config.set('concat', {
		js: {
			src: require('../pipeline').jsFilesToInject,
			dest: '.tmp/public/concat/production.js'
		},
		jsDashboard: {
			src: require('../pipeline').jsFilesToInjectDashboard,
			dest: '.tmp/public/concat/production.dashboard.js'
		},
		jsClientRoom: {
			src: require('../pipeline').jsFilesToInjectClientRoom,
			dest: '.tmp/public/concat/production.clientroom.js'
		},
		css: {
			src: require('../pipeline').cssFilesToInject,
			dest: '.tmp/public/concat/production.css'
    },
    cssDashboard: {
      src: require('../pipeline').cssFilesToInjectDashboard,
      dest: '.tmp/public/concat/production.dashboard.css'
    },
    cssClientRoom: {
      src: require('../pipeline').cssFilesToInjectClientRoom,
      dest: '.tmp/public/concat/production.clientroom.css'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
};
