module.exports = (function(){
    var generate = function(){
        if(Game.cpu.bucket >= 5000){
            if(Game.cpu.generatePixel() === OK) {
                console.log("Generated a pixel:" + Game.resources[PIXEL])
            }
        }
    };

    var publicAPI = {};
    publicAPI.generate = generate;
    return publicAPI;
})();

