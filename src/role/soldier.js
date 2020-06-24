module.exports = function(creep){
    //console.log(creep.room.name + " "Game.flags["Rally"].room)
    
    if(!Game.flags["Rally"].room || creep.room != Game.flags["Rally"].room){
        creep.moveTo(Game.flags["Rally"]);
        return;
    }
    
    var roleBase = require('./role_base');
    if(roleBase.performRenew(creep)){
        return;
    }
    
    var targets = ["57479c0612bd2de577655367"];
    //var targets = [];
    for(var i in targets){
        var target = Game.getObjectById(targets[i]);
        if(target){
            creep.moveToAndAttack(target);
            return;
        }
    }
    
    /**
    if(creep.needsRenew() || creep.memory.renewing){
        if(creep.moveToAndRequestRenew()){
            if(creep.ticksToLive >= 1000){
                creep.memory.renewing = false;
            } else {
                creep.memory.renewing = true;
            }
            return;
        }
    }
    **/
    
    //var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target){
        creep.moveToAndAttack(target);
        return;
    }
    
    creep.moveToAndWait(Game.flags["Rally"]);

    /**
    if(enemies.length > 0){
        var target = enemies[0];
        for(var i in enemies){
            if(enemies[i].body.indexOf(ATTACK || RANGED_ATTACK)){
                target = enemies[i];
            }    
        }
        
        creep.moveToAndAttack(target);
        return;
        //var status = creep.attack(target);
        //if(status = ERR_NOT_IN_RANGE){
        //    creep.moveTo(target);
        //}
    }
    **/
    
    
    var spawns = creep.room.find(FIND_HOSTILE_SPAWNS);
    if(spawns.length > 0){
        creep.moveToAndAttack(spawns[0]);
        return;
    }
    creep.moveToAndWait(Game.flags["Rally"]);
    
    
    /**

    if(true){
        for(var x = creep.pos.x-1; x <=creep.pos.x+1; x++){
            for(var y = creep.pos.y-1; y <=creep.pos.y+1; y++){
                if(x < 0 || y < 0 || x > 49 || y > 49){
                    continue;
                }
                var objects = creep.room.lookAt(x, y);
                for(var i = 0; i < objects.length; i++){

                    var obj = objects[i];
                    //console.log(obj.type);
                    if(obj.my == true){
                        continue;
                    }
                    if(obj.type == 'structure'){console.log(obj.structure.structureType)};
                    if(obj.structure.structureType == 'spawn' || true){

                        creep.attack(obj.structure);
                        continue;
                    }
                }
            }
        }
    }
    if(!creep.pos.isNearTo(Game.flags["Rally"])){
        creep.moveTo(Game.flags["Rally"]);
    }
    **/
}