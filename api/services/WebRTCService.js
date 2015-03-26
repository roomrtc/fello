/**
 * Created by Vunb on 3.19.2015.
 */
var _ = require("lodash")
  , easyrtc = require("easyrtc")
  , promise = require("bluebird")
  , async = require("async")
  ;

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
  , roomDefaultEnable: false // true --> fello Room supporter
  , updateCheckEnable: true
  , appDefaultName: "fello.serverApp"
  , roomDefaultName: "fello.in_company"
};

//easyrtc.setOption('apiPublicFolder', 'js');
var webRtcService = {
//module.exports = {
  easyrtcStartup: function (err, pub) {

    if (err) throw err;
    var socketCount = 0;
    var thisObj = this;

    // After the server has started, we can still change the default room name
    //rtc.setOption("roomDefaultName", "Felloin");

    // setup easyRtc
    // Creates a new application called fello.serverApp1 with a default room named "fello.in_congtya".
    //pub.createApp("fello.serverApp1", null, function (err, appObj) {
    //  if (err) throw err;
    //  appObj.createRoom("fello.in_congtya", null, function (err, roomObj) {
    //    if (err) throw err;
    //    console.log("Room " + roomObj.getRoomName() + " has been created.");
    //  });
    //});


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
    var msgTypeSetRoomApiField = pub.events.defaultListeners.msgTypeSetRoomApiField;

    // onMsgTypeSetRoomApiField

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
      console.log('------>>>>> Disconnect from ', connectionObj && connectionObj.getEasyrtcid());
      return disconnect(connectionObj, next);
    });

    easyrtc.events.on('roomJoin', function (connectionObj, roomName, roomParameter, callback) {
      console.log('------>>>>> ROOM JOIN for ', connectionObj && connectionObj.getEasyrtcid());
      var agents = {};
      var clients = {};
      var listAllClients = {};
      var listConnections = {};
      var newClient = {};
      newClient.userName = connectionObj.getUsername();
      newClient.easyrtcid = connectionObj.getEasyrtcid();
      newClient.socketid = connectionObj.socket.id;
      // get Room from App !! --> agents --> send notify them
      connectionObj.getApp().room(roomName, function (err, roomObj) {
        if (!err) {
          // notify agent that a client connected and join this room
          roomObj.getConnectionObjects(function (err, connectionObjs) {

            if (!err) {
              connectionObjs.forEach(function (connection) {

                var clientApiField = (connection.getFieldValueSync("clientApiField") || {}).field;
                var isAgent = webRtcService.getFieldValue(clientApiField, "isAgent")
                  , clientName = webRtcService.getFieldValue(clientApiField, "clientName")
                  , userName = connection.getUsername()
                  , rtcid = connection.getEasyrtcid()
                  , socketid = connection.socket.id
                  , client = {}
                  ;

                client.username = userName;
                client.name = clientName;
                client.isAgent = isAgent;
                client.easyrtcid = rtcid;
                client.socketid = socketid;
                listAllClients[client.easyrtcid] = client;
                listConnections[client.easyrtcid] = connection;
                if (client.isAgent) {
                  agents[client.easyrtcid] = client;
                } else {
                  clients[client.easyrtcid] = client;
                }
              });
            } else {
              console.log("Can not get connected connections in room: " + roomName);
            }
          });
          var clientApiField = (connectionObj.getFieldValueSync("clientApiField") || {}).field;
          newClient.isAgent = webRtcService.getFieldValue(clientApiField, "isAgent");
          newClient.clientName = webRtcService.getFieldValue(clientApiField, "clientName");
          listAllClients[newClient.easyrtcid] = newClient;
          listConnections[newClient.easyrtcid] = connectionObj;
          console.log("room: " + roomName + ", listAllClients: " + JSON.stringify(listAllClients));
          //Notify
          _.forEach(listConnections, function (connection, key) {
            var client = listAllClients[key];
            var msgData = {
              me: client
              , listAgent: agents
              , listClient: clients
              , newClient: newClient
            };
            if (!client.isAgent) {
              delete client.clients;
            }
            easyrtc.events.emit("emitEasyrtcMsg", connection,
              "clientJoin", {
                msgData: msgData
              }, null,
              function (err) {
                pub.util.logInfo("clientJoin Event for " + connectionObj.socket.id + " sent to " + connection.socket.id);
              }
            );
          });

        } else {
          // notify not exists room enter
          pub.util.logError(err);
        }


      });

      return roomJoin(connectionObj, roomName, roomParameter, callback);
    });

    easyrtc.events.on('roomLeave', function (connectionObj, roomName, next) {

      console.log('------>>>>> ROOM LEAVE for ', connectionObj && connectionObj.getEasyrtcid());
      return roomLeave(connectionObj, roomName, next);
    });

    easyrtc.events.on('msgTypeSetRoomApiField', function (connectionObj, roomApiFieldObj, socketCallback, next) {
      console.log('------>>>>> SET ROOM API FIELD for ', connectionObj && connectionObj.getEasyrtcid());
      connectionObj.setField("clientApiField", roomApiFieldObj, false);
      return msgTypeSetRoomApiField(connectionObj, roomApiFieldObj, socketCallback, next);
    });

    // Message handle waiting list (join, leave)

    // EasyRTC listener for handling incoming application messages (not core EasyRTC commands)
    easyrtc.events.on("easyrtcMsg", function (connectionObj, msg, socketCallback, next) {
      // TODO: Check connection application name.
      if (!_.isFunction(next)) {
        next = pub.util.nextToNowhere;
      }

      if (!_.isFunction(socketCallback)) {
        pub.util.logWarning("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] EasyRTC message received with no callback. Ignoring message.", msg);
        return;
      }


      switch (msg.msgType) {
        case "chatMessage":
          var fromClientId = msg.msgData.fromClientId;
          var fromClientMsg = msg.msgData.message;
          var toAdminId = msg.msgData.toAdminId;
          var roomName = msg.msgData.roomName;
          connectionObj.getApp().room(roomName, function (err, roomObj) {

            if (!err) {

              if (toAdminId) {
                // send directly to admin with id
                return;
              }

              // else: get all connection in room
              roomObj.getConnectionObjects(function (err, connectionObjs) {

                if (!err) {
                  connectionObjs.forEach(function (connection) {

                    var msgData = {
                      fromClientId: fromClientId,
                      timeSent: new Date().getTime(),
                      message: fromClientMsg
                    };
                    easyrtc.events.emit("emitEasyrtcMsg", connection,
                      "prevMessage", {
                        msgData: msgData
                      }, null,
                      function (err) {
                        pub.util.logError(err);
                      }
                    );

                  });

                } else {
                  console.log("Can not get connected connections in room: " + roomName);
                }

              });

            } else {
              // notify not exists room enter
              pub.util.logError(err);
            }
          });
          break;

        case "message": // easyrtc.sendDataWS(dest, "message", text, function (reply) {
          async.waterfall([
              function (asyncCallback) {
                // Check message structure
                pub.util.isValidIncomingMessage("easyrtcMsg", msg, connectionObj.getApp(), asyncCallback);
              },

              function (isMsgValid, msgErrorCode, asyncCallback) {
                // If message structure is invalid, send error, and write to log
                if (!isMsgValid) {
                  socketCallback(pub.util.getErrorMsg(msgErrorCode));
                  pub.util.logWarning("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] EasyRTC message received with invalid message format [" + msgErrorCode + "].", msg);
                  return;
                }
                asyncCallback(null);
              },
              function (asyncCallback) {

                // test targetEasyrtcid (if defined). Will prevent client from sending to themselves
                if (msg.targetEasyrtcid !== undefined && msg.targetEasyrtcid == connectionObj.getEasyrtcid()) {
                  socketCallback(pub.util.getErrorMsg("MSG_REJECT_TARGET_EASYRTCID"));
                  pub.util.logWarning("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] EasyRTC message received with improper targetEasyrtcid", msg);
                  return;
                }

                // Determine if sending message to single client, an entire room, or an entire group
                if (msg.targetEasyrtcid !== undefined) {
                  // Relay a message to a single client
                  var outgoingMsg = {
                    senderEasyrtcid: connectionObj.getEasyrtcid(),
                    targetEasyrtcid: msg.targetEasyrtcid,
                    msgType: msg.msgType,
                    msgData: msg.msgData
                  };
                  var targetConnectionObj = {};

                  async.waterfall([
                      function (asyncCallback) {
                        // getting connection object for targetEasyrtcid
                        connectionObj.getApp().connection(msg.targetEasyrtcid, asyncCallback);
                      },
                      function (newTargetConnectionObj, asyncCallback) {
                        targetConnectionObj = newTargetConnectionObj;

                        // TODO: Add option to restrict users not in same room from sending messages to users in room

                        // Handle targetRoom (if present)
                        if (msg.targetRoom) {
                          targetConnectionObj.isInRoom(msg.targetRoom, function (err, isAllowed) {
                            if (err || !isAllowed) {
                              socketCallback(pub.util.getErrorMsg("MSG_REJECT_TARGET_ROOM"));
                              pub.util.logWarning("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] EasyRTC message received with improper target room", msg);
                              return;
                            }
                            outgoingMsg.targetRoom = msg.targetRoom;
                            asyncCallback(null);
                          });
                        }
                        else {
                          asyncCallback(null);
                        }
                      },

                      function (asyncCallback) {
                        // Handle targetGroup (if present)
                        if (msg.targetGroup) {
                          targetConnectionObj.isInGroup(msg.targetGroup, function (err, isAllowed) {
                            if (err || !isAllowed) {
                              socketCallback(pub.util.getErrorMsg("MSG_REJECT_TARGET_GROUP"));
                              pub.util.logWarning("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] EasyRTC message received with improper target group", msg);
                              return;
                            }
                            outgoingMsg.targetGroup = msg.targetGroup;
                            asyncCallback(null);
                          });
                        }
                        else {
                          asyncCallback(null);
                        }
                      },

                      function (asyncCallback) {
                        pub.events.emit("emitEasyrtcMsg", targetConnectionObj, msg.msgType, outgoingMsg, null, asyncCallback);
                      }

                    ],
                    function (err) {
                      if (err) {
                        socketCallback(pub.util.getErrorMsg("MSG_REJECT_GEN_FAIL"));
                        pub.util.logError("[" + connectionObj.getEasyrtcid() + "] General message error. Message ignored.", err);
                      } else {
                        socketCallback({msgType: 'ack'});
                      }
                    });
                }

                else if (msg.targetRoom) {
                  // Relay a message to one or more clients in a room

                  var outgoingMsg = {
                    senderEasyrtcid: connectionObj.getEasyrtcid(),
                    targetRoom: msg.targetRoom,
                    msgType: msg.msgType,
                    msgData: msg.msgData
                  };

                  var targetRoomObj = null;

                  async.waterfall([
                      function (asyncCallback) {
                        // get room object
                        connectionObj.getApp().room(msg.targetRoom, asyncCallback);
                      },

                      function (newTargetRoomObj, asyncCallback) {
                        targetRoomObj = newTargetRoomObj;

                        // get list of connections in the room
                        targetRoomObj.getConnections(asyncCallback);
                      },

                      function (connectedEasyrtcidArray, asyncCallback) {
                        for (var i = 0; i < connectedEasyrtcidArray.length; i++) {
                          // Stop client from sending message to themselves
                          if (connectedEasyrtcidArray[i] == connectionObj.getEasyrtcid()) {
                            continue;
                          }

                          connectionObj.getApp().connection(connectedEasyrtcidArray[i], function (err, targetConnectionObj) {
                            if (err) {
                              return;
                            }

                            // Do we limit by group? If not the message goes out to all in room
                            if (msg.targetGroup) {
                              targetConnectionObj.isInGroup(msg.targetGroup, function (err, isAllowed) {
                                if (isAllowed) {
                                  pub.events.emit("emitEasyrtcMsg", targetConnectionObj, msg.msgType, outgoingMsg, null, pub.util.nextToNowhere);
                                }
                              });
                            }
                            else {
                              pub.events.emit("emitEasyrtcMsg", targetConnectionObj, msg.msgType, outgoingMsg, null, pub.util.nextToNowhere);
                            }
                          });
                        }
                        asyncCallback(null);
                      }
                    ],
                    function (err) {
                      if (err) {
                        socketCallback(pub.util.getErrorMsg("MSG_REJECT_TARGET_ROOM"));
                      }
                      else {
                        socketCallback({msgType: 'ack'});
                      }
                    });

                }

                else if (msg.targetGroup) {
                  // Relay a message to one or more clients in a group
                  var targetGroupObj = null;

                  var outgoingMsg = {
                    senderEasyrtcid: connectionObj.getEasyrtcid(),
                    targetGroup: msg.targetGroup,
                    msgType: msg.msgType,
                    msgData: msg.msgData
                  };

                  async.waterfall([
                      function (asyncCallback) {
                        // get group object
                        connectionObj.getApp().group(msg.targetGroup, asyncCallback);
                      },

                      function (newTargetGroupObj, asyncCallback) {
                        targetGroupObj = newTargetGroupObj;

                        // get list of connections in the group
                        targetGroupObj.getConnections(asyncCallback);
                      },

                      function (connectedEasyrtcidArray, asyncCallback) {
                        for (var i = 0; i < connectedEasyrtcidArray.length; i++) {
                          // Stop client from sending message to themselves
                          if (connectedEasyrtcidArray[i] == connectionObj.getEasyrtcid()) {
                            continue;
                          }

                          connectionObj.getApp().connection(connectedEasyrtcidArray[i], function (err, targetConnectionObj) {
                            if (err) {
                              return;
                            }
                            pub.events.emit("emitEasyrtcMsg", targetConnectionObj, msg.msgType, outgoingMsg, null, pub.util.nextToNowhere);
                          });
                        }
                        asyncCallback(null);
                      }
                    ],
                    function (err) {
                      if (err) {
                        socketCallback(pub.util.getErrorMsg("MSG_REJECT_TARGET_GROUP"));
                      }
                      else {
                        socketCallback({msgType: 'ack'});
                      }
                    });

                }
                else {
                  pub.util.logWarning("[" + connectionObj.getAppName() + "][" + connectionObj.getEasyrtcid() + "] EasyRTC message received without targetEasyrtcid or targetRoom", msg);
                  next(null);
                }
              }
            ],
            function (err) {
              if (err) {
                socketCallback(pub.util.getErrorMsg("MSG_REJECT_GEN_FAIL"));
                pub.util.logError("[" + connectionObj.getEasyrtcid() + "] General message error. Message ignored.", err);
              }
            });
          break;
        case "callAccept":
          var clientEasyrtcid = msg.msgData.easyrtcid;
          var roomName = msg.msgData.roomName;
          connectionObj.getApp().room(roomName, function (err, roomObj) {

            if (!err) {
              // notify agent that a client connected and join this room
              roomObj.getConnectionWithEasyrtcid(clientEasyrtcid, function (err, connectionObj) {
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
        case "callDrop":
          var dropEasyrtcid = msg.msgData.easyrtcid;
          var roomName = msg.msgData.roomName;
          //connectionObj.getApp().room(roomName, function (err, roomObj) {
          connectionObj.room(roomName, function (err, connectionRoomObj) {

            if (!err) {
              // notify agent that a client connected and join this room
              connectionRoomObj.getRoom().getConnectionWithEasyrtcid(dropEasyrtcid, function (err, connectionObj) {
                connectionObj.room(roomName, function (err, connectionRoomObj) {
                  if (!err) {
                    connectionRoomObj.leaveRoom(next);
                    socketCallback({
                      msgType: 'callDrop',
                      msgData: {message: "User leave out of room " + roomName, roomName: roomName, error: err}
                    });
                  } else {
                    console.log("Error drop user from room. ", err);
                    socketCallback({
                      msgType: 'callDrop',
                      msgData: {message: "Can't kick user", roomName: roomName, error: err}
                    });
                    next(null);
                  }
                });

                //easyrtc.events.emit("roomLeave", connectionObj, roomName, function (err) {
                //  // easyrtc.events.emit("ban", connectionObj, "roomName", function (err) {
                //  if (err) {
                //    console.log("Error drop user from room. ", err);
                //    socketCallback({msgType: 'callDrop', msgData: {message: "Can't kick user", error: err}});
                //    next(null);
                //  }
                //  else {
                //    console.log("User is drop from room");
                //    socketCallback({
                //      msgType: 'callDrop',
                //      msgData: {message: "User leave out of room " + roomName, error: err}
                //    });
                //    next(null);
                //  }
                //});
                easyrtc.events.emit("emitEasyrtcMsg", connectionObj,
                  "callDrop", {
                    msgData: {
                      socketid: connectionObj.socket.id
                      , easyrtcid: dropEasyrtcid
                      , message: "You are dropped by Admin"
                      , roomName: roomName
                    }
                  }, null,
                  function (err) {
                    pub.util.logInfo("callDrop Event for " + connectionObj.socket.id + " sent to " + connectionObj.socket.id);
                  }
                );
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
                    socketCallback({
                      msgType: 'callDeny',
                      msgData: {message: "User leave out of room " + roomName, error: err}
                    });
                    next(null);
                  }
                });
                easyrtc.events.emit("emitEasyrtcMsg", connectionObj,
                  "callDeny", {
                    msgData: {
                      socketid: connectionObj.socket.id
                      , easyrtcid: banUserEasyid
                      , message: "You are kicked by Admin"
                    }
                  }, null,
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

  }, $init: function () {
    // startup easyrtc !
    easyrtc.listen(sails.hooks.http.app, sails.io, easyrtcOptions, this.easyrtcStartup);
  }, getFieldValue: function (field, fieldName) {
    return field && field[fieldName] && field[fieldName].fieldValue;
  }
};

//webRtcService.$init();
module.exports = webRtcService;
