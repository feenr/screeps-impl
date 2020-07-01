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

### Notes on gameplay
- Entering a room for the first time will initialize flags which give a small amount of control over the AI
    - A **disabled-[room-name]** flag which when deleted will cause the room to be processed each tick.
    - A set of **[structure-type]-[room-name]** flags in default locations where construction sites will automatically be generated. 
    They can be moved around manually to customize the room.
    - A set of **[unit-type]-[room-name]** flags which changing the color will change the number of units spawned in that room.
- Setting a **Rally** flag will cause all attack units to swarm to the flag
- Setting an **Explore** flag in a room will cause an explore unit to spawn and navigate to that room
- Setting a **Claim** flag in a room will cause an  reserver and a spawn builder to attempt to claim that room (I don't believe this is currently working, but that's the intent)
- Adding a flag named **Parent-[child-room-name]** will set a parent-child relationship between two rooms

### Typical room
![image](https://user-images.githubusercontent.com/83574/85935277-f4e17480-b8bc-11ea-9011-c79dde6e4edb.png)

## Typical log
![image](https://user-images.githubusercontent.com/83574/86196050-56554d80-bb20-11ea-91fe-9c0af0626a76.png)

## Grafana Dashboard
Set up grafana per specifications on this project.
https://github.com/screepers/screeps-grafana

The dashboard backed up here looks like this.
![ScreepsDashboard](https://user-images.githubusercontent.com/83574/86077078-51799680-ba59-11ea-8641-58bdacad4f1e.png)
