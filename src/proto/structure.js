 module.exports = (function(){

    Structure.prototype.needsRepair = function() {
        return this.hits < (this.hitsMax) / 2;
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
    }
    
    Structure.prototype.getFillCapacity = function(){
        if(this.store){
            return this.storeCapacity;
        } else {
            return this.energyCapacity;
        }
    }
}
)();