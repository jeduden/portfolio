function Map() {  
}

Map.prototype.constructTiles = function(width,height,tileConstructor) {
    this._size = {width:width,height:height};
    this.tiles = new Array(height);
        
    for(var y = 0; y<height; y++){        
        var rowOfTiles = new Array(width);
        
        this.tiles[y] = rowOfTiles;        
        for(var x = 0; x < width; x++ ) {   
            rowOfTiles[x] = tileConstructor.call(this,x,y);
        }
    }
};

/** 
 * Returns or sets the size of the map.
 */
Map.prototype.size = function(width,height,tileConstructor) {
    if( arguments.length === 0) {
        return this._size;
    }
    else if( arguments.length == 3 ) {
        this.constructTiles(width,height,tileConstructor);   
    }
    else {
        throw "Invalid Argument. size function accepts only 0 or 3 parameters.";
    }
};

/** Iterates over all tiles and calls for each tile the function func.
 *this is set to the map.
 */    
Map.prototype.forEachTile = function(func) {
    for(var y = 0; y<this.tiles.length; y++) {
        var rowOfTiles = this.tiles[y];
        for(var x = 0; x<rowOfTiles.length; x++) {
            func.call(this,x,y,rowOfTiles[x]);
        }
    }        
};   
