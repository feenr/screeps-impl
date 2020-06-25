module.exports = function(creep){
    creep.states = [
        {// 0
            description : "Stuck",
            action : creep.stuck
        },
         {// 1
            description : "Claim controller",
            action : reserveController
        }
    ];
    creep.performStates();

    function reserveController(){
        if(Game.rooms[creep.memory.room]) {
          creep.moveToAndReserve(Game.rooms[creep.memory.room].controller);
        } else {
          creep.memory.state = 0;
          return;
        }
    }
}