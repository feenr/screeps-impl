module.exports = function(creep){
    var utils = require('./utils_misc');
    var roleBase = require('./role_base');

    var states = [
        {// 0
            description : "Stuck",
            action : moveToFlag
        },
         {// 1
            description : "Move to flag room",
            action : claimController
        },
         {// 2
            description : "Claim controller",
            action : claimController
        },
    ];
    
    roleBase.performStates(creep, states);
    
    
    function stuck(){
        creep.memory.state = 1;
    }
    
    function moveToFlag(){
        var flag = Game.flags["Claim"];
        if(!flag){
            creep.memory.state = 0;
            return;
        }
        if(!creep.pos.isNearTo(flag)){
            creep.moveTo(flag);
        } else {
            creep.memory.state = 2;
        }
    }
    
    function claimController(){
        if(creep.room.controller.my == true){
            creep.memory.state = 0;
        }
        if(!creep.pos.isNearTo(creep.room.controller)){
            creep.moveTo(creep.room.controller);
        } else {
            console.log(creep.claimController(creep.room.controller));
        }
    }
}