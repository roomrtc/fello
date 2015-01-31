/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */


module.exports.bootstrap = function(cb) {
  var easyrtc = require("easyrtc");

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)


  //easyrtc.listen(app, sails.hooks.http.server);
  // http://stackoverflow.com/a/24271007
  var easyrtcOptions = {
    //apiPublicFolder: 'js',
    demosEnable: false
  };

  //easyrtc.setOption('apiPublicFolder', 'js');
  easyrtc.listen(sails.hooks.http.app, sails.io, easyrtcOptions);
  cb();
};
