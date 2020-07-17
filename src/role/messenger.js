// Spreads from harvest groups, to other expansions.

module.exports = function(creep){
    var utils = require('utils_misc');

    creep.states = [
        {
            description : "stuck",
            action : creep.stuck
        },
        {
            description : "collectResource",
            action : collectResources
        },
        {
            description : "storeResources",
            action : storeResources
        }
    ];

    creep.performStates();

    function collectResources(){
        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.state = 2;
            creep.memory.energySourceId = "";
            return false;
        }
        var energySource = null;

        if(!creep.memory.energySourceId){
            energySource = findBestEnergySource();
        } else {
            energySource = Game.getObjectById(creep.memory.energySourceId);
        }

        if(!energySource
            || energySource instanceof Structure && energySource.getEnergy() <=1){
            creep.memory.energySourceId = null;
            return false;
        }

        creep.memory.energySourceId = energySource.id;
        if(energySource instanceof Resource){
            creep.moveToAndPickUp();
        } else {
            creep.moveToAndWithdraw(energySource, RESOURCE_ENERGY);
        }

        if(creep.carryAmount() === creep.carryCapacity){
            creep.memory.energySourceId = "";
            creep.memory.state = 2;
            return;
        }
    }

    function storeResources(){
        var energyStore = null;
        if(!creep.memory.energyStoreId){
            energyStore = findEnergyStore();
        } else {
            energyStore = Game.getObjectById(creep.memory.energyStoreId);
            if(!energyStore || energyStore.getFillPercentage() == 1){
                energyStore = findEnergyStore();
            }
        }

        if(!energyStore){
            creep.memory.state = 0;
            return false;
        }
        creep.memory.energyStoreId = energyStore.id;

        if(!creep.pos.isNearTo(energyStore)){
            creep.moveTo(energyStore);
        } else {
            var transferAmount = utils.getTransferAmount(creep, energyStore)
            if(transferAmount > 0){
                creep.transfer(energyStore, RESOURCE_ENERGY, transferAmount);
            }
            creep.memory.energyStoreId = "";
        }

        if(creep.carryAmount() === 0){
            creep.memory.state = 1;
            return;
        }
    }



    function findBestEnergySource(){
        var room = creep.room;
        var parentRoomId = creep.getHomeRoom();
        if(parentRoomId && Game.rooms[parentRoomId]){
            room = Game.rooms[parentRoomId];
        }
        var bestEnergySource = null;

        var droppedResources = null;
        droppedResources = creep.room.find(FIND_DROPPED_RESOURCES)[0]
        if(droppedResources){
            if(!creep.pos.isNearTo(droppedResources)){
                creep.moveTo(droppedResources);
            } else {
                creep.pickup(droppedResources);
            }
            return droppedResources[0];
        }

        /**
         var droppedResources = null;
         var droppedResourceQueue = queueManager.getQueue(room,"droppedResources");
         var resourceId = droppedResourceQueue.pop();
         if(resourceId){
            var resource = Game.getObjectById(droppedResourceQueue.pop());
            if(resource){
                return resource;
            }
        }
         **/
        // Get a harvest group target
        for(var i in Memory.rooms[room.name].harvestGroups){
            if(bestEnergySource && bestEnergySource instanceof StructureLink){
                break;
            }

            var harvestGroup = Memory.rooms[room.name].harvestGroups[i];
            var energySource = Game.getObjectById(harvestGroup.targetEnergyStore);
            if(energySource instanceof StructureSpawn){
                bestEnergySource = energySource;
                continue;
            }
            if(energySource instanceof StructureLink){
                var links = room.find(FIND_MY_STRUCTURES, {filter:utils.isA('link')});
                for(var k in links){
                    if(links[k] != energySource && links[k].energy > 0 && !links[k].isHarvestGroupTarget()){
                        if(links[k].energy > 0){
                            bestEnergySource = links[k];
                        }
                        break;
                    }
                }
            } else {
                if(energySource && energySource.getEnergy() > 0){
                    bestEnergySource = energySource;
                }
            }
            if(bestEnergySource){
                break;
            }
            //if(bestEnergySource.energyCapacity == energySource.energy){
            //    break;
            //}
        }

        // Use a storage if it's above 25%
        if(bestEnergySource == null){
            var storages = room.find(FIND_MY_STRUCTURES, {filter:utils.isA('storage')});
            for(var i in storages){
                if(storages[i].getFillPercentage() > 0.25){
                    bestEnergySource = storages[i];
                }
            }
        }

        // Try to find a full spawn
        if(bestEnergySource == null){
            for(var i in room.spawns){
                if(room.spawns[i].energy == room.spawns[i].energyCapacity){
                    bestEnergySource = room.spawns[i];
                    break;
                }
            }
        }
        return bestEnergySource;
    }

    function findEnergyStore(){
        var room = creep.room;
        var homeRoomId = creep.getHomeRoom();
        if(homeRoomId && Game.rooms[homeRoomId]){
            var parentRoom = room.getParentRoom();
            if(parentRoom != null){
                room = parentRoom;
            }
        }

        var structures = room.find(FIND_MY_STRUCTURES);
        // Check towers
        var towers = _.filter(structures, function(o){return o.structureType == 'tower' && o.energy < (o.energyCapacity-100);});
        if(towers.length > 0){
            return towers[0];
        }

        // Check extensions
        if(creep.room == room){ // Only check these if in same room. findClosest in range function doesn't work otherwise.
            var extensions = _.filter(structures, function(o){return o.structureType == 'extension' && o.energy < o.energyCapacity;});
            if(extensions.length > 0){
                extension = creep.pos.findClosestByRange(extensions);
                return extension;
            }
        }

        // Check spawns
        var spawns = _.filter(structures, function(o){return o.structureType == 'spawn' && o.energy < o.energyCapacity});
        if(spawns.length > 0 ){
            return spawns[0];
        }

        // Check others
        var labs = _.filter(structures, function(o){return o.structureType == 'lab' && o.energy < o.energyCapacity});
        if(labs.length > 0){
            return labs[0];
        }

        // Go to Storage
        var storages = _.filter(structures, {'structureType': 'storage'});
        if(storages.length > 0){
            return storages[0];
        }

        return;
    }

    function findBestMineralSource(){
        return creep.room.storage;
    }

    function findMineralStore(){
        var room = creep.room;

        // Get the first mineral type in carry
        var mineralType = "";
        for(var i in creep.carry){
            if(i != 'energy'){
                mineralType = i;
                break;
            }
        }
        var structures = room.find(FIND_MY_STRUCTURES);

        // Check labs
        var labs = _.filter(structures, function(o){return o.structureType == 'lab';});
        for(var i in labs){
            if(labs[i].memory.mineral == mineralType){
                return lab[i];
            }
        }

        // Check Terminal
        if(room.terminal.needsMoreMineral()){
            return room.terminal;
        }

        // Check storage
    }
};
