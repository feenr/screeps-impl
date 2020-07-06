module.exports = function(nodeId){
    var settings = require('settings_registry');
    var utils = require('utils_misc');
    var id = nodeId;
    var node = Game.getObjectById(nodeId);
    var room = node.room;
    let log = room.getLogger();

    //Stored in memory
    let harvestGroup;

    const WORKERS_DEFAULT = {
        "harvester": {
            target: 0,
            list: []
        },
        "miner": {
            target: 0,
            list: []
        },
        "driller": {
            target: 0,
            list: []
        }
    }

    function perform(){
        getFromMemory();
        removeDeadWorkers();
        assignEnergyStore();
        assignWorkers();
    }

    function assignEnergyStore(){
        // Check if the energy store is not defined or invalid
        if(!harvestGroup.targetEnergyStore || !Game.getObjectById(harvestGroup.targetEnergyStore)){
            // Find an appropriate energy store
            harvestGroup.targetEnergyStore = findNearestEnergyStore();
        }
    }

    function assignWorkers(){
        // If we don't have enough workers on this node, find
        // an idle one and assign it.
        for(let workerType in harvestGroup.workers){
            // console.log("Assigning "+workerType);
            if(harvestGroup.workers[workerType].list.length < harvestGroup.workers[workerType].target){
                let worker = findUnassignedWorker(workerType);
                if(worker){
                    addWorker(worker);
                } else {
                    let parentRoomName = settings.get("ParentRoom", room.id);
                    if(parentRoomName){
                        let parentRoom = Game.rooms[parentRoomName];
                        if(parentRoom){
                            let queue = parentRoom.getSpawnQueue();
                            let queueRequest = {role: workerType, memory: {room: room.id}};

                            if (queue.containsCount(queueRequest) < 1 && !parentRoom.hasInvaders()) {
                                log("Requesting a "+workerType);
                                queue.push(queueRequest);
                            }
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

    function removeDeadWorkers(){
        for(let type in harvestGroup.workers){
            let workersList = harvestGroup.workers[type].list;
            for(let j in workersList){
                if(!Game.getObjectById(workersList[j])){
                    workersList.splice(j, 1);
                }
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
        creep.memory.targetNode = id;
        harvestGroup.workers[creep.memory.role].list.push(creep.id);
    }
    
    function getFromMemory(){
        room.memory.harvestGroups = room.memory.harvestGroups || {};
        if(!room.memory.harvestGroups[nodeId]){
            harvestGroup = initialize();

        } else {
            harvestGroup = room.memory.harvestGroups[nodeId];
        }
        // Convert from old to new
        if(!harvestGroup.workers){
            harvestGroup.workers = WORKERS_DEFAULT;
            harvestGroup.workers["harvester"].target = harvestGroup.targetHarvesterCount;
            harvestGroup.workers["harvester"].list = harvestGroup.harvesterList;
        }
    }
    

    function initialize(){
        console.log("Initializing"+nodeId);
        let harvestGroup;
        if(node instanceof Source){
            harvestGroup = {
                targetHarvesterCount : node.pos.getOpenAdjacentPositionsCount(),
                targetMinerCount : 0
            };
        } else if(node instanceof Mineral){
            let storages = room.find(FIND_MY_STRUCTURES, {filter: utils.isA("storage")});
            let targetEnergyStore = "";
            if(storages[0]){
                targetEnergyStore = storages[0].id;
            }
             harvestGroup = {
                workers : workers,
                targetEnergyStore : targetEnergyStore
            };
        }
        room.memory.harvestGroups[id] = harvestGroup;
        return harvestGroup;
    }
    
    var publicAPI = {};
    publicAPI.perform = perform;
    return publicAPI;
};
