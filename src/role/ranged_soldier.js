module.exports = function(creep){
    
    var roleBase = require('role_base');
    if(roleBase.performRenew(creep)){
        return;
    }
    
    if(!creep.pos.isNearTo(Game.flags["Rally"])){
        creep.moveTo(Game.flags["Rally"]);
        return;
    }
    
    var targets = [];
    targets = ["56eac6f7c74074a9637a5e6c","56eac6f9ed216795635ae8eb", "56eac6f5ed216795635ae8e7"];
    for(var i in targets){
        var target = Game.getObjectById(targets[i]);
        if(target){
            creep.moveToAndRangedAttack(target);
            return;
        }
    }
    
    
    //var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target){
        creep.moveToAndRangedAttack(target);
        return;
    }
    
    var spawns = creep.room.find(FIND_HOSTILE_SPAWNS);
    if(spawns.length > 0){
        creep.moveToAndRangedAttack(spawns[0]);
        return;
    }
    
    
    creep.moveToAndWait(Game.flags["Rally"]);

}