// Spreads from harvest groups, to other expansions.

module.exports = function(creep){
    var utils = require('utils_misc');
    var roleBase = require('role_base');
    var state = -1;
    var room = creep.room;
    var roomId = room.name;

    var STUCK = 0;
    var COLLECT_ENERGY = 1;
    var STORE_ENERGY = 2;


    var states = [
        {
            description : "stuck",
            action : stuck
        },
        {
            description : "collectEnergy",
            action : collectEnergy
        },
        {
            description : "storeEnergy",
            action : storeEnergy
        }
    ];

    
    roleBase.performStates(creep, states);

    function stuck(creep){
        creep.memory.state = 1;
        creep.memory.energySourceId = "";
        creep.memory.energyStoreId = "";
    }
    

    function collectEnergy(){
        if(creep.carry.energy == creep.carryCapacity){
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
          || energySource instanceof Structure && energySource.getEnergy() == 0){
            creep.memory.energySourceId = null;
            return false;
        }

        /**
        if(!energySource
          || energySource instanceof Structure && energySource.getEnergy() == 0
          || !(energySource instanceof Resource)){
            creep.memory.energySourceId = null;
            return false;
        } **/
        
        creep.memory.energySourceId = energySource.id;
        if(!creep.pos.isNearTo(energySource)){
            creep.moveTo(energySource);
        } else {
            if(energySource instanceof Resource){
                creep.pickup()
            } else if(energySource.structureType == 'container'){
                creep.withdraw(energySource, RESOURCE_ENERGY);
            }else if(energySource.structureType == 'storage'){
                creep.withdraw(energySource, RESOURCE_ENERGY);
            } else {
                creep.withdraw(energySource, RESOURCE_ENERGY);
            }
        }

        if(creep.carry.energy == creep.carryCapacity){
            creep.memory.energySourceId = "";
            creep.memory.state = 2;
            return;
        }
    }  
    
    function storeEnergy(){
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
        
        if(creep.carry.energy == 0){
            creep.memory.state = 1;
            return;
        }
    }
    
    
        
    function findBestEnergySource(){
        var bestEnergySource = null;
        
        var droppedResources = null;
        //droppedResources = creep.room.find(FIND_DROPPED_ENERGY)[0]
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
        for(var i in Memory.rooms[creep.room.name].harvestGroups){
            
            if(bestEnergySource && bestEnergySource instanceof StructureLink){
                break;
            }
            
            var harvestGroup = Memory.rooms[creep.room.name].harvestGroups[i];
            var energySource = Game.getObjectById(harvestGroup.targetEnergyStore);
            if(energySource instanceof StructureSpawn){
                bestEnergySource = energySource;
                continue;
            }
            if(energySource instanceof StructureLink){
                var links = creep.room.find(FIND_MY_STRUCTURES, {filter:utils.isA('link')});
                for(var k in links){
                    if(links[k] != energySource && links[k].energy > 0 && !isHarvestGroupTarget(links[k].id)){
                        if(links[k].energy > 0){
                            bestEnergySource = links[k];
                        }
                        break;
                    }
                }
            } else {
                //console.log(creep.room + " " + creep.name + " " + energySource.structureType);
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
            var storages = creep.room.find(FIND_MY_STRUCTURES, {filter:utils.isA('storage')});
            for(var i in storages){
                if(storages[i].getFillPercentage() > 0.25){
                    bestEnergySource = storages[i];
                }
            }
        }
        
        // Try to find a full spawn
        if(bestEnergySource == null){
            for(var i in creep.room.spawns){
                if(creep.room.spawns[i].energy == creep.rooms[i].energyCapacity){
                    bestEnergySource = creep.room.spawns[i];
                    break;
                }
            }
        }
        return bestEnergySource;
    }
    
    function findEnergyStore(){

        var bestEnergyStore = null;
        var lowestEnergy = Number.MAX_VALUE;
        var structures = creep.room.find(FIND_MY_STRUCTURES);
        
        // Check towers
        var towers = _.filter(structures, function(o){return o.structureType == 'tower' && o.energy < (o.energyCapacity-100);});
        if(towers.length > 0){
            return towers[0];
        }
        
        // Check extensions
        var extensions = _.filter(structures, function(o){return o.structureType == 'extension' && o.energy < o.energyCapacity;});
        if(extensions.length > 0){
            extension = creep.pos.findClosestByRange(extensions);
            return extension;
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
    
    function isHarvestGroupTarget(structureId){
        for(var k in Memory.rooms[roomId].harvestGroups){
            if(Memory.rooms[roomId].harvestGroups[k].targetEnergyStore == structureId || structureId == "57782bd69dd8fcf04472c52e"){
                return true;
            }
        }
        return false;
    }
    
}
