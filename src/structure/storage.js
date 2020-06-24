/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structure_storage'); // -> 'a thing'
 */
 
 module.exports = function(){
    // Get a list of all storage structures
    var utils = require('utils');
    var room = utils.getRoom();
    var energyGiverTypes = ["STRUCTURE_EXTENSION", "STRUCTURE_STORAGE"];
    var structures = room.find(FIND_STRUCTURES);
    for(var i in structures){
        structure = structures[i];
        if(energyGiverTypes.indexOf(structure.structureType) >= 0 && structure.energy){
            var pos = structure.pos;
            var nearbyCreeps = lookForAtArea(creep, pos.y-1, pos.x-1, pos.y+1, pos.x+1);
            for(var k in nearbyCreeps){
                var creep = nearbyCreeps[k];
                var energyAvailable = structure.energy;
                var energyNeeded = creep.energyCapacity - creep.energy;
                if(energyNeeded > 0){
                    var energyToTransfer = energyAvailable > energyNeeded ? energyAvailable : energyNeeded;
                    structure.transferEnergy(creep, energyToTransfer);
                }
            }
        }
    }
     // Iterate over structures
     
     // Check if there is a builder nearby which is not at capacity
     
     // Transfer energy to that builder
     
 }