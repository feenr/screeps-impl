module.exports = [
        {
            name : "distributeLinkEnergy",
            module : "event_structure_link",
            functionName : "distributeEnergy", 
            parameters : {}, 
            interval : 10,
            disabled : true
        },
        {
            name : "constructRoads", 
            module : "event_road_building",
            functionName : "constructRoads", 
            parameters : {}, 
            interval : 500,
            disabled : false
        },
        {
            name : "constructWalls",
            module : "event_wall_building",
            functionName : "constructWalls", 
            parameters : {}, 
            interval : 510,
            disabled : true
        },
        {
            name : "upgradeWalls",
            module : "event_wall_building",
            functionName : "upgradeWalls",
            parameters : {},
            interval : 50,
            disabled : true
        },
        {
          name : "spawnCreeps",
          module : "event_spawner",
          functionName : "performSpawns",
          parameters : {},
          interval : 10,
          disabled : false
        }
];
