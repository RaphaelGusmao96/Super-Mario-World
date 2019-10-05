import Mario from './objects/Mario';
import Collider from './Collider';
import tilemap from './tilemap';

export default class Game {
    constructor(height, width){
        this.height = height;
        this.width = width;
        this.gravity = 20;
        this.objects = new Set();
        this.mario = new Mario();
        this.objects.add(this.mario);
        this.layers = [];
        this.totalTime = 0;

        this.tileMap = [];
        this.tileSize = 29;
        this.collider = new Collider(this.tileMap);
        this.setTilemapLayer = this.setTilemapLayer.bind(this);
        this.cameraView = this.cameraView.bind(this);
        this.setTilemapLayer();
    }
    update(deltaTime) {
        this.objects.forEach(object => {
            object.update(deltaTime); //updates velocities
            object.frames = (object.frames + 1) % 60;
            object.lastPos.x = object.pos.x;
            object.lastPos.y = object.pos.y;
            object.pos.x += object.vel.x * deltaTime;
            this.collider.checkX(object);
            
            object.vel.y += this.gravity;
            object.pos.y += object.vel.y * deltaTime;
            this.collider.checkY(object);
            // this.collider.checkCollision(object, this.width, this.height);
        })

        this.totalTime += deltaTime;
    }

    setTilemapLayer() {
        tilemap.backgrounds.forEach(background => {
            background.ranges.forEach(range => {
                const [xStart, xLength, yStart, yLength] = range;
                const xEnd = xStart + xLength;
                const yEnd = yStart + yLength;
                for (let x = xStart; x < xEnd; x++) {
                    for (let y = yStart; y < yEnd; y++) {
                        this.setTile(x, y, {
                            name: background.tile,
                            type: background.type
                        })
                    }
                }
            });
        });
    }

    setTile(x, y, tile){
        if(!this.tileMap[x]) this.tileMap[x] = [];
        this.tileMap[x][y] = tile;
    }
    getTile(x,y){
        if(this.tileMap[x]) return this.tileMap[x][y];
    }
    cameraView(camera, backgroundSpriteSheet, ctx){
        // center camera on mario
        //scrolling commented out for testing
        if ( this.mario.pos.x > 300) {
            camera.pos.x = this.mario.pos.x - 300;
        }
    
        const cameraPanel = document.createElement('canvas');
        cameraPanel.width = camera.width + this.tileSize;
        cameraPanel.height = camera.height;
        const panelCtx = cameraPanel.getContext('2d');
        // first need to figure out what tile columns to draw
        const columnStart = this.getTileIndex( camera.pos.x);
        const columnEnd = columnStart + this.getTileIndex( camera.width);

        // draw what the camera is focusing on
        for (let x = columnStart; x <= columnEnd; x++) {
            const column = this.tileMap[x];
            if (column) {
                column.forEach((tile, y) => {
                    if (tile.name === "mysteryBox") {

                        // drawAnim(name, context, x, y, distance) {
                        //     const animation = this.animations.get(name);
                        //     this.drawTile(animation(distance), context, x, y);
                        // }
                        const boxAnimation = ["mysteryBox1", "mysteryBox2", "mysteryBox3", "mysteryBox4"];
                        const frame = Math.floor(this.totalTime / 0.15) % boxAnimation.length;
                        // debugger
                        backgroundSpriteSheet.draw( boxAnimation[frame], panelCtx, (x - columnStart) * this.tileSize, y * this.tileSize);
                    } else {
                        backgroundSpriteSheet.draw(tile.name, panelCtx, (x - columnStart) * this.tileSize, y * this.tileSize);
                    }
                });
            }
        }
        const marioPosX = this.getTileIndex(this.mario.pos.x) + 1;
        const marioPosY = this.getTileIndex(this.mario.pos.y) + 1;
        let tileName = this.getTile(marioPosX, marioPosY);
        if (tileName) tileName = tileName.name;
        console.log("x: ", marioPosX, ", y: ", marioPosY, ", tilename: ", tileName);
        //draw camera by pixel for a smooth transition
        return cameraPanel;
    }
    getTileIndex(pos){
        return Math.floor(pos / this.tileSize)
    }
}