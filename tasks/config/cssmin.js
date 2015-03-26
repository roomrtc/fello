/**
 * Compress CSS files.
 *
 * ---------------------------------------------------------------
 *
 * Minifies css files and places them into .tmp/public/min directory.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-cssmin
 */
module.exports = function (grunt) {

  grunt.config.set('cssmin', {
    dist: {
      src: ['.tmp/public/concat/production.css'],
      dest: '.tmp/public/min/production.min.css'
    }, distDashboard: {
      src: ['.tmp/public/concat/production.dashboard.css'],
      dest: '.tmp/public/min/app.dashboard.min.css'
    }, distClientRoom: {
      src: ['.tmp/public/concat/production.clientroom.css'],
      dest: '.tmp/public/min/app.clientroom.min.css'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
};
