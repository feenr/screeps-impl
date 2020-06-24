module.exports = (function(){
    StructureTower.prototype.perform = function(){
      var room = this.room;
      var enemies = room.find(FIND_HOSTILE_CREEPS);
      if(enemies.length > 0){
        this.performAttack(enemies);
      } else {
        var toBeHealed = [];
        if(toBeHealed.length > 0) {
          heal(toBeHealed);
        } else {
          //var toBeRepaired = room.find(FIND_STRUCTURES, {filter: (x => x.needsRepair())})
          if(this.energy > this.energyCapacity * .75){
            var toBeRepaired = room.find(FIND_STRUCTURES, {filter: function(x){return (x.needsRepair && x.needsRepair())}});
            if(toBeRepaired.length > 0){
              this.performRepair(toBeRepaired);
            }
          }
        }
      }
    };

    StructureTower.prototype.performAttack = function(enemies){
      for(var i= 0; i < enemies.length; i++){
        var enemy = enemies[i];
        var allies = require('./settings_allies');
        if(allies.indexOf(enemy.owner.username) == -1){
          this.attack(enemy);
          return true;
        }
      }
      return false;
    }
    function heal(){

    }

    StructureTower.prototype.performRepair = function(toBeRepaired){
      for(var i = 0; i < toBeRepaired.length; i++){
        if(toBeRepaired[i].structureType == 'road' || toBeRepaired[i].structureType == 'container'){
          this.repair(toBeRepaired[i]);
          break;
        }
      }
    }
  }
)();