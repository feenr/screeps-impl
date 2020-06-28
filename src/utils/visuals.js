module.exports = (function(){


    function visualizeWalls(room){
        let viz = room.visual;
        let terrain = new Room.Terrain(room.name);
        let roomCost;
        for(let x =0; x < 50; x++){
            for(let y =0; y < 50; y++){
                //console.log(x+","+y);
                if(terrain.get(x,y) === 1 ){

                    let isEdge = false;
                    for(let x2 = -1; x2 <2; x2++){
                        if(x+x2 < 0 || x+x2 > 49){
                            continue;
                        }
                        for(let y2 = -1; y2 < 2; y2++){
                            if(y+y2 < 0 || y+y2 > 49){
                                continue;
                            }
                            let terrainType = terrain.get(x+x2, y+y2);
                            if(terrainType === 0 || terrainType === 2){
                                isEdge = true;
                                break;
                            }
                        }
                        if(isEdge) break;
                    }
                    if(isEdge){
                        viz.rect(x-.5, y-.5, 1, 1, {
                            radius: 0.4,
                            fill: "#555555"
                        });
                    } else {
                        viz.rect(x-.5, y-.5, 1, 1, {
                            radius: 0.4,
                            fill: "#181818",
                        });
                    }

                }
            }
        }
    }

    function distanceTransform(roomName) {
        console.log("Generating DT");
        let vis = new RoomVisual(roomName);

        let topDownPass = new PathFinder.CostMatrix();
        for (let y = 0; y < 50; ++y) {
            for (let x = 0; x < 50; ++x) {
                if (Game.map.getTerrainAt(x, y, roomName) == 'wall') {
                    topDownPass.set(x, y, 0);
                }
                else {
                    topDownPass.set(x, y,
                        Math.min(topDownPass.get(x-1, y-1), topDownPass.get(x, y-1),
                            topDownPass.get(x+1, y-1), topDownPass.get(x-1, y)) + 1);
                }
            }
        }

        for (let y = 49; y >= 0; --y) {
            for (let x = 49; x >= 0; --x) {
                let value = Math.min(topDownPass.get(x, y),
                    topDownPass.get(x+1, y+1) + 1, topDownPass.get(x, y+1) + 1,
                    topDownPass.get(x-1, y+1) + 1, topDownPass.get(x+1, y) + 1);
                topDownPass.set(x, y, value);
                //vis.circle(x, y, {radius:value/25});
            }
        }

        return topDownPass;
    }

    function visualizeRoadLocations(roomName){
        let room = Game.rooms[roomName];
        if(room){
            let roadLocations = room.getSetting("roadLocations");
            if(roadLocations){
                for(let i in roadLocations){
                    room.visual.circle(roadLocations[i].x, roadLocations[i].y, {fill: "#ADD8E6", stroke: "#4863A0"});
                }
            }
        }
    }

    function visualizeDistanceTransform(roomName){
        if(!Game.rooms[roomName]){
            return;
        }
        let dt = Game.rooms[roomName].getDistanceTransform();
        for (let x = 0; x < 50; ++x) {
            for (let y = 0; y < 50; ++y) {
                // Game.rooms[roomName].visual.text(dt.get(x, y), x, y, { font: 0.5 });
                Game.rooms[roomName].visual.circle(x, y, {radius:dt.get(x, y)/75});
            }
        }
    }

    return {
        visualizeWalls : visualizeWalls,
        visualizeRoadLocations: visualizeRoadLocations,
        visualizeDistanceTransform: visualizeDistanceTransform,
        distanceTransform: distanceTransform
    }
})();
