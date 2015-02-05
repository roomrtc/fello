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
    , logLevel: "debug" //"debug"
    , logDateEnable: false
    , roomAutoCreateEnable: true
    , roomDefaultEnable: false
    , updateCheckEnable: true
    , appDefaultName: "fello.serverApp"
    , roomDefaultName: "fello.in_company"
  };

  //easyrtc.setOption('apiPublicFolder', 'js');
  var easyrtcStartup = function (err, pub) {

    if (err) throw err;
    var socketCount = 0;

    // After the server has started, we can still change the default room name
    //rtc.setOption("roomDefaultName", "Felloin");

    // setup easyRtc
    // Creates a new application called fello.serverApp1 with a default room named "fello.in_congtya".
    pub.createApp("fello.serverApp1", null, function (err, appObj) {
      if (err) throw err;
      appObj.createRoom("fello.in_congtya", null, function (err, roomObj) {
        if (err) throw err;
        console.log("Room " + roomObj.getRoomName() + " has been created.");
      });
    });


    // setup easyrtc events
    //easyrtc.events.on('roomCreate', function (appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    //  //pub.util.logDebug("[" + appObj.getAppName() + "]" + (creatorConnectionObj ? "[" + creatorConnectionObj.getEasyrtcid() + "]" : "") + " Test Running func 'onRoomCreate'");
    //  //appObj.createRoom(roomName, roomOptions, callback);
    //  console.log('roomCreate: ' + roomName);
    //});
    //
    var connect = pub.events.defaultListeners.connection;
    var disconnect = pub.events.defaultListeners.disconnect;
    var roomJoin = pub.events.defaultListeners.roomJoin;
    var roomLeave = pub.events.defaultListeners.roomLeave;
    var roomCreate = pub.events.defaultListeners.roomCreate;

    easyrtc.events.on('roomCreate', function (appObj, creatorConnectionObj, roomName, roomOptions, callback) {
      console.log('------>>>>> ROOM CREATE ' + roomName);
      return roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });

    easyrtc.events.on('connection', function (socket, easyrtcid, next) {
      socketCount++;
      console.log('------>>>>> Connection from easyrtcid', easyrtcid);
      return connect(socket, easyrtcid, next);
    });

    easyrtc.events.on('disconnect', function (connectionObj, next) {
      socketCount--;
      console.log('------>>>>> Disconnect from ', connectionObj.getEasyrtcid());
      return disconnect(connectionObj, next);
    });

    easyrtc.events.on('roomJoin', function (connectionObj, roomName, roomParameter, callback) {
      console.log('------>>>>> ROOM JOIN for ', connectionObj.getEasyrtcid());
      // get Room object --> agents --> send notify them
      connectionObj.getApp().room(roomName, function (err, roomObj) {

        if (!err) {
          // notify agent that a client connected and join this room
          roomObj.getConnectionObjects(function (err, connectionObjs) {

            var agents = {};
            var clients = {};
            if (!err) {
              connectionObjs.forEach(function (connection) {

                var client = {};
                client.username = connection.getUsername();
                client.agentField = connection.getFieldSync("isAgent");
                //client.agentField = pub.app
                client.isAgent = connection.getFieldValueSync("isAgent");
                client.easyrtcid = connection.getEasyrtcid();
                if (client.isAgent && client.isAgent == "true") {
                  agents[client.easyrtcid] = client;
                } else {
                  clients[client.easyrtcid] = client;
                }
                easyrtc.events.emit("emitEasyrtcMsg", connection,
                  "clientJoin", { msgData: {
                    socketid:  connectionObj.socket.id
                    , easyrtcid:  client.easyrtcid
                    , clientInfo: client
                  }}, null,
                  function (err) {
                    pub.util.logInfo("clientJoin Event for " + connectionObj.socket.id + " sent to " + connection.socket.id);
                  }
                );

              });
              console.log("room: " + roomName + ", agents: " + JSON.stringify(agents));
              console.log("room: " + roomName + ", clients: " + JSON.stringify(clients));

            } else {
              console.log("Can not get connected connections in room: " + roomName);
            }

          });

        } else {
          // notify not exists room enter
          pub.util.logError(err);
        }


      });


      return roomJoin(connectionObj, roomName, roomParameter, callback);
    });

    easyrtc.events.on('roomLeave', function (connectionObj, roomName, next) {
      console.log('------>>>>> ROOM LEAVE for ', connectionObj.getEasyrtcid());
      return roomLeave(connectionObj, roomName, next);
    });

    // Message handle waiting list (join, leave)

    // EasyRTC listener for handling incoming application messages (not core EasyRTC commands)
    easyrtc.events.on("easyrtcMsg", function (connectionObj, msg, socketCallback, next) {
      // TODO: Check connection application name.
      switch (msg.msgType) {
        case "callAccept":
          connectionObj.getApp().room(roomName, function (err, roomObj) {

            if (!err) {
              // notify agent that a client connected and join this room
              roomObj.getConnectionWithEasyrtcid(banUserEasyid, function (err, connectionObj) {
                easyrtc.events.emit("callAccept", connectionObj, roomName, function (err) {
                  // easyrtc.events.emit("ban", connectionObj, "roomName", function (err) {
                  if (err) {
                    console.log("Error kicking user from room.");
                  }
                  else {
                    console.log("User is kicked from room");
                    // easyrtc.events.emit("ban", connectionObj, "roomName", function (err) {
                  }
                });
              });
            } else {
              // The participant have gone !

            }
          });
              break;
        case "callDeny":
          var banUserEasyid = msg.msgData.easyrtcid;
          var roomName = msg.msgData.roomName;
          connectionObj.getApp().room(roomName, function (err, roomObj) {

            if (!err) {
              // notify agent that a client connected and join this room
              roomObj.getConnectionWithEasyrtcid(banUserEasyid, function (err, connectionObj) {
                easyrtc.events.emit("roomLeave", connectionObj, roomName, function (err) {
                // easyrtc.events.emit("ban", connectionObj, "roomName", function (err) {
                  if (err) {
                    console.log("Error kicking user from room.", err);
                    socketCallback({msgType: 'callDeny', msgData: {message: "Can't kick user", error: err}});
                    next(null);
                  }
                  else {
                    console.log("User is kicked from room");
                    // easyrtc.events.emit("ban", connectionObj, "roomName", function (err) {
                    socketCallback({msgType: 'callDeny', msgData: {message: "User leave out of room " + roomName, error: err}});
                    next(null);
                  }
                });
                easyrtc.events.emit("emitEasyrtcMsg", connectionObj,
                  "callDeny", { msgData: {
                    socketid:  connectionObj.socket.id
                    , easyrtcid:  banUserEasyid
                    , message: "You are kicked by Admin"
                  }}, null,
                  function (err) {
                    pub.util.logInfo("clientJoin Event for " + connectionObj.socket.id + " sent to " + connectionObj.socket.id);
                  }
                );
              });
            } else {
              // The participant have gone !

            }
          });
          break;
        case "callBlock":

              break;
        case "socketCount":
          socketCallback({msgType: 'socketCount', msgData: socketCount}); //nice
          next(null);
          break;
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

    var _notifyJoin = function (connectionObj, msg) {
      easyrtc.events.emit(
        "emitEasyrtcMsg",
        connectionObj,
        "clientDisconnect",
        {disconnectedClient: connectionObj.socket.id},
        null,
        function (err) {
          pub.util.logInfo("Disconnect message for " + connectionObj.socket.id + " sent to " + connectionObj.socket.id);
        }
      );

    };

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

  };

  // startup easyrtc !
  easyrtc.listen(sails.hooks.http.app, sails.io, easyrtcOptions, easyrtcStartup);
  cb();
};
