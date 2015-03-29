/**
 * Created by Vunb on 3/3/2015.
 */
module.exports = function (grunt) {
  grunt.registerTask('prodFelloin', [
    'compileAssets',
    'concat',
    'uglify',
    'cssmin',
    'sails-linker:prodJs',
    'sails-linker:prodStyles',
    'sails-linker:prodStylesDashboard',
    'sails-linker:prodStylesClientRoom',
    'sails-linker:devTpl',
    'sails-linker:prodJsJade',
    'sails-linker:prodStylesJade',
    'sails-linker:devTplJade',
    'sails-linker:prodJsDashboard',
    'sails-linker:prodJsClientRoom'

  ]);
};
