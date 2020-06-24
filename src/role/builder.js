module.exports = function(creep){
    var utils = require('./utils_misc');
    var settings = require('./utils_settings_registry');
    var roleBase = require('./role_base');
    var DEFAULT_WAIT = 10;
    var disableBuilding = false;

    var states = [
        {// 0
            description:"Stuck",
            action: stuck
        },
        {// 1
            description:"Collecting Energy",
            action: collectEnergy
        },
        {// 2
            description:"Constructing",
            action: constructing
        },
        {// 3
            description:"Wait for work",
            action: waitForWork
        }
    ];


    roleBase.performStates(creep, states);

    function collectEnergy(creep){
        var energySource = null;
        if(disableBuilding == true){
            creep.memory.state = 3;
            return false;
        }
        if(creep.carry.energy == creep.carryCapacity){
            creep.memory.state = 2;
            return false;
        }
        if(creep.memory.energySourceId != ""){
            energySource = Game.getObjectById(creep.memory.energySourceId);

        }
        if(energySource == null || energySource.energy == 0){
            energySource = roleBase.findEnergySource(creep);
            if(energySource != null) {
                creep.memory.energySourceId = energySource.id;
            }
        }
        if(energySource instanceof StructureSpawn){
            creep.moveToAndWait(energySource);
        } else {
            creep.moveToAndRequestEnergy(energySource);
        }

    }


    function constructing(creep){
        // Check for error and break conditions
        if(creep.carry.energy == 0){
            creep.memory.state = 1;
            creep.memory.constructionId = "";
            return false;
        }

        var constructionSite = Game.getObjectById(creep.memory.constructionId);
        if(!constructionSite){
            constructionSite = getConstructionSite(creep);
            if(constructionSite){
                creep.memory.constructionId = constructionSite.id;
            } else {
                creep.memory.state = 3;
                creep.memory.constructionId = "";
                return;
            }
        }

        if(constructionSite instanceof ConstructionSite){
            creep.moveToAndBuild(constructionSite);
        } else {
            creep.moveToAndRepair(constructionSite);
        }
    }

    function getConstructionSite(){
        // Repair walls and ramparts
        var walls = creep.room.find(FIND_STRUCTURES, {filter:utils.isA(["constructedWall", "rampart"])});
        var smallestWall = _.reduce(walls, function(result, value){
            if(result.hits < value.hits){
                return result;
            } else {
                return value;
            }
        });

        if(smallestWall.hits < (settings.get("WallSize", creep.room.name)*.5)){
            return smallestWall;
        }

        // Repair damaged containers
        var damagedBuildings = creep.room.find(FIND_STRUCTURES, {filter:utils.isA(["container"])});
        var damagedBuilding = _.reduce(damagedBuildings, function(result, value){
            if(result.hits < value.hits){
                return result;
            } else {
                return value;
            }
        });
        if(damagedBuilding && damagedBuilding.needsRepair()){
            return damagedBuilding;
        }



        // Build construction sites - TODO constrcution priority
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length > 0 && !disableBuilding) {
            return targets[0];
        }
        return smallestWall;
    }

    function waitForWork(){
        if(typeof(creep.memory.waitTimer) == 'undefined' || creep.memory.waitTimer == -1){
            creep.memory.waitTimer = DEFAULT_WAIT;
        }
        else if(creep.memory.waitTimer==0){
            creep.memory.waitTimer = -1;
            creep.memory.state = 1;
        } else {
            creep.memory.waitTimer--;
        }
        toTheCantina();
    }

    function toTheCantina(){
        for(var flagName in Game.flags){
            if(Game.flags[flagName].room == creep.room && flagName.indexOf("Cantina")==0){
                creep.moveToAndWait(Game.flags[flagName]);
            }
        }
    }

    function stuck(){
        toTheCantina();
        creep.memory.state = 1;
    }
};