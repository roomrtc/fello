/**
 * Created by Vunb on 3/4/2015.
 */
/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 * 		https://github.com/Zolmeister/grunt-sails-linker
 *
 */
module.exports = function(grunt) {

  grunt.config.set('asset-linker', {

  });

  grunt.loadNpmTasks('grunt-asset-linker');
};
