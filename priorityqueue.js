/**
 * Implements a priority queue using a binary heap.
 * The less function is used to compare two object.
 */
function PriorityQueue(less) {
  this.heap = [];  
  this.less = less;
}

/**
 * Return true if queue is empty
 */
PriorityQueue.prototype.empty = function() {
  return this.heap.length === 0;
};

/** 
 * insert object into the queue.
 */
PriorityQueue.prototype.insert = function(object) {
    this.heap.push(object);
    this.heapifyUp(this.heap.length-1);
};

/** 
 * return the object that is smaller than all other objects in the queue
 * according to the less function.
 */
 
PriorityQueue.prototype.extractMin = function() {
    if( this.empty() )
        return undefined;
        
    var min = this.heap[0];
        
    if( this.heap.length > 1 ) {
        this.heap[0] = this.heap.pop();
    
        this.heapifyDown(0);
    }
    else {
        this.heap = [];
    }
    
    return min;
};

/** 
 * swaps the elements at i1 and i2 with each other.
 */
PriorityQueue.prototype.swap = function(i1,i2) {
    var temp = this.heap[i1];
    this.heap[i1] = this.heap[i2];
    this.heap[i2] = temp;
};

/** 
 * If the element at the specified position does not
 * is smaller than both of it's children it corrects 
 * the violation by swapping with one of the children.
 * The function will recursively applied on the changed
 * branch.
 */
PriorityQueue.prototype.heapifyDown = function(i) {
    var left = 2*i+1;
    var right = 2*i+2;
    var smallest = i;
    var length = this.heap.length;
    
    if( left < length && !this.less(this.heap[smallest],this.heap[left]) )
        smallest = left;
    if( right < length && !this.less(this.heap[smallest],this.heap[right]) )
        smallest = right;
        
    if( smallest != i )
    {
        this.swap( i,smallest );
        
        //this.heap[smallest] contains potentially an element
        //that violates the heap property
        //we call heapifyDown again to fix it.
        this.heapifyDown( smallest );
    }
};

/** 
 * If the parent of the element at the specified position is not
 * smaller than the element.Boths elements are swapped. 
 * The function will recursively applied on the changed parent branch.
 * 
 */
PriorityQueue.prototype.heapifyUp = function(i) {
    if( i == 0 )
        return;
        
    var smaller = Math.floor((i-1)/2);
    if( smaller == i )
        return;
    
    if( !this.less(this.heap[smaller],this.heap[i]) )
    {
        this.swap(smaller,i);
        //this.heap[smaller] contains potentially an element
        //that violates the heap property
        //we call heapifyUp again to fix it.
        this.heapifyUp( smaller );
    }
};

/**
 * Search an element in the queue. The compareFunc is used 
 * to compare the object with the elements of the queue.
 * Returns the index if found otherwise undefined.
 */
PriorityQueue.prototype.find = function(toFind,compareFunc ) {
  for(var i = 0; i<this.heap.length; i++ ) {
    if( compareFunc(this.heap[i],toFind) )
        return i;
  };
  return undefined;
};

