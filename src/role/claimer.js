module.exports = function(creep){

    creep.states = [
        {// 0
            description : "Stuck",
            action : moveToFlag
        },
         {// 1
            description : "Move to flag room",
            action : moveToFlag
        },
         {// 2
            description : "Claim controller",
            action : claimController
        },
    ];
    creep.performStates();

    function stuck(){
        creep.memory.state = 1;
    }
    
    function moveToFlag(){
        var flag = Game.flags["Claim"];
        if(!flag){
            creep.memory.state = 0;
            return;
        }
        if(creep.room != Game.flags["Claim"].room){
            creep.moveTo(flag);
        } else {
            creep.moveTo(flag);
            creep.memory.state = 2;
        }
    }
    
    function claimController(){
        if(creep.room != Game.flags["Claim"].room){
            creep.memory.state = 1;
            return;
        } else {
            creep.moveToAndClaim(creep.room.controller);
        }
        // if(!creep.pos.isNearTo(creep.room.controller)){
        //     creep.moveTo(creep.room.controller);
        // } else {
        //     console.log(creep.claimController(creep.room.controller));
        // }
    }
}
