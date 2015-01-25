/**
 * Created by Vunb on 24/1/2015.
 */


module.exports = {
  index: function (req, res) {
    // override the layout to use another
    res.locals.layout = 'dashboard/layout';
    res.view(null, {
      title: "Dashboard"
    });
  }
};

