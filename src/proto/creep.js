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
                 this.log = require("utils_logger_factory").getCreepLogger(this).log;
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
    }
    
    Creep.prototype.isExpensive = function() {
        return (this.body.size >= 6 || this.body.indexOf(HEAL)> -1);
    }

    Creep.prototype.isLowOnTicks = function(){
     return this.ticksToLive <= 30;
    };
    
    Creep.prototype.carryAmount = function(){
        return _.sum(this.carry);
    }
    
    Creep.prototype.carryFull = function(){
        return _.sum(this.carry) == this.carryCapacity;
    }
    
    Creep.prototype.carryEmpty = function(){
        return _.sum(this.carry) == 0;
    }

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

    }
    
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
    }
    
    Creep.prototype.moveToAndRepair = function(constructionSite){
        if(!this.pos.inRangeTo(constructionSite, 3)){
            this.moveTo(constructionSite);
        } else {
            this.repair(constructionSite);
        }
    }

    Creep.prototype.moveToAndDeconstruct = function(constructionSite){
        if(!this.pos.isNearTo(constructionSite)){
            this.moveTo(constructionSite);
        } else {
            this.dismantle(constructionSite);
        }
    }
    
    Creep.prototype.moveToAndPickUp = function(resource){
        if(!creep.pos.isNearTo(resource)){
            creep.moveTo(resource);
        } else {
            creep.pickup(resource);
        }
    }
    
    Creep.prototype.moveToAndHarvest = function(constructionSite){
        if(!this.pos.isNearTo(constructionSite)){
            this.moveTo(constructionSite);
        } else {
            this.harvest(constructionSite);
        }
    }
    
    Creep.prototype.moveToAndTransferEnergy = function(transferTarget){
        if(!this.pos.isNearTo(transferTarget)){
            this.moveTo(transferTarget);
        } else {
            this.transfer(transferTarget, RESOURCE_ENERGY);
        }
    }
    
    Creep.prototype.moveToAndRequestEnergy = function(transferTarget){
        if(!this.pos.isNearTo(transferTarget)){
            this.moveTo(transferTarget);
        } else {
            if(transferTarget.transferEnergy){
                transferTarget.transferEnergy(this);                
            } else {
                transferTarget.transfer(this, RESOURCE_ENERGY);
            }
        }
    }
    
    Creep.prototype.moveToAndAttack = function(target){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        } else {
            this.attack(target);
        }
    }
    
    
    Creep.prototype.moveToAndUpgrade = function(controller){
        if(!this.pos.inRangeTo(controller, 2)){
            this.moveTo(controller);
        } else {
            this.upgradeController(controller);
        }
    }
    
    Creep.prototype.moveToAndWait = function(target, xOffset, yOffset){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        }
    }
    
    Creep.prototype.moveToAndTransfer = function(target){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        } else {
            for(var i in this.carry){
                this.transfer(target, i);
            }
        }
    }
    
    Creep.prototype.moveToAndHeal = function(target){
        if(!this.pos.isNearTo(target)){
            this.moveTo(target);
        } else {
            this.heal(target)
        }
    }
    
    Creep.prototype.moveToAndRangedHeal = function(target){
        if(!this.pos.inRangeTo(target, 3)){
            this.moveTo(target);
        } else {
            this.rangedHeal(target)
        }
    }
    
    Creep.prototype.moveToAndRangedAttack = function(target){
        if(!this.pos.inRangeTo(target, 3)){
            this.moveTo(target);
        } else {
            this.rangedAttack(target)
        }
    }
    
    Creep.prototype.idle = function(){
        var waitFlag = null;
        for(var i in Game.flags){
            if(Game.flags[i].room == this.room && (i.indexOf('Cantina')==0)){
                waitFlag = Game.flags[i];
            }
        }
        this.moveToAndWait(waitFlag);
    }

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