/**
 * Created by Vunb on 3.23.2015.
 */
angular.module('fello.common')
  .value('State', {
    WAITING_FOR_CONNECTION: "waiting_for_connection",
    WAITING_FOR_ACCESS: "waiting_for_access",
    WAITING_FOR_ROOM_INFORMATION: "waiting_for_room_information",
    PLEASE_GRANT_ACCESS: "please_grant_access",
    CAMERA_ACCESS_DENIED: "camera_access_denied",
    FIREFOX_CONFIG_ERROR: "firefox_config_error",
    ROOM_LOCKED: "room_locked",
    ROOM_FULL: "room_full",
    READY: "ready",
    DISCONNECTING_CLIENT: "disconnecting_client",
    SPLASH_SCREEN: "splash_screen",
    KICKED: "kicked",
    EXITED: "exited"
  });
