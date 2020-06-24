 module.exports = (function(){
    publicAPI = {};
    
    publicAPI.partCosts = {
        move : 50,
        work : 100,
        carry : 50,
        attack : 80,
        ranged_attack : 150,
        heal : 250,
        tough : 10
    }
    
    return publicAPI;
 })();