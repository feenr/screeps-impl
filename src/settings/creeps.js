var harvest = require('role_harvester');
var build = require('role_builder');
var soldier = require('role_soldier');
var research = require('role_researcher');
var deliver = require('role_messenger');
var colonize = require('role_colonizer');
var explore = require('role_explorer');
var spawner = require('role_spawn_builder');
var healer = require('role_healer');
var mine = require('role_miner');
var rangedAttack = require('role_ranged_soldier');
var deconstructor = require('role_deconstructor');
var reserve = require('role_reserver');

module.exports = {
    harvester : {
        role: 'harvester',
        skills: [WORK, WORK, MOVE, CARRY],
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
    
    colonizer: {
        role: 'colonizer',
        skills: [CLAIM, MOVE, MOVE],
        action: colonize,
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
        action: healer
    },
    miner: {
        role : 'miner',
        skills: [MOVE, WORK, WORK, WORK],
        action: mine
    },
    rangedSoldier: {
        role : 'rangedSoldier',
        skills: [MOVE, RANGED_ATTACK],
        action: rangedAttack
    },
    reserver: {
        role : 'reserver',
        skills: [MOVE, CLAIM],
        action: reserve,
        maxSize: 10
    }
    
};
