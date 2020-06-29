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
        if(Game.flags["Claim"] && Game.flags["Claim"].room != creep.room){
            creep.memory.state = 1;
            return;
        }
        if(creep.carry.energy == creep.carryCapacity){
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
        creep.moveToAndHarvest(sources[1]);

        /**
         var resource = Game.getObjectById("55c34a6b5be41a0a6e80c340");
         if(!resource || resource.energy == 0){
            resource = Game.getObjectById("55c34a6b5be41a0a6e80c33e");
        }

         if(resource){
            creep.moveToAndHarvest(resource);
        }
         **/

    }

    function stuck(){
        creep.memory.state = 1;
    }

    function constructing(){

        //if(Game.flags["Claim"] && Game.flags["Claim"].room != creep.room){
        //    creep.memory.state = 3;
        //    return;
        //    }
        if(creep.carry.energy == 0 ){
            creep.memory.state = 2;
            return;
        }
        //var tower = creep.room.find(FIND_STRUCTURES, {filter: utils.isA("tower")})[0];
        //var tower = Game.getObjectById("56e8cec43be9b45a228ad83a");
        //if(tower.energy == tower.energyCapacity){

        //var damagedStructure = Game.getObjectById("5754aaff391f1ff77af7c892");
        //creep.moveToAndRepair(damagedStructure);
        //creep.moveToAndRepair
        //console.log("hi")

        var constructionSites = creep.room.getMyConstructionSites();
        if(constructionSites.length > 0){
            creep.moveToAndBuild(constructionSites[0]);
        } else {
            console.log("Spawn builder has nothing to do")
        }


        //var newSpawn = Game.getObjectById("57740c41efd3405c4bb33fa7");
        //creep.moveToAndBuild(newSpawn);

        //var newController = Game.getObjectById("55c34a6b5be41a0a6e80c33f");
        //creep.moveToAndUpgrade(newController);
        //creep.moveToAndTransferEnergy(newSpawn);


        /**} else {
            if(!creep.pos.isNearTo(tower)){
                creep.moveTo(tower);
            } else {
                var transferAmount = utils.getTransferAmount(creep, tower)
                
                if(transferAmount == 0){
                    creep.memory.state = 1;
                    return;
                }
        
                var transferStatus = creep.transferEnergy(tower, transferAmount);
            }
        }**/
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
