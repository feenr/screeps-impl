module.exports = function(nodeId){
    var settings = require('settings_registry');
    var utils = require('utils_misc');
    var id = nodeId;
    var node = Game.getObjectById(nodeId);
    var room = node.room;
    var roomName = node.room.name;
    let log = room.getLogger();
    var roomId = room.name;

    //Stored in memory
    var targetEnergyStore;
    var targetHarvesterCount;
    var targetMinerCount;
    var harvesterList;
    var minerList;

    // perform();

    function perform(){
        getFromMemory();

        // Remove all dead harvesters
        for(var i in harvesterList){
            if(!Game.getObjectById(harvesterList[i])){
                harvesterList.splice(i, 1);
            }
        }

        if(settings.get("disabled", roomId)){
            return;
        }

        // Check if the energy store is not defined or invalid
        if(!targetEnergyStore || !Game.getObjectById(targetEnergyStore)){
            // Find an appropriate energy store
            Memory.rooms[roomId].harvestGroups[nodeId].targetEnergyStore = findNearestEnergyStore();
        }

        // If we don't have enough harvesters on this node, find
        // an idle one and assign it.
        if(harvesterList.length < targetHarvesterCount){
            var harvester = findUnassignedHarvester();
            if(harvester){
                addHarvester(harvester);
            } else {
                var parentRoomName = settings.get("ParentRoom", roomId);
                if(parentRoomName){
                    var parentRoom = Game.rooms[parentRoomName];
                    if(parentRoom){
                        var queue = parentRoom.getSpawnQueue();
                        var queueRequest = {role: "harvester", memory: {room: roomId}};

                        if (queue.containsCount(queueRequest) < 1 && !parentRoom.hasInvaders()) {
                            log("Requesting a harvester");
                            queue.push(queueRequest);
                        }
                    }
                }
            }
        }
    }

    function findUnassignedHarvester(){
        for(var i in Game.creeps){
            var harvester = Game.creeps[i];
            if(harvester.memory.role != 'harvester'){
                continue;
            }
            // cheap way of seeing if a room has spawns,
            // although not 100% accurate.
            if(room.controller.my){
                // If this room has a spawn, only choose from creeps already in the room.
                if(harvester.room != room){
                    continue;
                }
                // Don't choose harvesters that belong to other rooms.
                if(harvester.memory.room != room.name){
                    continue;
                }
            } else {
                if(harvester.memory.room != room.name){
                    continue;
                }
            }

            if(!harvester.memory.targetNode || harvester.memory.targetNode == ''){
                return harvester;
            }
        }
    }

    function findNearestEnergyStore(){
        var structures = room.find(FIND_STRUCTURES);
        var options = [];
        for(var i in structures){
            var structure = structures[i];
            if(structure.energyCapacity > 0 ){
                options.push(structure);
            }
        }
        var closest = node.pos.findClosestByRange(options);
        if(closest){
            return closest.id;
        }

        if(closest == null){
            var parentRoom = room.getParentRoom();
            if(parentRoom){
                if(parentRoom.storage){
                    return parentRoom.storage.id;
                } else {
                    var spawn = parentRoom.getMySpawns()[0];
                    if(spawn){
                        return spawn.id;
                    }
                }
            }
        }
        return null;
    }
    
    function addHarvester(creep, index){
        Memory.creeps[creep.name].targetNode = id;
        if(typeof(index) == 'undefined'){
            index = harvesterList.length;
        } 
        harvesterList[index] = creep.id; 
    }
    
    function getFromMemory(){
        Memory.rooms[roomId].harvestGroups = Memory.rooms[roomId].harvestGroups || {};
        if(!Memory.rooms[roomId].harvestGroups[nodeId]){
            initialize();
        }
        Memory.rooms[roomId].harvestGroups[nodeId] = Memory.rooms[roomId].harvestGroups[nodeId] || {};
        Memory.rooms[roomId].harvestGroups[nodeId].harvesterList = Memory.rooms[roomId].harvestGroups[nodeId].harvesterList || [];
        //Memory.rooms[roomId].harvestGroups[nodeId].targetHarvesterCount = Memory.rooms[roomId].harvestGroups[nodeId].targetHarvesterCount || 1;
        harvesterList = Memory.rooms[roomId].harvestGroups[nodeId].harvesterList;
        targetEnergyStore = Memory.rooms[roomId].harvestGroups[nodeId].targetEnergyStore;
        targetHarvesterCount = Memory.rooms[roomId].harvestGroups[nodeId].targetHarvesterCount
    }
    
    function debugTable(){
        var node = Game.getObjectById(id);
        for(var i in harvesterList){
            var harvesterId = harvesterList[i];
            var harvester = Game.getObjectById(harvesterId);
            console.log(harvesterId + " : "+ harvester.name + "["+harvester.pos.x+", "+harvester.pos.y+"]");
        }
    }

    function initialize(){
        let harvestGroups = Memory.rooms[roomName].harvestGroups || (Memory.rooms[roomName].harvestGroups = {});
        console.log("Initializing"+nodeId);
        if(node instanceof Source){
            harvestGroup = {
                targetHarvesterCount : node.pos.getOpenAdjacentPositionsCount()
            };
        } else if(node instanceof Mineral){
            var storages = room.find(FIND_MY_STRUCTURES, {filter: utils.isA("storage")});
            if(storages[0]){
                targetEnergyStore = storages[0].id;
            }
             harvestGroup = {
                targetHarvesterCount : 0,
                targetEnergyStore : targetEnergyStore
            };
        }
        harvestGroups[id] = harvestGroup;
        return harvestGroup;
    }
    
    var publicAPI = {};
    publicAPI.perform = perform;
    publicAPI.debugTable = debugTable;
    publicAPI.initialize = initialize;
    return publicAPI;
};
