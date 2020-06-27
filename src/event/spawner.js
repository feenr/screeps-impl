 module.exports = (function(){
   var room = require('room');

   var performSpawns = function(roomName){
     for(var i in Game.rooms){
        if(Game.rooms[i].controller && Game.rooms[i].controller.my){
            room.spawnCreeps(i);
        }
     }
   };
    
    var publicAPI = {};
    publicAPI.performSpawns = performSpawns;
    return publicAPI;
 })();
 
