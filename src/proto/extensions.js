 module.exports = (function(){
    var utils = require('utils');

    Spawn.prototype.getFillPercentage = function(){
        if(this.store){
            return _.sum(this.store) / this.storeCapacity;
        } else {
            return this.energy / this.energyCapacity;
        }
    };

    Flag.prototype.settingsMap = {
        0 : COLOR_WHITE,
        1 : COLOR_GREY,
        2 : COLOR_RED,
        3 : COLOR_PURPLE,
        4 : COLOR_BLUE,
        5 : COLOR_CYAN,
        6 : COLOR_GREEN
    }
/**
    Flag.prototype.getSetting = function(){
        console.log("requesting "+this.secondaryColor);
        console.log(this.settingsMap[this.secondaryColor]);
        if(typeof this.settingsMap[this.secondaryColor]== "number"){
            console.log("found a match");
            return this.settingsMap[this.secondaryColor];
        } else {
            console.log("returning 1");
            return 1;
        }
    };
    
    Flag.prototype.setSetting = function(settingValue){
        for(var i in this.settingsMap){
            if(this.settingsMap[i] == settingValue){
                this.setColor(COLOR_WHITE, i);
                return;
            }
        }
        this.setColor(COLOR_WHITE, COLOR_GREY);
    }
    **/
    
    Flag.prototype.getSetting = function(){
        /**
        console.log("requesting "+this.room.name+" "+this.secondaryColor);
        for(var i in this.settingsMap){
            if(this.settingsMap[i] == this.secondaryColor){
                console.log("found a match");
                console.log(i);
            }
        }
        this.setColor(COLOR_WHITE, COLOR_GREY);
        
        **/
        switch (this.secondaryColor) {
            case COLOR_WHITE:
                return 0;
            case COLOR_GREY:
                return 1;
            case COLOR_RED:
                return 2;
            case COLOR_PURPLE:
                return 3;
            case COLOR_BLUE:
                return 4;
            case COLOR_CYAN:
                return 5;
            case COLOR_GREEN:
                return 6;
            default:
                return 1;
        }
    }
    RoomPosition.prototype.getOpenAdjacentPositionsCount = function(){
        var count = 0;
        var pos = this;
        for(var x = pos.x-1; x <= pos.x+1; x++){
            for(var y = pos.y-1; y <= pos.y+1; y++){
                if(x == pos.x && y == pos.y){
                    continue;
                }
                var room = Game.rooms[pos.roomName];
                var results = room.lookAt(x, y);
                var wallFound = false;
                results.forEach(function(result){
                    if(result.type =='terrain' && result.terrain == 'wall'){
                        wallFound = true;
                    }
                });
                if(!wallFound){
                    count++;
                }
            }
        }
        return count;
    };
    
    RoomPosition.prototype.getOpenPosition = function(range){
        for(var x = this.x-range; x <= this.x+range; x++){
            for(var y = this.y-range; y <= this.y+range; y++){
                if(x != this.x-range || x!= this.x+range || y != this.y-range || y!= this.y+range){
                    continue;
                }
                var room = Game.rooms[this.roomName];
                var results = room.lookAt(x, y);
                var wallFound = false;
                results.forEach(function(result){
                    if(result.type =='terrain' && result.terrain == 'wall'){
                        obstructionFound = true;
                    }
                    if(result.type == 'structure'){
                        obstructionFound = true;
                    }
                });
                if(!obstructionFound){
                    return new RoomPosition(x, y, room.name);
                }
            }
        }
    }

    StructureSpawn.prototype.performTransfers = function(){
        var creeps = this.room.getMyCreeps();
        var thisSpawn = this;
        creeps = _.filter(creeps, function(o){
            var role = Memory.creeps[o.name].role;
            return (role == 'builder' || role == 'researcher') && 
                o.carry.energy < o.carryCapacity && 
                thisSpawn.pos.isNearTo(o);
        });
        creeps = _.sortBy(creeps, function(o){return o.energy});
        for (var i in creeps) {
            if(this.energy == 0){
                return;
            }
            var transferAmount = utils.getTransferAmount(this, creeps[i]);
            creeps[i].withdraw(this, RESOURCE_ENERGY, )
            //this.transferEnergy(creeps[i], transferAmount);
       }
   }
}
)();