function AStar(inputMap,distanceFunc,onIteration) {
    this.inputMap = inputMap;
    this.onIteration = onIteration;
    this.map = new Map();
    var size = inputMap.size();
    
    /**
     * Initialize map, but don't initialize nodes yet. We will do that on the fly.
     */
    this.map.size(size.width,size.height,function(x,y) {
        return null;
    });
            
    /**
     * Node class
     * This is an inner Class for this specific AStar instance.
     * Stores closed flag and stores the g h  values of A-Star
     */
    this.Node = function() {
        this.closed = false;
        
        /** Coordinates to previous node. Use to reconstruct the path from goal 
         *  to start.
         */
        this.previousNodeCoord = undefined;
        
        /**
         * Path cost from here to the start
         */
        this.g = undefined;
        
        /**
         *  Minimum path cost from here to the goal
         */
        this.h = undefined;
    };
    
    /**
     * Reference to map.
     * added into the prototype.
     * Member functions can access the map directly through this shared reference.
     */
    this.Node.prototype.map  = this.map; 
       
    /** 
     * Computes the G value and sets the g property. The G value is the actual 
     * path cost from this node to the start.
     */
    this.Node.prototype.computeG = function(previousNodeCoord,thisNodeCoord) {
        var previousNode = this.map.tiles[previousNodeCoord.y][previousNodeCoord.x];
        this.g = this.distance(previousNodeCoord,thisNodeCoord)+
            previousNode.g;
    };
    
    /**
     * Computes the H value and sets the h property. The H value is best case
     * path cost from here to the goal.
     */
    this.Node.prototype.computeH = function(thisNodeCoord,goalNodeCoord) {
        this.h = this.distance(thisNodeCoord,goalNodeCoord);  
    };
       
    /** 
     * Returns the sum of g and h and which is the best-case path cost from 
     * start to finish going through this node.
     */
    this.Node.prototype.getF = function() {
        return this.g+this.h;
    };
        
    //Use distance implementation specifed by AStar constructor 
    this.Node.prototype.distance = distanceFunc;
}

/** 
 * Returns an array of objects with the properties:
 *  - node an open node, that is a neighbour of the node at coordinatesa coord.
 *  - coord the coordinates of the neighbour node.
 * by cooord which are not yet closed.
 * The associated neighbour nodes' g and h are also guaranteed to be initialized.
 */
AStar.prototype.getOpenNeighbours = function(coord) {
    var neighbourCoordsArray = [ 
        {x:coord.x,y:coord.y-1},
        {x:coord.x,y:coord.y+1},
        {x:coord.x-1,y:coord.y},
        {x:coord.x+1,y:coord.y} ];
                            
    var openNeighbours = [];
    
    function onNewNeighbour(neighbourCoord) {
        var newNode  = null;
        var tile = this.inputMap.tiles[coord.y][coord.x];
        
        if( tile.type() == tile.emptyType )
        {
            newNode = new this.Node();
        }
        
        return newNode;
    }
    
    for(var i = 0; i < neighbourCoordsArray.length; i++) {
        neighbourCoord = neighbourCoordsArray[i];
            
        var node = this.tryGetNode(neighbourCoord,onNewNeighbour);
        if( node !== undefined && node!==null && !node.closed)
        {
            openNeighbours.push( {node:node,coord:neighbourCoord} );
        }
    }
    
    return openNeighbours;
};

/**
 * Retrieves a node at the specified coordinates.
 * If a node hasn't been initialize it will return the 
 * value returned by calling defaultFunc with coord as parameter. This is set to 
 * the AStar object.
 * The return value of defaultFunc will be stored in the map.
 * If defaultFunc is not specified null is returned.
 * Returns undefined if coord is outside the map.
 */
AStar.prototype.tryGetNode = function(coord,defaultFunc) {
    if( coord.y < 0 || coord.y >= this.map.tiles.length )
        return undefined;
        
    var rowOfNodes = this.map.tiles[coord.y];
    if( coord.x < 0 || coord.x >= rowOfNodes.length )
        return undefined;
    
    var node = rowOfNodes[coord.x]; 
    if(node === null && defaultFunc !== undefined ) {
        node = defaultFunc.call(this,coord);
        this.map.tiles[coord.y][coord.x] = node;
    }
    return node;
    
};

/**
 * Retrieves a node at the specified coordinates.
 * If it happens for the first time a new node object
 * will be created.
 * Returns undefined if coord is outside the map.
 */
AStar.prototype.getNode = function(coord) {
   var _this = this;
   return this.tryGetNode(coord,function() {
      return new _this.Node(); 
   });
};

/** Search for a shortest path between the coordinates specified by the start 
 * property and the goal property.
 * Returns an array with the coordinates of all nodes (including start and goal)
 * on the shortest path. The array is empty if no path can be found.
 */
AStar.prototype.searchPath = function () {
    var _this = this;
    var queue = new PriorityQueue(function (aCoord,bCoord) {
        return _this.getNode(aCoord).getF() < _this.getNode(bCoord).getF();   
    });
    
    var startNode = this.getNode(this.start);
    startNode.g = 0;
    startNode.computeH( this.start , this.goal );
    startNode.previousNodeCoord = this.start;
    
    queue.insert(this.start);
    
    while( !queue.empty() ) {
        var currentCoord = queue.extractMin();
        
        if( currentCoord.x == this.goal.x && currentCoord.y == this.goal.y ) {
            return this.reconstructPath(currentCoord);   
        }
        
        this.getNode( currentCoord ).closed = true;
        
        var openNeighbours = this.getOpenNeighbours( currentCoord );
        
        for( var i = 0; i<openNeighbours.length; i++ ) {
            var neighbour = openNeighbours[i];
            var neighbourNode = neighbour.node;
            
            var oldG = neighbourNode.g;
            
            neighbourNode.computeG( currentCoord, neighbour.coord );
            
            if( oldG !== undefined ) {
                if( oldG > neighbourNode.g )
                {                    
                    queue.heapifyUp( queue.find( neighbour.coord , 
                        function (a,b) {
                            return a.x == b.x && a.y == b.y;
                        }) );
                }
                //this node is already in the open list
                //with a better or equal g.
            }
            else {
                neighbourNode.computeH( neighbour.coord, this.goal );
                neighbourNode.previousNodeCoord = currentCoord;
            
                queue.insert(neighbour.coord);
            }
        }
        
        if( this.onIteration !== undefined )
            this.onIteration.call(this);           
    }
    
    return [];
};

/** 
 * Reconstructs the shortest path from the map. Returns an array starts with 
 * the start node coordinates and ends with the goal node coordinates.
 * 
 * The node coordinates are extracted by back-tracking the shortest path
 * using the previousNodeCoord property of the nodes 
 * until the start.
 */

AStar.prototype.reconstructPath = function(goalCoord) {
  var path = [goalCoord];
  var coord = goalCoord;
  
  while( coord != this.start ) {
      coord = this.getNode(coord).previousNodeCoord;
      path.push( coord );
  }
  
  return path.reverse();
};
