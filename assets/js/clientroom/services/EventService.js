/**
 * Created by Vunb on 16/2/2015.
 */
angular.module("fello.clientroom").factory("Event", function () {
  return {
    STATE_CHANGED: "state_changed",
    LOCAL_CAMERA_TOGGLED: "local_camera_toggled",
    LOCAL_MICROPHONE_TOGGLED: "local_microphone_toggled",
    LOCAL_SCREENSHARE_TOGGLED: "local_screenshare_toggled",
    CLIENT_LEFT: "client_left",
    NEW_CLIENT: "new_client",
    KNOCK_ACCEPTED: "knock_accepted",
    OWNERS_CHANGED: "owners_changed",
    CLIENT_KICKED: "client_kicked",
    PROMPT_FOR_ROOM_EMAIL: "prompt_for_room_email",
    IN_ROOM_NOTIFICATION_CHANGED: "in_room_notification_changed",
    EXTENSION_INSTALL: "extension_install",
    KNOCKER_STATUS_CHANGED: "knocker_status_change",
    CLIENT_METADATA_RECEIVED: "client_metadata_received",
    CONTACTS_UPDATED: "contacts_updated",
    MEDIA_SHARE: "media_share",
    ROOM_JOINED: "room_joined",
    LEAVE_ROOM: "leave_room"
  }
});
