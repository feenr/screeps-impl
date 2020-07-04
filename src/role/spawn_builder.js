module.exports = function(creep){
    creep.states = [
        {// 0
            description:"Stuck",
            action: stuck
        },
        {// 1
            description:"Move to flag",
            action: moveToFlag
        },
        {// 2
            description:"Collecting Energy",
            action: collectEnergy
        },
        {// 3
            description:"Constructing",
            action: constructing
        }
    ];

    creep.performStates();

    function collectEnergy(creep){
        if(Game.flags["Claim"] && Game.flags["Claim"].room !== creep.room){
            creep.memory.state = 1;
            return;
        }
        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.state = 3;
            return;
        }

        var droppedResources = creep.room.find(FIND_DROPPED_RESOURCES)[0]
        if(droppedResources){

            if(!creep.pos.isNearTo(droppedResources)){
                creep.moveTo(droppedResources);
            } else {
                creep.pickup(droppedResources);
            }
            return;
        }


        let sources = creep.room.getSources();
        // sources = _.filter(sources, (source)=> source.energy > 0);
        let soure = creep.pos.findClosestByRange(sources);
        creep.moveToAndHarvest(soure);
    }

    function stuck(){
        creep.memory.state = 1;
    }

    function constructing(){

        if(creep.carry.energy === 0 ){
            creep.memory.state = 2;
            return;
        }

        var constructionSites = creep.room.getMyConstructionSites();
        if(constructionSites.length > 0){
            creep.moveToAndBuild(constructionSites[0]);
        } else {
            // console.log("Spawn builder has nothing to do")
        }
    }



    function moveToFlag(){
        if(Game.flags["Claim"].room === creep.room){
            creep.moveToAndWait(Game.flags["Claim"]);
            creep.memory.state = 2;
            return;
        }
        if(Game.flags["Claim"] && !creep.pos.isNearTo(Game.flags["Claim"])){
            creep.moveToAndWait(Game.flags["Claim"]);
        }
    }
};
