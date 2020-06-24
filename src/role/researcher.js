module.exports = function(creep){
    var roleBase = require('role_base');
    
    var states = [
        {// 0
            description:"Stuck", 
            action: stuck
        },
        {// 1
            description:"Collect Energy", 
            action: collectEnergy      
        },
        {// 2
            description:"Store Energy", 
            action: upgradeController
        }
    ];
    
    roleBase.performStates(creep, states);
    
    function collectEnergy(){
        if(creep.carry.energy == creep.carryCapacity){
            creep.memory.state = 2;
            return false;
        }
        
        var energySource = roleBase.findEnergySource(creep);
        
        if(energySource instanceof Spawn){
            creep.moveToAndWait(energySource);   
        } else {
            creep.moveToAndRequestEnergy(energySource);
        }
    }
    
    function upgradeController(){
        if(creep.carry.energy == 0){
            creep.memory.state = 1;
            return false;
        }
        var controller = null
        if(Game.flags["Upgrade"]){
            controller = Game.flags["Upgrade"];
        } else {
            controller = creep.room.controller;
        }
        creep.moveToAndUpgrade(controller);
    }
    
    function stuck(){
        creep.memory.state = 1;
    }
}