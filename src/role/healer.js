module.exports = function(creep){

    if(Game.flags["Rally"].room != creep.room){
        creep.moveToAndWait(Game.flags["Rally"]);
        return;
    }
    
    
    var soldiers = creep.room.find(FIND_MY_CREEPS, {filter: function(creep){return creep.memory.role == 'soldier'}});
    for(var i in soldiers){
        if(soldiers[i].hits < soldiers[i].hitsMax){
            creep.moveToAndHeal(soldiers[i]);
            return;
        } 
    }
    if(soldiers[0]){
        creep.moveToAndWait(soldiers[0]);    
        return;
    }

}