/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function(grunt) {

	grunt.config.set('uglify', {
		dist: {
			src: ['.tmp/public/concat/production.js'],
			dest: '.tmp/public/min/production.min.js'
		}, distDashboard: {
			src: ['.tmp/public/concat/production.dashboard.js'],
			dest: '.tmp/public/min/app.dashboard.min.js'
		}, distClientRoom: {
			src: ['.tmp/public/concat/production.clientroom.js'],
			dest: '.tmp/public/min/app.clientroom.min.js'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
};
