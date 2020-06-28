module.exports = function(creep){
    creep.states = [
        {// 0
            description:"Stuck", 
            action: stuck
        },
        {// 1
            description:"Collect Energy", 
            action: collectEnergy      
        }
    ];
    creep.performStates();

    function collectEnergy(creep){
        var source = Game.getObjectById(creep.memory.targetNode);
        if(!source){
            creep.memory.state = 0;
            return false;
        }
        creep.moveToAndHarvest(source);
    }
    

    function stuck(creep){
        var waitFlag = getWaitFlag();
        creep.moveToAndWait(waitFlag);
        creep.memory.state = 1;
    }
    
    function getWaitFlag(){
        for(var i in Game.flags){
            if(Game.flags.room = creep.room && (i.indexOf('Cantina')==0)){
                return Game.flags[i];
            }
        }
    }
}
