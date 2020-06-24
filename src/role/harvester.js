module.exports = function(creep){
    var utils = require('utils');
    var roleBase = require('role_base');
    var states = [
        {// 0
            description:"Stuck", 
            action: stuck
        },
        {// 1
            description:"Collect Energy", 
            action: collectEnergy      
        },
        {// 2
            description:"Store Energy", 
            action: storeEnergy
        }
    ];

    roleBase.performStates(creep, states);
    
    function collectEnergy(creep){
        if(creep.carryFull()){
            creep.memory.state = 2;
            return false;
        }
        var source = Game.getObjectById(creep.memory.targetNode);
        if(!source){
            creep.memory.state = 0;
            return false;
        }
        creep.moveToAndHarvest(source);
    }
    
    function storeEnergy(creep){
        if(creep.carryAmount() == 0){
            creep.memory.state = 1;
            creep.memory.transferId = "";
            return false;
        }
        var target = null;
        if(creep.memory.transferId != ""){
            target = Game.getObjectById(creep.memory.transferId);
        }
        if(target == null){
            var target = findTransferTarget();
            creep.memory.transferId = target.id;
        }
        creep.moveToAndTransfer(target);
    }
    function stuck(creep){
        creep.idle();
        creep.memory.state = 1;
    }
    
    function findTransferTarget(){
        var transferTarget;
        var transferTargetId = null;
        var harvestGroup = null;
        
        for(var i in Memory.rooms){
            if(!Memory.rooms[i].harvestGroups){
                continue;
            }
            if(Memory.rooms[i].harvestGroups[creep.memory.targetNode]){
                harvestGroup = Memory.rooms[i].harvestGroups[creep.memory.targetNode];
            }
        }
        if(harvestGroup){
            transferTargetId = harvestGroup.targetEnergyStore;
        }
        if(transferTargetId){
            transferTarget = Game.getObjectById(transferTargetId);
        } /**
        if(!transferTarget || utils.getCreepCountByRole('messenger') == 0){
            // Move this to a static variable;
            for(var spawn in Game.spawns){
                transferTarget = Game.spawns[spawn];
                break;
            }
        }**/
        return transferTarget;
    }
}