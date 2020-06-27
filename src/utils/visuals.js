module.exports = function(room){

    let viz = room.visual;
    let terrain = new Room.Terrain(room.name);

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

    let eastExitExists = false;
    let eastPath = [];

    let southExitExists = false;
    let southPath = [];

    let westExitExists = false;
    let westPath = [];

    let northExitExists = false;
    let northPath = [];

    for(let x = 0; x<50; x++){
        let northTerrain = terrain.get(x, 0);
        let bestNothCost = 100000;
        if(northTerrain === TERRAIN_MASK_WALL || northTerrain === TERRAIN_MASK_SWAMP){
            northExitExists = true;
        }

        let bestSouthCost = 100000;
        let southTerrain = terrain.get(x, 49);
        if(southTerrain === TERRAIN_MASK_WALL || southTerrain === TERRAIN_MASK_SWAMP){
            southExitExists = true;
        }
    }

    for(let y = 0; y<50; y++){
        let bestWestCost = 100000;
        let westTerrain = terrain.get(x, 0);
        if(westTerrain === TERRAIN_MASK_WALL || westTerrain === TERRAIN_MASK_SWAMP){
            westExitExists = true;
        }
        let bestEastCost = 100000;
        let eastTerrain = terrain.get(x, 49);
        if(eastTerrain === TERRAIN_MASK_WALL || eastTerrain === TERRAIN_MASK_SWAMP){
            eastExitExists = true;
        }
    }

};