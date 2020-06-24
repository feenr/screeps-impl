 module.exports = function(creep){
    
    creep.memory.flagName = creep.memory.flagName || getExploreFlag();
    //creep.memory.flagName = getExploreFlag();
    
    creep.moveToAndWait(getExploreFlag());


    /**
     * Search for a flag called Explore-[RoomName]
     **/
    function getExploreFlag() {
        return Game.flags["Cantina-"+creep.memory.room].name;
    }
 }
 
 