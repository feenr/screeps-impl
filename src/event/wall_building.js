
module.exports = (function(){
    var utils = require('./utils_misc');
    var settings = require('./utils_settings_registry');
    var logFactory = require('./utils_logger_factory');
    var publicAPI = {};
    var defaultWallSize = 1000;
    var incrementWallSize = 2000;
    var maxWallSize = 900000;
    var SETTING_WALL_SIZE = "WallSize";
    
    publicAPI.storeWalls = function(roomId){
        var wallLocations = [];
        var roomId;
        var room;
        
        if(roomId != "" && roomId != null){
            room = Game.rooms[roomId];
        } else {
            room = utils.getRoom(); 
            roomId = room.name;
        }
        

        var walls = room.find(FIND_STRUCTURES, {filter: utils.isA('constructedWall')});
        for(var i in walls){
            wall = walls[i];
            wallLocation = {x: wall.pos.x, y:wall.pos.y}
            wallLocations.push(wallLocation);
        }
        var wallSites = room.find(FIND_CONSTRUCTION_SITES, {filter: utils.isA('constructedWall')});
        for(var i in wallSites){
            var wallSite = wallSites[i];
            var wallLocation = {x: wallSite.pos.x, y:wallSite.pos.y}
            wallLocations.push(wallLocation);
        }
        
        settings.set("wallPositions",wallLocations, roomId);
    };
    
    publicAPI.constructWalls = function(){
        /**
        Memory.rooms = Memory.rooms || {};
        for(var i in Memory.rooms){
            var wallPositions = settings.get("wallPositions", Game.rooms[i].roomName);
            if(!wallPositions){
                return;
            }
            for(var k = 0; k < wallPositions.length; k++){
                var wallPosition = wallPositions[k];
                room.createConstructionSite(wallPosition.x, wallPosition.y, STRUCTURE_WALL);
            }
        }
        **/
    };
    
    publicAPI.upgradeWalls = function(){
        Memory.rooms = Memory.rooms || {};
        for(var i in Memory.rooms){
            var log = logFactory.getRoomLogger(i).log;
            var wallSize = settings.get(SETTING_WALL_SIZE, i);
            if(typeof(wallSize) == 'undefined' || wallSize == null){
                wallSize = defaultWallSize;
            }

            var repairsNeeded = false;
            var currRoom = Game.rooms[i];
            if(!currRoom){
                // This room in memory is not visible
                continue;
            }

            if(currRoom.find(FIND_MY_CONSTRUCTION_SITES).length > 0){
                log("Construction needs to be done, not upgrading walls.");
                continue;
            }
            
            var existingWalls = currRoom.find(FIND_STRUCTURES, {filter: utils.isA('constructedWall')});
            for(var k = 0; k < existingWalls.length; k++){
                var existingWall = existingWalls[k];
                if(existingWall.hits < wallSize){
                    log("Repairs needed, not upgrading walls.");
                    repairsNeeded = true;
                    break;
                }
            }
            if(existingWalls.length == 0){
                continue;
            }
            if(!repairsNeeded){
                wallSize += incrementWallSize;
                log("New wall size "+ wallSize);
            }
            settings.set(SETTING_WALL_SIZE, wallSize, i);
        }
    };
    return publicAPI;
})();