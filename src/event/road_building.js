
module.exports = (function(){
    var utils = require('utils');
    var storeRoads = function(roomName){
        var roomId;
        var room;
        if(roomName != "" && roomName != null){
            room = Game.rooms[roomName];
            storeRoadsForRoom(room);
        } else {
            for(var i in Game.rooms){
                storeRoadsForRoom(Game.rooms[i]);
            } 
        }

    }
    
    var storeRoadsForRoom = function(room){
        var roadLocations = [];
        roomId = room.name;
        var roads = room.find(FIND_STRUCTURES, {filter:utils.isARoad});
        for(var i in roads){
            road = roads[i];
            roadLocation = {x: road.pos.x, y:road.pos.y}
            roadLocations.push(roadLocation);
        }
        var roadSites = room.find(FIND_CONSTRUCTION_SITES, {filter:utils.isARoad});
        for(var i in roadSites){
            var roadSite = roadSites[i];
            var roadLocation = {x: roadSite.pos.x, y:roadSite.pos.y}
            roadLocations.push(roadLocation);
        }
        
        Memory.rooms = Memory.rooms || {};
        Memory.rooms[roomId] = Memory.rooms[roomId] || {};
        Memory.rooms[roomId].roadPositions = roadLocations;
    }
    
    var constructRoads = function(){
        Memory.rooms = Memory.rooms || {};
        for(var i in Memory.rooms){
            var room = Game.rooms[i];
            console.log("Roads:"+i);
            var roadPositions = Memory.rooms[i].roadPositions;
            if(!roadPositions){
                return;
            }
            for(var k = 0; k < roadPositions.length; k++){
                var roadPosition = roadPositions[k];
                room.createConstructionSite(roadPosition.x, roadPosition.y, STRUCTURE_ROAD);
            }
        }
    }
    
    var publicAPI = {};
    publicAPI.storeRoads = storeRoads;
    publicAPI.constructRoads = constructRoads;
    return publicAPI;
})()