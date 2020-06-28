# An implementation of Screeps AI

## Overview
[Screeps](https://screeps.com/) is an open-world RTS game where units are controlled by defining their AI. This project has the current state of my screeps implementation.

## Installation
```
npm install -g grunt-cli
npm install
cp env.sample.yaml
// Update yaml with account values
```

## Usage
To fetch code from the screeps server
```
grunt fetch
```

To publish code from the screeps server
```
grunt
```

Notes on gameplay
- Entering a room for the first time will initialize flags
    - A **disabled-[room-name]** flag which when deleted will cause the room to be run room processing each tick.
    - A set of **[structure-type]-[room-name]** flags in default locations where construction sites will automatically be generated. 
    They can be moved around manually to customize the room.
    - A set of **[unit-type]-[room-name]** flags which changing the color will change the number of units spawned in that room.
- Setting a **Rally-[room-name]** flag will cause all attack units to swarm to the flag
- Setting an **Explore** flag in a room will cause an explore unit to spawn and navigate to that room
- Adding a flag named **Parent-[child-room-name]** will set a parent-child relationship between two rooms



## Grafana Dashboard
Set up grafana per specifications on this project.
https://github.com/screepers/screeps-grafana

The dashboard backed up here looks like this.
![image](https://user-images.githubusercontent.com/83574/85636670-1e956400-b64f-11ea-931d-33fda47da8d7.png)
