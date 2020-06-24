module.exports = (function(){
    var utils = require("./utils_misc");
    var publicAPI = {};

    publicAPI.performStates = function(creep, states){
        if(considerEuthanasia(creep)){
            return;
        }
        if(typeof(creep.memory.state) == 'undefined'){
            creep.memory.state = 1;
        }
        var previousState = creep.memory.previousState;
        try{
            states[creep.memory.state].action(creep);
        } catch (e) {
            console.log(e.stack);
            creep.memory.state = 0;
        }
        if(creep.memory.state != previousState){
            creep.say(creep.memory.role.substring(0,4) +":"+creep.memory.previousState + " > " + creep.memory.state);
            creep.memory.previousState = creep.memory.state;
        }
    };
    
    publicAPI.stuck = function(creep){
        creep.memory.state = 1;
    };
    
    publicAPI.performRenew = function(creep){
        if((creep.needsRenew() && creep.isExpensive) || creep.memory.renewing){
            if(creep.moveToAndRequestRenew()){
                creep.memory.renewing = creep.ticksToLive < 1000;
                return true;
            }
        }
        return false;
    };
    
    publicAPI.findEnergySource = function(creep){
        var energySource;
        var links = creep.room.find(FIND_MY_STRUCTURES, {filter: utils.isA("link")});
        for(var i in links){
            if(links[i].energy == links[i].energyCapacity){
                return links[i];
            }
        }

        var storages  = creep.room.find(FIND_MY_STRUCTURES, {filter: utils.isA("storage")});
        for(var i in storages){
            if(storages[i].store.energy > (0.5 * storages[i].storeCapacity)){
                return storages[i];
            }
        }

        var spawns = creep.room.find(FIND_MY_SPAWNS);
        for(var i in spawns){
            if(spawns[i].energy > 0){
                energySource = spawns[0];
            }
        }

        return energySource;
    };

    function considerEuthanasia(creep){
        if(creep.ticksToLive <= 30){
            if(creep.carry.energy == 0){
                var log = creep.getLogger();
                log("Euthanizing myself");
                creep.suicide();
            }
            
            var target = null;
            var storages = creep.room.find(FIND_MY_STRUCTURES, {filter: utils.isA("storage")});
            if(storages[0]){
                target = storages[0];
            } else {
                var spawns = creep.room.find(FIND_MY_SPAWNS);
                if(spawns[0]){
                  target = spawns[0];
                }
            }
            
            if(target){
                creep.moveToAndTransferEnergy(target);
            }
            return true;
        }
        return false;
    }
    
    return publicAPI;
})();
