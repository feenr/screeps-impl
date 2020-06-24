module.exports = (function(){

    Structure.prototype.needsRepair = function() {
        return this.hits < (this.hitsMax) / 2;
    };


    Structure.prototype.isInitialized = function(){
        if(typeof this.memory.initialized == 'undefined'){
            return false;
        } else {
            return this.memory.initialized;
        }
    };

    Structure.prototype.getFillPercentage = function(){
        if(this.store){
            return _.sum(this.store) / this.storeCapacity;
        } else {
            return this.energy / this.energyCapacity;
        }
    };

    Structure.prototype.getEnergy = function(){
        if(this.store){
            return this.store.energy;
        } else {
            return this.energy;
        }
    };

    Structure.prototype.getFillCapacity = function(){
        if(this.store){
            return this.storeCapacity;
        } else {
            return this.energyCapacity;
        }
    };

    Structure.prototype.isHarvestGroupTarget = function(){
        if(this.getFillCapacity > 0){
            for(var k in Memory.rooms[this.room.name].harvestGroups){
                if(Memory.rooms[this.room.name].harvestGroups[k].targetEnergyStore == this.id){
                    return true;
                }
            }
        }
        return false;
    };

    Structure.prototype.perform = function(){

    }
})();