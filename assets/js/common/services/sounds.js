/**
 * Created by Vunb on 1/11/2014.
 */

angular.module('fello.common')
    .factory('sounds', ['SoundEffectManager' , function (SoundEffectManager) {
        return (function() {
            var sounds = new SoundEffectManager();
            sounds.loadFile('/sounds/online.mp3', 'online');
            sounds.loadFile('/sounds/offline.mp3', 'offline');
            return sounds;
        });
    }])
;
