/**
 * Created by Vunb on 26/1/2015.
 */

module.exports = {
  // index for design --> Must delete if finished
  index: function (req, res) {
    // override the layout to use another
    res.locals.layout = 'clientroom/layout';
    res.view(null, {
      title: "Client Room"
    });
  }
};
