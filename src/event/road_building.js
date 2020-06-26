
module.exports = (function(){
    var utils = require('utils_misc');
    var logFactory = require('utils_logger-factory');
    var storeRoads = function(roomName){
        var room;
        if(roomName != "" && roomName != null){
            room = Game.rooms[roomName];
            storeRoadsForRoom(room);
        } else {
            for(var i in Game.rooms){
                storeRoadsForRoom(Game.rooms[i]);
            }
        }

    };

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
    };

    var constructRoads = function(){
        var log = logFactory.getRoomLogger(i).log;
        Memory.rooms = Memory.rooms || {};
        for(var i in Memory.rooms){
            var room = Game.rooms[i];
            log("Roads reviewed");
            var roadPositions = Memory.rooms[i].roadPositions;
            if(!roadPositions){
                return;
            }
            for(var k = 0; k < roadPositions.length; k++){
                var roadPosition = roadPositions[k];
                room.createConstructionSite(roadPosition.x, roadPosition.y, STRUCTURE_ROAD);
            }
        }
    };

    var initializeRoads = function(roomName){
        var room = Game.rooms[roomName];
        var defaultSpawn = room.getMySpawns()[0];
        var path = room.findPath(defaultSpawn.pos, room.controller.pos, {ignoreCreeps: true, maxRooms:1});
        path.forEach(function(step){
            room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
        });

        room.getSources().forEach(function(source){
            path = room.findPath(defaultSpawn.pos, source.pos, {ignoreCreeps: true, maxRooms:1});
            path.forEach(function(step){
                room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
            });
        });

        var spawnPos = defaultSpawn.pos;
        for(var x = spawnPos.x-1; x <= spawnPos.x+1; x++){
            for(var y = spawnPos.y; y <= spawnPos.y+1; y++){
                if(x == spawnPos.x && y == spawnPos.y){
                    continue;
                }
                room.createConstructionSite(x, y, STRUCTURE_ROAD);
            }
        }
    }

    var publicAPI = {};
    publicAPI.storeRoads = storeRoads;
    publicAPI.constructRoads = constructRoads;
    publicAPI.initializeRoads = initializeRoads;
    return publicAPI;
})();