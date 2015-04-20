/**
 * Created by Vunb on 4.15.2015.
 */


module.exports = {
  index: function (req, res) {
    // override the layout to use another
    var roomName = req.param('roomName');
    var title = roomName + " - Fello.in";
    //res.locals.layout = 'embed/layout';
    //res.locals.roomName = roomName;

    res.sendfile(sails.config.appPath + '/assets/embed/embed.html');
  }
};

