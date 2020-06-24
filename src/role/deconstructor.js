module.exports = function(creep){
    var roleBase = require('./role_base');
    
    var states = [
        {// 0
            description:"Stuck", 
            action: stuck
        },
        {// 1
            description:"Move to target room", 
            action: moveToFlag      
        },
        {// 2
            description:"Destroy buildings", 
            action: deconstructBuildings
        }
    ];
    
    roleBase.performStates(creep, states);
    
    function moveToFlag(){
        var spawns = creep.room.find(FIND_HOSTILE_SPAWNS);
        if(spawns.length > 0){
            creep.memory.state = 2;
            creep.memory.target = spawns[0].id;
        }
        if(Game.flags["Rally"].room == creep.room){
            creep.memory.state = 2;
        }
        creep.moveToAndWait(Game.flags["Rally"]);
    }
    
    function deconstructBuildings(){
        var targets = ["56def8fcb6e6da137c07f2df"];
        //var targets = [];
        for(var i in targets){
            var target = Game.getObjectById(targets[i]);
            if(target){
                creep.moveToAndDeconstruct(target);
                return;
            }
        }
        /**
        var target = Game.getObjectById(creep.memory.target);
        if(!target){
            creep.memory.state = 1;
        }
        moveToAndDeconstruct(target)
        **/
    }
    
    function stuck(){
        creep.memory.state = 1;
    }
}