module.exports = function(creep){
    creep.states = [
        {// 0
            description:"Stuck", 
            action: creep.stuck
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

    creep.performStates();

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

        var target = creep.getObjectFromMemory("transferId");
        if(target == null){
            var target = findTransferTarget();
            if(target!=null){
              creep.memory.transferId = target.id;
            }
        }


        // Check to see if the storage needs repair (Extension)
        if(target instanceof StructureContainer) {
          if (target.hits < (target.hitsMax*.75)) {
            creep.moveToAndRepair(target);
            return;
          } // If target is a construction site, build it.
        } else if (typeof target == 'ConstructionSite'){
            creep.moveToAndBuild(target);
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
        var roomName = "";
        
        for(var i in Memory.rooms){
            if(!Memory.rooms[i].harvestGroups){
                continue;
            }
            if(Memory.rooms[i].harvestGroups[creep.memory.targetNode]){
                roomName = i;
                harvestGroup = Memory.rooms[i].harvestGroups[creep.memory.targetNode];
                break;
            }
        }

        if(harvestGroup){
            transferTargetId = harvestGroup.targetEnergyStore;
        }



        if(transferTargetId){
            transferTarget = Game.getObjectById(transferTargetId);
        } else {
          if(Game.rooms[i]){
            
          }
        }

        /**
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