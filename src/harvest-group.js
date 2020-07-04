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
    let targetEnergyStore;
    let targetHarvesterCount;
    let targetMinerCount;
    let harvesterList;
    let minerList;

    let workers = [
        {
            type: "harvester",
            target: 0,
            list: []
        },
        {
            type: "miner",
            target: 0,
            list: []
        },
        {
            type: "drill",
            target: 0,
            list: []
        }
    ]

    function perform(){
        getFromMemory();

        // Remove all dead harvesters
        for(let i in harvesterList){
            if(!Game.getObjectById(harvesterList[i])){
                harvesterList.splice(i, 1);
            }
        }
        for(let i in minerList){
            if(!Game.getObjectById(harvesterList[i])){
                minerList.splice(i, 1);
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
            let harvester = findUnassignedWorker("harvester");
            if(harvester){
                addWorker(harvester);
            } else {
                let parentRoomName = settings.get("ParentRoom", roomId);
                if(parentRoomName){
                    let parentRoom = Game.rooms[parentRoomName];
                    if(parentRoom){
                        let queue = parentRoom.getSpawnQueue();
                        let queueRequest = {role: "harvester", memory: {room: roomId}};

                        if (queue.containsCount(queueRequest) < 1 && !parentRoom.hasInvaders()) {
                            log("Requesting a harvester");
                            queue.push(queueRequest);
                        }
                    }
                }
            }
        }

        // If we don't have enough miners on this node, find
        // an idle one and assign it.
        if(minerList.length < targetMinerCount){
            let miner = findUnassignedWorker("miner");
            if(miner){
                addWorker(miner);
            } else {
                let parentRoomName = settings.get("ParentRoom", roomId);
                if(parentRoomName){
                    let parentRoom = Game.rooms[parentRoomName];
                    if(parentRoom){
                        let queue = parentRoom.getSpawnQueue();
                        let queueRequest = {role: "miner", memory: {room: roomId}};

                        if (queue.containsCount(queueRequest) < 1 && !parentRoom.hasInvaders()) {
                            log("Requesting a miner");
                            queue.push(queueRequest);
                        }
                    }
                }
            }
        }
    }

    function findUnassignedWorker(type){
        for(var i in Game.creeps){
            var worker = Game.creeps[i];
            if(worker.memory.role !== type){
                continue;
            }
            // cheap way of seeing if a room has spawns,
            // although not 100% accurate.
            if(room.controller.my){
                // If this room has a spawn, only choose from creeps already in the room.
                if(worker.room !== room){
                    continue;
                }
                // Don't choose harvesters that belong to other rooms.
                if(worker.memory.room !== room.name){
                    continue;
                }
            } else {
                if(worker.memory.room !== room.name){
                    continue;
                }
            }

            if(!worker.memory.targetNode || worker.memory.targetNode === ''){
                return worker;
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
    
    function addWorker(creep){
        Memory.creeps[creep.name].targetNode = id;
        if(creep.memory.role === "miner"){
            let index = minerList.length;
            minerList[index] = creep.id;
        } else if (creep.memory.role === "harvester"){
            let index = harvesterList.length;
            harvesterList[index] = creep.id;
        }
    }
    
    function getFromMemory(){
        Memory.rooms[roomId].harvestGroups = Memory.rooms[roomId].harvestGroups || {};
        if(!Memory.rooms[roomId].harvestGroups[nodeId]){
            initialize();
        }
        Memory.rooms[roomId].harvestGroups[nodeId] = Memory.rooms[roomId].harvestGroups[nodeId] || {};
        Memory.rooms[roomId].harvestGroups[nodeId].harvesterList = Memory.rooms[roomId].harvestGroups[nodeId].harvesterList || [];
        Memory.rooms[roomId].harvestGroups[nodeId].minerList = Memory.rooms[roomId].harvestGroups[nodeId].minerList || [];

        harvesterList = Memory.rooms[roomId].harvestGroups[nodeId].harvesterList;
        minerList = Memory.rooms[roomId].harvestGroups[nodeId].minerList;
        targetEnergyStore = Memory.rooms[roomId].harvestGroups[nodeId].targetEnergyStore;
        targetHarvesterCount = Memory.rooms[roomId].harvestGroups[nodeId].targetHarvesterCount;
        targetMinerCount = Memory.rooms[roomId].harvestGroups[nodeId].targetMinerCount;
    }
    

    function initialize(){
        let harvestGroups = Memory.rooms[roomName].harvestGroups || (Memory.rooms[roomName].harvestGroups = {});
        console.log("Initializing"+nodeId);
        if(node instanceof Source){
            harvestGroup = {
                targetHarvesterCount : node.pos.getOpenAdjacentPositionsCount(),
                targetMinerCount : 0
            };
        } else if(node instanceof Mineral){
            var storages = room.find(FIND_MY_STRUCTURES, {filter: utils.isA("storage")});
            if(storages[0]){
                targetEnergyStore = storages[0].id;
            }
             harvestGroup = {
                targetHarvesterCount : 0,
                targetMinerCount : 0,
                targetEnergyStore : targetEnergyStore
            };
        }
        harvestGroups[id] = harvestGroup;
        return harvestGroup;
    }
    
    var publicAPI = {};
    publicAPI.perform = perform;
    publicAPI.initialize = initialize;
    return publicAPI;
};
