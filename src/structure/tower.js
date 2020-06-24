/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structure_turret'); // -> 'a thing'
 */
 module.exports = function(aTower){
    var tower = aTower;
    var room = tower.room;
    var allies = require('settings_allies');
   
    perform(tower);
    
    function perform(){
        //var enemies = room.find(FIND_HOSTILE_CREEPS, {filter: function(o){return o.owner.username == 'Invader'}});
        var enemies = room.find(FIND_HOSTILE_CREEPS);
        
        if(enemies.length > 0){
            attack(enemies);
        } else {
            var toBeHealed = [];
            if(toBeHealed.length > 0) {
                heal(toBeHealed);
            } else {
                //var toBeRepaired = room.find(FIND_STRUCTURES, {filter: (x => x.needsRepair())})
                if(tower.energy > tower.energyCapacity * .75){
                    var toBeRepaired = room.find(FIND_STRUCTURES, {filter: function(x){return (x.needsRepair && x.needsRepair())}});
                    if(toBeRepaired.length > 0){
                        repair(toBeRepaired);
                    }
                }
            }
        }
    }
    
    
    function attack(enemies){
        for(var i= 0; i < enemies.length; i++){
            var enemy = enemies[i];
            if(allies.indexOf(enemy.owner.username) == -1){
                tower.attack(enemy);
                return true;
            }
        }
        return false;
    }
    function heal(){
        
    }
    
    function repair(toBeRepaired){
        for(var i = 0; i < toBeRepaired.length; i++){
            if(toBeRepaired[i].structureType == 'road' || toBeRepaired[i].structureType == 'container'){
                tower.repair(toBeRepaired[i]);
                break;
            }
        }
    }
 };