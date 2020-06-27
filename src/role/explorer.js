module.exports = function(creep){
    var roleBase = require('role_base');

    var states = [
        {// 0
            description:"Explore",
            action: explore
        },
        {// 1
            description:"Explore",
            action: explore
        },
    ];


    roleBase.performStates(creep, states);

    function explore(){
        creep.memory.flagName = creep.memory.flagName || getExploreFlag();
        creep.moveToAndWait(getExploreFlag());
    }

    /**
     * Search for a flag called Explore-[RoomName]
     **/
    function getExploreFlag() {
        creep.memory.flagName = creep.memory.flagName;
        return Game.flags["Explore"];
    }
}
 
 