module.exports = (function(){
    Flag.prototype.settingsMap = {
      0 : COLOR_WHITE,
      1 : COLOR_GREY,
      2 : COLOR_RED,
      3 : COLOR_PURPLE,
      4 : COLOR_BLUE,
      5 : COLOR_CYAN,
      6 : COLOR_GREEN
    };
    /**
     Flag.prototype.getSetting = function(){
        console.log("requesting "+this.secondaryColor);
        console.log(this.settingsMap[this.secondaryColor]);
        if(typeof this.settingsMap[this.secondaryColor]== "number"){
            console.log("found a match");
            return this.settingsMap[this.secondaryColor];
        } else {
            console.log("returning 1");
            return 1;
        }
    };

     Flag.prototype.setSetting = function(settingValue){
        for(var i in this.settingsMap){
            if(this.settingsMap[i] == settingValue){
                this.setColor(COLOR_WHITE, i);
                return;
            }
        }
        this.setColor(COLOR_WHITE, COLOR_GREY);
    }
     **/

    Flag.prototype.getSetting = function(){
      /**
       console.log("requesting "+this.room.name+" "+this.secondaryColor);
       for(var i in this.settingsMap){
            if(this.settingsMap[i] == this.secondaryColor){
                console.log("found a match");
                console.log(i);
            }
        }
       this.setColor(COLOR_WHITE, COLOR_GREY);

       **/
      switch (this.secondaryColor) {
        case COLOR_WHITE:
          return 0;
        case COLOR_GREY:
          return 1;
        case COLOR_RED:
          return 2;
        case COLOR_PURPLE:
          return 3;
        case COLOR_BLUE:
          return 4;
        case COLOR_CYAN:
          return 5;
        case COLOR_GREEN:
          return 6;
        default:
          return 1;
      }
    };
  }
)();