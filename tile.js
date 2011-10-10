function TileBase()
{    
}
TileBase.prototype.obstacleType = 1;
TileBase.prototype.emptyType = 0;

function Tile() {        
    TileBase.call(this);   
    this._type = this.emptyType;
}

Tile.prototype = Object.create(TileBase.prototype);

/** 
 * Returns or sets the tile type.
 */
Tile.prototype.type = function(type) {

        if(arguments.length === 0)
            return this._type;
        this._type = type;
};

Tile.prototype.copyFrom = function(toCopy) {
        this.type( toCopy.tile() );
};

    
