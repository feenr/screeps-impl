const harvest = require('role_harvester'); 
const build = require('role_builder');
const soldier = require('role_soldier');
const research = require('role_researcher');
const deliver = require('role_messenger');
const claim = require('role_claimer');
const explore = require('role_explorer');
const spawner = require('role_spawn_builder');
const healer = require('role_healer');
const mine = require('role_miner');
const drill = require('role_driller');
const rangedAttack = require('role_ranged_soldier');
const deconstructor = require('role_deconstructor');

module.exports = {
    harvester : {
        role: 'harvester',
        skills: [MOVE, WORK, CARRY],
        maxSize: 19,
        action: harvest, 
        color: 'yellow'
    },
    messenger: {
        role: 'messenger',
        skills: [CARRY, MOVE],
        action: deliver,
        maxSize: 20, 
        color: 'lightblue'
    },
    builder: {
        role: 'builder',
        skills: [WORK, WORK, CARRY, MOVE],
        maxSize: 20,
        action: build,
        color: 'brown'
    },

    researcher: {
        role: 'researcher',
        skills: [WORK, WORK, CARRY, MOVE],
        action: research,
        maxSize: 30,
        color: 'pink'
    },

    
    soldier : {
        role: 'soldier',
        skills: [TOUGH, ATTACK, MOVE, MOVE],
        maxSize: 12,
        action: soldier,
        color: 'red'
    },
    
    claimer: {
        role: 'claimer',
        skills: [CLAIM, MOVE, MOVE],
        action: claim,
        cappedSize: true
    },
    
    explorer: {
        role : 'explorer',
        skills: [MOVE],
        action: explore,
        cappedSize: true
    },
    spawner: {
        role : 'spawner',
        skills: [WORK, CARRY, MOVE, MOVE],
        action: spawner,
        maxSize: 25
    },
    deconstructor: {
        role : 'deconstructor',
        skills: [WORK, WORK, MOVE],
        action: deconstructor,
    },
    healer: {
        role : 'healer',
        skills: [HEAL, MOVE],
        action: healer,
    },
    miner: {
        role : 'miner',
        skills: [MOVE, WORK, WORK, WORK],
        action: mine,
    },
    driller: {
        role : 'driller',
        skills: [WORK, WORK, WORK],
        action: drill,
    },
    rangedSoldier: {
        role : 'rangedSoldier',
        skills: [MOVE, RANGED_ATTACK],
        action: rangedAttack,
    }
    
};
