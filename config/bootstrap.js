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


module.exports.bootstrap = function (cb) {
  var easyrtc = require("easyrtc");

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)


  //easyrtc.listen(app, sails.hooks.http.server);
  // http://stackoverflow.com/a/24271007
  var easyrtcOptions = {
    //apiPublicFolder: 'js',
    demosEnable: false
    , logLevel: "debug"
    , logDateEnable: false
    , roomAutoCreateEnable: true
    , roomDefaultEnable: false
    , updateCheckEnable: true
    , appDefaultName: "FelloApp"
    , roomDefaultName: "Default"
  };

  //easyrtc.setOption('apiPublicFolder', 'js');
  var easyrtcStartup =  function (err, rtc) {

    if (err) throw err;

    // After the server has started, we can still change the default room name
    rtc.setOption("roomDefaultName", "Felloin");

    // setup easyRtc
    // Creates a new application called MyApp with a default room named "SectorOne".
    rtc.createApp("fello.instantMessaging", null, function (err, appObj) {
      if (err) throw err;
      appObj.createRoom("myRoomName", null, function (err, roomObj) {
        if (err) throw err;
        console.log("Room " + roomObj.getRoomName() + " has been created.");
      });
    });
  };

  // setup easyrtc events
  easyrtc.events.on('roomCreate', function (appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    //pub.util.logDebug("[" + appObj.getAppName() + "]" + (creatorConnectionObj ? "[" + creatorConnectionObj.getEasyrtcid() + "]" : "") + " Test Running func 'onRoomCreate'");
    //appObj.createRoom(roomName, roomOptions, callback);
    console.log('roomCreate: ' + roomName);
  });

  easyrtc.events.on('roomJoin', function (connectionObj, roomName, roomParameter, callback) {
    pub.util.logDebug("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] Running func 'onRoomJoin'");

    // roomParameter is a new field. To ease upgrading we'll just show a warning to server applications which haven't updated
    if (_.isFunction(roomParameter)) {
      pub.util.logWarning("Upgrade notice: EasyRTC roomJoin event called without roomParameter object.");
      callback = roomParameter;
      roomParameter = null;
    }

    connectionObj.joinRoom(roomName, function (err, connectionRoomObj) {
      if (err) {
        callback(err);
        return;
      }
      connectionRoomObj.emitRoomDataDelta(false, function (err, roomDataDelta) {
        // Return connectionRoomObj regardless of if there was a problem sending out the deltas
        callback(null, connectionRoomObj);
      });
    });
  });

  easyrtc.events.on('roomLeave', function () {

  });

  easyrtc.events.on('authenticate', function () {
    console.log('authenticate');
  });

  easyrtc.events.on('authenticated', function () {

  });

  // EasyRTC listener for handling incoming application messages (not core EasyRTC commands)
  easyrtc.events.on("easyrtcMsg", function (connectionObj, msg, socketCallback, next) {
    // TODO: Check connection application name.
    switch (msg.msgType) {
      case "getRoomOccupantCount":
        onGetRoomOccupantCount(connectionObj, msg, socketCallback, next);
        break;
      default:
        // Send all other message types to the default handler
        easyrtc.events.emitDefault("easyrtcMsg", connectionObj, msg, socketCallback, next);
    }
  });


  ////Client Code:
  //easyrtc.sendServerMessage(
  //  "getRoomOccupantCount",
  //  {"room": "default"},
  //  function (msgType, msgData) {
  //    console.log(msgData.roomOccupantCount + " people in room " + msgData.room)
  //  },
  //  function (errorCode, errorText) {
  //    console.log("Error of type " + errorCode)
  //  }
  //);

  // Listener for handing client messages with msgType of "getRoomOccupantCount"
  var onGetRoomOccupantCount = function (connectionObj, msg, socketCallback, next) {
    // TODO: return error if msg.msgData.room does not exist or is not a string
    connectionObj.getApp().getRoomOccupantCount(msg.msgData.room, function (err, roomOccupantCount) {
      if (err) {
        socketCallback(connectionObj.util.getErrorMsg("MSG_REJECT_BAD_ROOM"));
      }
      else {
        var returnMsg = {
          "msgType": "roomOccupantCount",
          "msgData": {
            "room": msg.msgData.room,
            "roomOccupantCount": roomOccupantCount
          }
        };
        socketCallback(returnMsg);
      }
      next(null);
    });
  };


  // startup easyrtc !
  easyrtc.listen(sails.hooks.http.app, sails.io, easyrtcOptions, easyrtcStartup);
  cb();
};
