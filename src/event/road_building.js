
module.exports = (function(){
    var utils = require('utils_misc');
    var logFactory = require('utils_logger-factory');
    var roomCost;

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
        let viz = room.visual;
        let terrain = new Room.Terrain(room.name);

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

        // Add each point from the N/E/S/W direction paths
        let paths = getExitPaths(room);
        for(let i in paths){
            for(let x in paths[i]){
                let pos = paths[i][x];
                roadLocations.push({x: pos.x, y: pos.y});
            }
        }

        room.setSetting("roadLocations", roadLocations);
    };


    var constructRoads = function(){
        var log = logFactory.getRoomLogger(i).log;
        Memory.rooms = Memory.rooms || {};
        for(var i in Memory.rooms){
            var room = Game.rooms[i];
            if(!room){
                return;
            }
            var roadPositions = room.getSetting("roadLocations");
            // Roads not defined.
            if(!roadPositions){
                return;
            }
            // Don't add new construction sites if there are already 5 or more
            if(room.find(FIND_CONSTRUCTION_SITES).length >= 5){
                return;
            }
            let queuedCount = 0;
            for(var k = 0; k < roadPositions.length; k++){
                let roadPosition = roadPositions[k];
                let result = room.createConstructionSite(roadPosition.x, roadPosition.y, STRUCTURE_ROAD);
                if(result === OK){
                    // Only add 5 new construction sites at a time.
                    if(++queuedCount>5){
                        break;
                    }
                }
            }
            console.log("Created "+queuedCount+ " road construction sites.");
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

        // This removes any roads which have already been built from the queue
        cleanUpRoadLocations(roomName);
    }

    /**
     * Not the actual center, but where all roads should meet.
     */
    function getRoomCenter(room) {
        let spawns = room.find(FIND_MY_SPAWNS);
        if(spawns[0]){
            return spawns[0].pos;
        } else {
            return new RoomPosition(24,24, room.name)
        }
    }

    /**
     * TODO this should consider roads that have been queued but not yet built
     * @returns {PathFinder.CostMatrix}
     */
    function getRoomCostMatrix(roomName){
        if(roomCost){
            return roomCost;
        }
        let room = Game.rooms[roomName];
        let terrain = new Room.Terrain(room.name);
        let costs = new PathFinder.CostMatrix;

        for (let x = 0; x < 50; ++x) {
            for (let y = 0; y < 50; ++y) {
                let posTerrain = terrain.get(x, y);
                if(posTerrain === TERRAIN_MASK_WALL){
                    costs.set(x, y, 255);
                } else if (posTerrain === TERRAIN_MASK_SWAMP){
                    costs.set(x, y, 4);
                } else {
                    costs.set(x, y, 2);
                }
            }
        }

        room.find(FIND_STRUCTURES).forEach(function(struct) {
            if (struct.structureType === STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(struct.pos.x, struct.pos.y, 1);
            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                    !struct.my)) {
                // Can't walk through non-walkable buildings
                costs.set(struct.pos.x, struct.pos.y, 0xff);
            }
        });
        roomCost = costs;
        return roomCost;
    }

    function getExitPaths(room){
        const terrain = new Room.Terrain(room.name);
        const center = getRoomCenter(room);
        const outPaths = {};
        const sides = [
            {
                direction: "north",
                getX: (index) => index,
                getY: () => 0,
            },
            {
                direction: "east",
                getX: () => 49,
                getY: (index) => index,
            },
            {
                direction: "south",
                getX: (index) => index,
                getY: () => 49,
            },
            {
                direction: "west",
                getX: () => 0,
                getY: (index) => index,
            }
        ]
        for(let side in sides){
            let exitExists = false;
            let bestPath = null;
            let bestCost = 100000;
            for(let index = 0; index<50; index++) {
                let x = sides[side].getX(index);
                let y = sides[side].getY(index)
                let terrainType = terrain.get(x, y);
                if (terrainType !== TERRAIN_MASK_WALL) {
                    exitExists = true;
                    let pathData = PathFinder.search(center, room.getPositionAt(x, y), {
                        "maxRooms": 1,
                        "roomCallback": getRoomCostMatrix
                    });
                    if (pathData.incomplete) {
                        break;
                    }
                    if (pathData.cost < bestCost) {
                        bestPath = pathData.path;
                        bestCost = pathData.cost;
                    }
                }
            }
            if(bestPath){
                outPaths[sides[side].direction] = bestPath;
            }
        }
        return outPaths;
    }

    function cleanUpRoadLocations(roomName){
        let room = Game.rooms[roomName];
        let roadLocations = room.getSetting("roadLocations");
        console.log(JSON.stringify(roadLocations));
        for(let i in roadLocations){
            let structures = room.lookForAt(LOOK_STRUCTURES, roadLocations[i].x, roadLocations[i].y);
            let roads = structures.filter((structure) => structure.structureType ===STRUCTURE_ROAD);
            if(roads.length > 0){
                roadLocations.splice(i, 1);
            }
        }
        room.setSetting("roadLocations", roadLocations);
    }

    var publicAPI = {};
    publicAPI.storeRoads = storeRoads;
    publicAPI.constructRoads = constructRoads;
    publicAPI.initializeRoads = initializeRoads;
    publicAPI.cleanUpRoadLocations = cleanUpRoadLocations;
    return publicAPI;
})();
