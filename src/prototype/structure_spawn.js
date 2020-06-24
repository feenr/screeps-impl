module.exports = (function(){
    var utils = require('utils_misc');

    StructureSpawn.prototype.getFillPercentage = function(){
      if(this.store){
        return _.sum(this.store) / this.storeCapacity;
      } else {
        return this.energy / this.energyCapacity;
      }
    };

    StructureSpawn.prototype.performTransfers = function(){
      if(this.energy == 0){
        return;
      }
      var creeps = this.room.getMyCreeps();
      var thisSpawn = this;
      creeps = _.filter(creeps, function(o){
        var role = Memory.creeps[o.name].role;
        return (role == 'builder' || role == 'researcher') &&
          o.carry.energy < o.carryCapacity &&
          thisSpawn.pos.isNearTo(o);
      });
      creeps = _.sortBy(creeps, function(o){return o.carry.energy});
      if (creeps[0]) {
          var transferAmount = utils.getTransferAmount(this, creeps[0]);
          this.transferEnergy(creeps[0], transferAmount);
      }
    };
  }
)();