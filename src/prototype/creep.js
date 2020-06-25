 module.exports = (function(){

    ////////////
    // Fields //
    ////////////

    Creep.prototype.states = [];
    Creep.prototype.performComplete = false;
    Creep.prototype.moveComplete = false;

    ///////////////////////
    // Utility Functions //
    ///////////////////////

    Creep.prototype.getLogger = function(){
     if(!this.log){
         this.log = require("utils_logger-factory").getCreepLogger(this).log;
     }
     return this.log;
    };

    //////////////////////////
    // Life cycle functions //
    //////////////////////////

    Creep.prototype.performStates = function(){
     var log = this.getLogger();
     if(this.isLowOnTicks()){
         this.dropCarryAndSuicide();
         return;
     }
     if(typeof(this.getState()) == 'undefined'){
         this.setState(0);
     }
     var previousState = this.getPreviousState();
     try{
         this.states[this.getState()].action.call(this , this);
     } catch (e) {
         log(e.stack);
         this.setState(0);
     }
     if(this.getState() != previousState){
         this.say(this.getRole().substring(0,4) +":"+this.getPreviousState() + " > " + this.getState());
         this.setPreviousState(this.getState());
     }
    };

    Creep.prototype.stuck = function(){
     var log = this.getLogger();
     //log(this.name);
     this.moveToHomeRoom();
     if(this.room.name == this.memory.room){
         this.setState(1);
     }
    };

    //////////////////////
    // Status Functions //
    //////////////////////

    Creep.prototype.needsRenew = function() {
        return this.ticksToLive < 300;
    };
    
    Creep.prototype.isExpensive = function() {
        return (this.body.size >= 6 || this.body.indexOf(HEAL)> -1);
    };

    Creep.prototype.isLowOnTicks = function(){
     return this.ticksToLive <= 30;
    };
    
    Creep.prototype.carryAmount = function(){
        return _.sum(this.carry);
    };
    
    Creep.prototype.carryFull = function(){
        return _.sum(this.carry) == this.carryCapacity;
    };
    
    Creep.prototype.carryEmpty = function(){
        return _.sum(this.carry) == 0;
    };

     /////////////
     // Actions //
     /////////////

    Creep.prototype.moveToAndRequestRenew = function(){
        
        var spawn = null;
        for(var i in Game.spawns){
            if(Game.spawns[i].room == this.room){
                spawn = Game.spawns[i];
                break;                
            }

        }
        if(spawn){
            if(!this.pos.isNearTo(spawn)){
                this.moveTo(spawn);
                return true;
            } else {
                spawn.renewCreep(this);
                return true;
            }
        } else {
            return false;
        }

    };
    
    Creep.prototype.moveToAndBuild = function(constructionSite){
        if(!this.pos.inRangeTo(constructionSite, 3)){
            this.moveTo(constructionSite);
        } else {
            this.build(constructionSite);
            if(constructionSite.progress >= constructionSite.progressTotal){
                /**
                console.log("CONSTRUCTION COMPLETE");
                // construction complete event
                var sources = this.room.getSources();
                for(var i in sources){
                    if(constructionSite.pos.inRangeTo(sources[i], 2)){
                        console.log("Setting harvest group for "+ sources[i].id);
                    }
                }
                **/
            }
        }
    };

    Creep.prototype.dropCarryAndSuicide = function(){
     if(this.carry.energy == 0){
         var log = this.getLogger();
         log("Euthanizing myself");
         this.suicide();
     }
     var target = this.room.storage;
     if(!target){
         var spawns = this.room.find(FIND_MY_SPAWNS);
         if(spawns[0]){
             target = spawns[0];
         }
     }
     if(target){
         this.moveToAndTransferEnergy(target);
     }
    };
    
    Creep.prototype.moveToAndRepair = function(constructionSite){
        if(!this.pos.inRangeTo(constructionSite, 3)){
            this.moveTo(constructionSite);
        } else {
            this.repair(constructionSite);
        }
    };

    Creep.prototype.moveToAndDeconstruct = function(constructionSite){
        if(!this.pos.isNearTo(constructionSite)){
            this.moveTo(constructionSite);
        } else {
            this.dismantle(constructionSite);
        }
    };
    
    Creep.prototype.moveToAndPickUp = function(resource){
        if(!this.pos.isNearTo(resource)){
            this.moveTo(resource);
        } else {
            this.pickup(resource);
        }
    };
    
    Creep.prototype.moveToAndHarvest = function(constructionSite){
        if(!this.pos.isNearTo(constructionSite)){
            this.moveTo(constructionSite);
        } else {
            this.harvest(constructionSite);
        }
    };
    
    Creep.prototype.moveToAndTransferEnergy = function(transferTarget){
        if(!this.pos.isNearTo(transferTarget)){
            this.moveTo(transferTarget);
        } else {
            this.transfer(transferTarget, RESOURCE_ENERGY);
        }
    };

    Creep.prototype.moveToAndWithdraw = function(target, resourceType){
     if(!this.pos.isNearTo(target)){
         this.moveTo(target);
     } else {
         this.withdraw(target, resourceType);
     }
    };

    Creep.prototype.moveToAndRequestEnergy = function(transferTarget, sameRoom){
     if(!this.pos.isNearTo(transferTarget)){
         if(sameRoom && this.room.name == this.memory.room){
             this.moveByPath(this.pos.findPathTo(transferTarget, {maxRooms: 1}));
         } else {
             this.moveTo(transferTarget);
         }
     } else {
         if(transferTarget.transferEnergy){
             transferTarget.transferEnergy(this);
         } else {
             transferTarget.transfer(this, RESOURCE_ENERGY);
         }
     }
    };
    
    Creep.prototype.moveToAndAttack = function(target){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        } else {
            this.attack(target);
        }
    };

    Creep.prototype.moveToAndReserve = function(target){
     if(!this.pos.isNearTo(target)){
         this.moveTo(target);
     } else {
         this.reserveController(target);
     }
    };

    Creep.prototype.getObjectFromMemory = function(objectName){
     if(this.memory[objectName]){
         var objectId = this.memory[objectName];
         return Game.getObjectById(objectId);
     }
     return null;
    };


    Creep.prototype.moveToAndUpgrade = function(controller, sameRoom){
     if(!this.pos.inRangeTo(controller, 2)){
         if(sameRoom && this.room.name == this.memory.room){
             this.moveByPath(this.pos.findPathTo(controller, {maxRooms: 1}));
         } else {
             this.moveTo(controller);
         }
     } else {
         this.upgradeController(controller);
     }
    };

    Creep.prototype.moveToAndWait = function(target, sameRoom){
    if(!this.pos.isNearTo(target)){
     if(sameRoom && this.room.name == this.memory.room){
         this.moveByPath(this.pos.findPathTo(target, {maxRooms: 1}));
     } else {
         this.moveTo(target);
     }
    }
    };
    
    Creep.prototype.moveToAndTransfer = function(target){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        } else {
            for(var i in this.carry){
                this.transfer(target, i);
            }
        }
    };
    
    Creep.prototype.moveToAndHeal = function(target){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        } else {
            this.heal(target)
        }
    };
    
    Creep.prototype.moveToAndRangedHeal = function(target){
        if(!this.pos.inRangeTo(target, 3)){
            this.moveTo(target);
        } else {
            this.rangedHeal(target)
        }
    };
    
    Creep.prototype.moveToAndRangedAttack = function(target){
        if(!this.pos.inRangeTo(target, 3)){
            this.moveTo(target);
        } else {
            this.rangedAttack(target)
        }
    };
    
    Creep.prototype.idle = function(){
        var waitFlag = null;
        for(var i in Game.flags){
            if(Game.flags[i].room == this.room && (i.indexOf('Cantina')==0)){
                waitFlag = Game.flags[i];
            }
        }
        this.moveToAndWait(waitFlag);
    };

    ////////////////////////////////
    // Memory getters and setters //
    ////////////////////////////////

    Creep.prototype.getHomeRoom = function(){
     return this.memory.room;
    };

    Creep.prototype.getState = function(){
     return this.memory.state;
    };
    Creep.prototype.setState = function(state){
     this.memory.state = state;
    };

    Creep.prototype.getPreviousState = function(){
     return this.memory.previousState;
    };
    Creep.prototype.setPreviousState = function(state){
     this.memory.previousState = state;
    };

    Creep.prototype.getRole = function(){
     return this.memory.role;
    };

    Creep.prototype.moveToHomeRoom = function(){
     var pos = new RoomPosition(25, 25, this.getHomeRoom());
     this.moveToAndWait(pos);
    };
}
)();