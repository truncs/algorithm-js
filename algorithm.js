// -*- tab-width:4 -*- 

/*
 * Copyright (c) 2011 Dhruv Matani
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */


//
// Documentation for most of the stuff can be found here:
// http://www.sgi.com/tech/stl/table_of_contents.html
//

var assert = require('assert').ok;


//
// A queue made out of 2 stacks.
// 
// Amortized cost of push: O(1)
// Amortized cost of pop:  O(1)
// Amortized cost of top:  O(1)
// Cost of remove:         O(n)
//
function Queue() {
	this._push_stack = [];
	this._pop_stack  = [];

	this.push.apply(this, arguments);
}

Queue.prototype = {
	push: function(elem) {
		for (var i = 0; i < arguments.length; ++i) {
			this._push_stack.push(arguments[i]);
		}
	}, 
	pop: function() {
		if (this.length === 0) {
			console.error("INVALID POP");
			throw { message: "Nothing in the Queue to pop" };
		}
		var _top = this.top;
		this._pop_stack.pop();
		return _top;
	}, 
	remove: function(elem) {
		var _tgt_stack = this._pop_stack;
		var _tgt_index = -1;

		_tgt_index = this._pop_stack.indexOf(elem);
		if (_tgt_index == -1) {
			_tgt_stack = this._push_stack;
			_tgt_index = this._push_stack.indexOf(elem);
		}

		if (_tgt_index != -1) {
			_tgt_stack.splice(_tgt_index, 1);
		}
	}, 
	_copy_push_to_pop: function() {
		this._push_stack.reverse();
		this._pop_stack = this._push_stack;
		this._push_stack = [ ];
	}
};

Queue.prototype.__defineGetter__('top', function() {
	if (this.length === 0) {
		return;
	}

	if (this._pop_stack.length === 0) {
		this._copy_push_to_pop();
	}

	return this._pop_stack.slice(-1)[0];
});

Queue.prototype.__defineGetter__('length', function() {
	return this._push_stack.length + this._pop_stack.length;
});


exports.Queue = Queue;
exports.FIFO  = Queue;


//
// A stack has the following operations:
// push: O(1)
// pop:  O(1)
// top:  O(1)
//
function Stack() {
}

Stack.prototype = Array;
Stack.prototype.__defineGetter__('top', function () {
	return this.slice(this.length - 1)[0];
});

exports.Stack = Stack;
exports.LIFO  = Stack;
exports.FILO  = Stack;


//
// Comparators:
// Generate GT(>) from LT(<)
//
function cmp_lt(lhs, rhs) {
	return lhs < rhs;
}

function cmp_gt_gen(cmp_lt) {
	return function(lhs, rhs) {
		return cmp_lt(rhs, lhs);
	};
}

function cmp_eq_gen(cmp_lt) {
	return function(lhs, rhs) {
		return !cmp_lt(lhs, rhs) && !cmp_lt(rhs, lhs);
	};
}

function cmp_lt_eq_gen(cmp_lt) {
	var cmp_eq = cmp_eq_gen(cmp_lt);
	return function(lhs, rhs) {
		return cmp_lt(lhs, rhs) || cmp_eq(rhs, lhs);
	};
}

function cmp_gt_eq_gen(cmp_lt) {
	return function(lhs, rhs) {
		return !cmp_lt(lhs, rhs);
	};
}


var cmp_gt    = cmp_gt_gen(cmp_lt);
var cmp_eq    = cmp_eq_gen(cmp_lt);
var cmp_lt_eq = cmp_lt_eq_gen(cmp_lt);
var cmp_gt_eq = cmp_gt_eq_gen(cmp_lt);



function js_cmp_gen(cmp_lt) {
	var cmp_gt = cmp_gt_gen(cmp_lt);
	return function(lhs, rhs) {
		return (cmp_lt(lhs, rhs) ? -1 : (cmp_gt(lhs, rhs) ? 1 : 0));
	};
}

exports.cmp_gt_gen = cmp_gt_gen;
exports.cmp_eq_gen = cmp_eq_gen;
exports.cmp_gt_eq_gen = cmp_gt_eq_gen;
exports.cmp_lt_eq_gen = cmp_lt_eq_gen;

exports.cmp_lt = cmp_lt;
exports.cmp_gt = cmp_gt;
exports.cmp_lt_eq = cmp_lt_eq;
exports.cmp_gt_eq = cmp_gt_eq;
exports.cmp_eq = cmp_eq;


exports.js_cmp_gen = js_cmp_gen;



//
// A heap has the following operations:
// push/insert: O(log n)
// pop:         O(log n)
// top:         O(1)
// constructor: O(n log n)
//
function Heap(cmp, repr) {
	this._cmp = cmp || cmp_lt;
	this._repr = repr || [ ];

	if (this._repr.length > 0) {
		this._make_heap();
	}
}

Heap.prototype = {
	pop: function() {
		var _top = this.top;

		// console.log("REPR:", this._repr);

		// We assume that there is at least 1 element in the heap
		var _bot = this._repr.pop();

		if (this.length > 0) {
			this._repr[0] = _bot;
			this._bubble_down(0);
		}
		return _top;
	}, 
	push: function(elem) {
		for (var i = 0; i < arguments.length; ++i) {
			this._repr.push(arguments[i]);
			this._bubble_up(this.length - 1);
		}
	}, 
	_make_heap: function() {
		// Could be made O(n) later. Currently is O(n log n)
		for (var i = 1; i < this._repr.length; ++i) {
			this._bubble_up(i);
		}
	}, 
	_swap: function(pi, ci) {
		return _swap(this._repr, pi, ci);
	}, 
	_bubble_up: function(i) {
		// var don = this._repr[i] == 21;
		while (i > 0) {
			var pi = ((i % 2) === 0 ? i - 2 : i - 1) / 2;

			// If Value at Child is (lt) cmp value at Parent, we swap the 2.
			// if (don) { console.log("bubble up: parent", this._repr[pi], "child", this._repr[i]); }
			if (this._cmp(this._repr[i], this._repr[pi])) {
				// if (don) { console.log("swapped"); }
				this._swap(pi, i);
				i = pi;
			}
			else {
				i = 0;
			}
		}
		// if (don) { console.log("_repr:", this._repr); }
	},
	_bubble_down: function(i) {
		var _eof = false;
		var self = this;

		while (!_eof) {
			_eof = true;
			var ci1 = i * 2 + 1;
			var ci2 = i * 2 + 2;

			var candidates = [ 
				{ index: ci1, value: this._repr[ci1] }, 
				{ index: ci2, value: this._repr[ci2] }
			].filter(function(v) {
				return v.index < self._repr.length;
			});

			candidates.sort(function(lhs, rhs) {
				return js_cmp_gen(self._cmp)(lhs.value, rhs.value);
			});

			// console.log("Candidates:", candidates);

			if (candidates.length > 0) {
				var candidate = candidates[0];

				if (this._cmp(candidate.value, this._repr[i])) {
					// The smallest child is smaller than the value at 'i'.
					// We swap the 2.
					// console.log("swapping", this._repr[i], "with", candidate.value);
					this._swap(i, candidate.index);
					_eof = false;
					i = candidate.index;
				}
			}

		} // while (!_eof)

	} // _bubble_down()

};

Heap.prototype.__defineGetter__('top', function() {
	return this._repr[0];
});

Heap.prototype.__defineGetter__('length', function() {
	return this._repr.length;
});

Heap.prototype.insert = Heap.prototype.push;



exports.Heap = Heap;
exports.PriorityQueue = Heap;
exports.MinHeap = function(repr) {
	return new Heap(cmp_lt, repr);
};
exports.MaxHeap = function(repr) {
	return new Heap(cmp_gt, repr);
};

// Modifies the array in-place (uses extra memory though)
exports.heap_sort = function(repr, cmp) {
	cmp = cmp || cmp_lt;
	var h = new Heap(cmp, repr);
	var tmp = [ ];
	while (h.length > 0) {
		tmp.push(h.pop());
	}
	tmp.unshift(0, 0);
	repr.splice.apply(repr, tmp);
	return repr;
};

//
// A min-max-heap has the following operations:
// push/insert: O(log n)
// pop_min:     O(log n)
// min:         O(1)
// pop_max:     O(log n)
// max:         O(1)
// constructor: O(n log n)
//
// http://www.cs.otago.ac.nz/staffpriv/mike/Papers/MinMaxHeaps/MinMaxHeaps.pdf
// 
// Note: lt MUST be a < comparator
//
function MinMaxHeap(lt, repr) {
	this._lt   = lt || cmp_lt;
	this._gt   = cmp_gt_gen(this._lt);
	this._repr = repr || [ ];

	if (this._repr.length > 0) {
		this._make_heap();
	}
}

MinMaxHeap.prototype = {
	_make_heap: function() {
		for (var i = 0; i < this._repr.length; ++i) {
			this._bubble_up(i);
			// console.log(this._repr.slice(0, i+1).toString());
		}
	}, 

	_is_level_min_level: function(level) {
		return (level % 2) === 0;
	}, 

	_is_index_min_level: function(i) {
		return this._is_level_min_level(Math.floor(Math.log(i+1) / Math.log(2.0)));
	}, 

	_parent_index: function(i) {
		return ((i % 2) === 0 ? i - 2 : i - 1) / 2;
	}, 
	
	_grand_parent_index: function(i) {
		return this._parent_index(this._parent_index(i));
	},

	_bubble_up: function(i) {
		if (i === 0) {
			return;
		}

		var pi = this._parent_index(i);

		if (this._is_index_min_level(i)) {
			if (this._gt(this._repr[i], this._repr[pi])) {
				_swap(this._repr, i, pi);
				this._bubble_up_max(pi);
			}
			else {
				this._bubble_up_min(i);
			}
		}
		else {
			if (this._lt(this._repr[i], this._repr[pi])) {
				_swap(this._repr, i, pi);
				this._bubble_up_min(pi);
			}
			else {
				this._bubble_up_max(i);
			}
		}
	}, 

	_bubble_up_min: function(i) {
		var gpi = this._grand_parent_index(i);
		if (i == 0 || gpi < 0) {
			return;
		}

		if (this._lt(this._repr[i], this._repr[gpi])) {
			_swap(this._repr, i, gpi);
			this._bubble_up_min(gpi);
		}
	}, 

	_bubble_up_max: function(i) {
		var gpi = this._grand_parent_index(i);
		if (i == 0 || gpi < 0) {
			return;
		}

		if (this._gt(this._repr[i], this._repr[gpi])) {
			_swap(this._repr, i, gpi);
			this._bubble_up_max(gpi);
		}
	}, 

	_get_candidate_nodes: function() {
		var ret = [ ];
		for (var i = 0; i < arguments.length; ++i) {
			var index = arguments[i];
			ret.push({
				index: index, 
				value: this._repr[index]
			});
		}
		return ret;
	}, 

	_get_valid_children_and_grand_children: function(i) {
		var opts = this._get_candidate_nodes(i*2+1, i*2+2, 
			(i*2+1)*2 + 1, (i*2+1)*2 + 2, 
			(i*2+2)*2 + 1, (i*2+2)*2 + 2);

		var self = this;
		
		opts = opts.filter(function(opt) {
			return opt.index < self._repr.length;
		});

		return opts;
	}, 

	_bubble_down: function(i) {
		if (this._is_index_min_level(i)) {
			this._bubble_down_min(i);
		}
		else {
			this._bubble_down_max(i);
		}
	}, 

	_bubble_down_min: function(i) {
		var opts = this._get_valid_children_and_grand_children(i);
		var self = this;

		opts.sort(function(lhs, rhs) {
			return js_cmp_gen(self._lt)(lhs.value, rhs.value);
		});

		if (opts.length == 0) {
			return;
		}

		var opt = opts[0];

		if (opt.index < i*2+3 /* Is i a parent or grandparent of opt? */) {
			// Parent
			if (opt.value < this._repr[i]) {
				_swap(this._repr, opt.index, i);
			}
		}
		else {
			// Grandparent
			if (opt.value < this._repr[i]) {
				_swap(this._repr, opt.index, i);
				var _pi = this._parent_index(opt.index);
				if (this._repr[_pi] < this._repr[opt.index]) {
					_swap(this._repr, opt.index, _pi);
				}
				this._bubble_down_min(opt.index);
			}
		}
	}, 

	_bubble_down_max: function(i) {
		var opts = this._get_valid_children_and_grand_children(i);
		var self = this;

		opts.sort(function(lhs, rhs) {
			return js_cmp_gen(self._lt)(lhs.value, rhs.value);
		});

		if (opts.length == 0) {
			return;
		}

		var opt = opts[opts.length - 1];

		if (opt.index < i*2+3 /* Is i a parent or grandparent of opt? */) {
			// Parent
			if (opt.value > this._repr[i]) {
				_swap(this._repr, opt.index, i);
			}
		}
		else {
			// Grandparent
			if (opt.value > this._repr[i]) {
				_swap(this._repr, opt.index, i);
				var _pi = this._parent_index(opt.index);
				if (this._repr[_pi] > this._repr[opt.index]) {
					_swap(this._repr, opt.index, _pi);
				}
				this._bubble_down_max(opt.index);
			}
		}
	}, 
	
	_move_from_end: function(index) {
		if (index < this.length - 1) {
			this._repr[index] = this._repr[this._repr.length - 1];
		}
		this._repr.pop();
		if (index < this.length) {
			this._bubble_down(index);
		}
	},

	_min: function() {
		return { index: 0, value: this._repr[0] };
	}, 
	
	_max: function() {
		if (this.length == 1) {
			return this._min();
		}

		var opts = [
			{ index: 1, value: this._repr[1] }, 
			{ index: 2, value: this._repr[2] }
		];
		var self = this;

		opts = opts.filter(function(opt) {
			return opt.index < self._repr.length;
		});

		opts.sort(function(lhs, rhs) {
			return js_cmp_gen(self._lt)(lhs.value, rhs.value);
		});

		if (opts.length == 0) {
			return;
		}

		var opt = opts[opts.length - 1];

		return opt;
	},

	push: function(elem) {
		for (var i = 0; i < arguments.length; ++i) {
			this._repr.push(arguments[i]);
			this._bubble_up(this._repr.length - 1);
		}
	},

	pop_min: function() {
		var _min = this._min();
		this._move_from_end(_min.index);
		return _min.value;
	}, 
	
	pop_max: function() {
		var _max = this._max();
		this._move_from_end(_max.index);
		return _max.value;
	}

};

MinMaxHeap.prototype.insert = MinMaxHeap.prototype.push;

MinMaxHeap.prototype.__defineGetter__('length', function() {
	return this._repr.length;
});

MinMaxHeap.prototype.__defineGetter__('min', function() {
	return this._min().value;
});

MinMaxHeap.prototype.__defineGetter__('max', function() {
	return this._max().value;
});


exports.MinMaxHeap      = MinMaxHeap;
exports.PriorityDequeue = MinMaxHeap;



//
// A Trie has the following operations:
// insert:      O(length of string to be inserted)
// remove:      O(length of string to be removed)
// remove_many: O(items to be removed * avg. length of each item)
// forEach:     O(n)
//
function Trie() {
	this.root = { lf: false };
	this._length = 0;
}

Trie.prototype = {
	insert: function() {
		for (var i = 0; i < arguments.length; ++i) {
			this._insert(arguments[i]);
		}
	}, 
	
	_insert: function(s) {
		var r = this.root;
		for (var i = 0; i < s.length; ++i) {
			var ch = s[i];
			if (!(ch in r)) {
				r[ch] = { lf: false };
			}
			r = r[ch];
		}

		if (!r.lf) {
			r.lf = true;
			this._length += 1;
		}

	}, 

	remove_many: function() {
		var ret = 0;
		for (var i = 0; i < arguments.length; ++i) {
			ret += (this.remove(arguments[i]) ? 1 : 0);
		}
		return ret;
	}, 

	remove: function(s) {
		var stat = this._remove(s, this.root);
		this._length -= (stat ? 1 : 0);
		return stat;
	}, 

	_remove: function(s, r) {
		if (!r) {
			// console.log("r is falsy, s ==", s);
			return false;
		}

		if (s.length == 0) {
			var lf = r.lf;
			r.lf = false;
			return lf;
		}

		var _r = r[s[0]];
		var stat = this._remove(s.substring(1), _r);

		if (!stat) {
			// console.log("Error removing:", s[0], "from", s, _r);
			return false;
		}

		if (Object.keys(_r).length == 1 && !_r.lf) {
			// We can drop this node
			delete r[s[0]];
		}

		return true;
	}, 

	exists: function(s) {
		return this._exists(s, this.root);
	}, 

	_exists: function(s, r) {
		if (!r) {
			return false;
		}

		if (s.length == 0) {
			return r.lf;
		}

		var _r = r[s[0]];
		return this._exists(s.substring(1), _r);
	}, 
	
	_forEach: function(r, proc, accum, i) {
		if (!r) {
			return 0;
		}

		var _i = 0;
		if (r.lf) {
			proc(accum.join(''), _i + i);
			_i += 1;
		}

		var keys = Object.keys(r);
		keys.sort();
		for (var index in keys) {
			var ch = keys[index];
			if (ch != 'lf') {
				accum.push(ch);
				_i += this._forEach(r[ch], proc, accum, _i + i);
				accum.pop();
			}
		}

		return _i;
	}, 

	forEach: function(proc) {
		this._forEach(this.root, proc, [], 0);
	}

};

Trie.prototype.__defineGetter__('length', function() {
	return this._length;
});

exports.Trie = Trie;


//
// The Disjoint Set Data Structure is explained here:
//
// https://secure.wikimedia.org/wikipedia/en/wiki/Disjoint-set_data_structure
// and here:
// http://www.topcoder.com/tc?module=Static&d1=tutorials&d2=disjointDataStructure
//
// and this implementation supports the following operations:
//
// create:         O(1) - The constructor create a DisjointSet with a single element
// representative: O(n) (worst case) - Returns the representative Set for this Set
// union:          O(1) - UNIONs 2 sets into one
//
function DisjointSet(value) {
    this._length = 1;
    this.value = value;
    this.parent = this;
    // console.log("Set ctor:", this);
}

DisjointSet.prototype = {
    representative: function() {
		if (this.parent === this) {
			return this;
		}

		var p = this.parent.representative();
		this.parent = p;
		return p;
    }, 

    union: function(other_set) {
		var this_rep  = this.representative();
		var other_rep = other_set.representative();
		// console.log("this_rep, other_rep:", this_rep, other_rep);
		
		if (this_rep === other_rep) {
			return this_rep;
		}

		// console.log("other_rep.length:", other_rep.length);
		this_rep._length += other_rep.length;
		other_rep.parent = this_rep;
		
		// console.log("union::returning:", this_rep);
		return this_rep;
    }

};

DisjointSet.prototype.__defineGetter__('length', function() {
	var len = this.representative()._length;
	// console.log("length:", len);
	return len;
});

exports.DisjointSet = DisjointSet;

// Red and Black Tree Node 
// 0 => Black
// 1 => Red

function RBTreeNode(value, parent, left, right, color) {
	this.value = value;
	this.parent = parent;
	this.left = left;
	this.right = right;
	this.color = color;
}


// Red and Black is self balancing binary tree
// with the following properties
// 
// 1. A node is either black or red
// 2. The root is black
// 3. All leaves are the same color as the root
// 4. Both children of every red node are black
// 5. Every simple path from a give node to any of the 
// decendant leaves contain the same number of black nodes
// 
// The big-O notations for some of the operations are below 
// ----------------------------------------------------------------------------
// insert: O(logn)
// search: O(logn)
// delete: O(logn)


function RB_Tree(){
	this.root = null;
}

RB_Tree.prototype = {
	insert:function(value){

		// Simple binary search tree insert and we color 
		// the new node red
		var node = this._bst_insert(value);
		
		this._rebalance(node);
				 
	},
	
	remove:function(value) {
		
	},
   
	_rebalance:function(node) {
	
		// If node is at the root of the tree
		// just color the node black and return 
		if (!node.parent) {
			node.color = 0;
			return;			
		}

		// If the node's parent is black 
		// then awesome we don't have to do 
		// anything just return
		if(node.parent.color === 0)
			return;
		
		// If both the parent and uncle of the 
		//  node are red, then change their 
		// color to black. Also change the color 
		// of the grandparent to red. Now this may
		// violate property 2) if the grandparent is 
		// the root node. It may also violate property
		// 4) if the parent of the grand parent is a red 
		// node. So we recursively call this balancing 
		// function on the grandparent of the node
		var gp = this._get_grandparent(node);
		var uncle = this._get_uncle(node);

		if(uncle && uncle.color == 1) {
			node.parent.color = 0;
			uncle.color = 0;
			gp.color = 1;
			this._rebalance(gp);
		}
		
		// If the node's parent is red but the uncle 
		// is black then rotate and move ahead.
		// 
		// 1) If the node's parent is left node of it's 
		// grandparent and the node is right child 
		// of it's parent then left rotate its parent.
		// 2) If the node's parent is the right node 
		// of it's grandparent and the node is left 
		// child of it's parent then right rotate its 
		// parent.

		if(node.parent === gp.left && node.parent.right === node) {
			this._left_rotate(node.parent);
			node = node.left;
		}
		else if (node.parent === gp.right && node.parent.left === node) {
			this._right_rotate(node.parent);
			node = node.right;
			
		}			
		
	},
	
	_bst_insert:function(value) {

		// if root is empty, add a new root node
		// and color it red
		if(!this.root) {
			this.root = RBTreeNode(value, null, null, null, 1);
			return this.root;
		}

		var node = this.root;
		var prev = null;
		while(node) {
			if (value < node.value)
				node = node.left;
			else
				node = node.right;
			
			prev = node;
		}
		
		var n = new RBTreeNode(value, prev, null, null, 1);
		
		if (value < prev.value) 
			prev.left = n;
		else
			prev.right = n;

		
		return n;
						
	},

	_left_rotate : function(node){
		var tmp = node.right;
		if (node.value < node.parent.value) {
			node.parent.left = node.right;
			node.right.parent = node.parent;
			
		}
		else {
			node.parent.right = node.right;
			node.right.parent = node.parent;
		}
		
		node.right = tmp.left;
		tmp.left = node;
		node.parent = tmp;
		
	},

	_right_rotate : function(node) {
        
	},

	_get_grandparent:function(node){
		if(node && node.parent)
			return node.parent.parent;
		else
			return null;
	},
	
	_get_uncle:function(node) {
		var gp = this._get_grandparent(node);
		if(!gp)
			return null;
		if(gp.left === node.parent)
			return gp.right;
		else 
			return gp.left;
	}
	
};


// An AVL Tree Node
function AVLTreeNode(value, parent, height, weight, left, right) {
    this.value  = value;
    this.parent = parent;
    this.height = height;
    this.weight = weight;
    this.left   = left;
    this.right  = right;
}

//
// An AVL tree is a Height Balanced Binary Search Tree
// 
// insert: O(log n)
// remove: O(log g)
// find:   O(log g)
// min:    O(log g)
// max:    O(log g)
// successor: O(log n), amortized O(1)
// predecessor: O(log n), amortized O(1)
// lower_bound: O(log n)
// upper_bound: O(log n)
// find_by_rank: O(log n)
// clear:  O(1)
// length: O(1)
// height: O(1)
// forEach: O(n) (performs an in-order traversal)
// toGraphviz: O(n) Returns a string that can be fed to Graphviz to 
//                  draw a Tree
//
// References:
// http://en.wikipedia.org/wiki/AVL_tree
// http://en.wikipedia.org/wiki/Tree_rotation
// http://closure-library.googlecode.com/svn/docs/closure_goog_structs_avltree.js.source.html
// http://gcc.gnu.org/viewcvs/trunk/libstdc%2B%2B-v3/include/bits/stl_tree.h?revision=169899&view=markup
//
function AVLTree(_cmp_lt) {
    this.cmp_lt = _cmp_lt || cmp_lt;
    this.cmp_eq = cmp_eq_gen(this.cmp_lt);
    this.hooks = [ ];
	this._gw_ctr = 1;

    for (var i = 1; i < arguments.length; ++i) {
		this.hooks.push(arguments[i]);
    }
    this.root = null;
}

AVLTree.prototype = {
    insert: function(value) {
		if (!this.root) {
			this.root = new AVLTreeNode(value, null, 0, 1, null, null);
		}
		else {
			var node = this.root;
			var prev = null;

			while (node) {
				prev = node;
				if (this.cmp_lt(value, node.value)) {
					node = node.left;
				}
				else {
					node = node.right;
				}
			}

			// console.log("Actually inserting:", value);
			// console.log("\ninsert::nodes:", nodes);

			var nn = new AVLTreeNode(value, prev, 0, 1, null, null);
			if (this.cmp_lt(value, prev.value)) {
				// value < nodes.prev.value
				prev.left = nn;
			}
			else {
				// value > nodes.prev.value
				prev.right = nn;
			}

			this._rebalance_to_root(nn);
		}
    }, 

    remove: function(value) {
		var node = this._find_node(value);
		if (!node) {
			return;
		}

		this._remove(node);
    }, 
    
    find: function(value) {
		var node = this._find_node(value);
		return node;
    }, 

	lower_bound: function(value) {
		var node = this.root;
		var ret  = null;

		while (node) {
			if (!this.cmp_lt(node.value, value)) {
				// this.root.value >= value
				ret  = node;
				node = node.left;
			}
			else {
				node = node.right;
			}
		}
		return ret;
	}, 

	upper_bound: function(value) {
		var node = this.root;
		var ret  = null;

		while (node) {
			if (this.cmp_lt(value, node.value)) {
				// value < this.root.value
				ret  = node;
				node = node.left;
			}
			else {
				node = node.right;
			}
		}
		return ret;
	}, 

    find_by_rank: function(rank) {
		return this._find_by_rank(this.root, rank);
    }, 

    clear: function() {
		this.root = null;
    },

	items: function() {
		var _i = [ ];
		this.forEach(function(value) {
			_i.push(value);
		});
		return _i;
	}, 

    toGraphviz: function() {
		// Returns a grpahviz consumable tree for plotting
		var graph = [ 'fontname=arial', 'node [fontname=arial,fontsize=10]', 'digraph {' ];
		var nodes = [ ];
		var edges = [ ];

		this.forEach((function(value, node) {
			if (node.parent && !node.parent.id) {
				node.parent.id = this._gw_ctr++;
			}
			if (!node.id) {
				node.id = this._gw_ctr++;
			}
			if (node.parent) {
				edges.push('"' + node.parent.value + '-' + node.parent.id + '"->"' + node.value + '-' + node.id + '"');
			}
			nodes.push('"' + node.value + '-' + node.id + '"');
		}).bind(this));

		if (edges.length > 0) {
			edges.push('');
		}

		graph.push(nodes.join(', '), '}');
		graph.push(edges.join('; '), '');
		return graph.join('\n');
    }, 

    forEach: function(proc) {
		this._forEach(this.root, proc);
    }, 

    _forEach: function(node, proc) {
		if (node) {
			this._forEach(node.left, proc);
			proc(node.value, node);
			this._forEach(node.right, proc);
		}
    }, 

    _find_by_rank: function(node, rank) {
		if (rank > node.weight) {
			return null;
		}

		var lw = this._has_left_child(node) ? node.left.weight : 0;
		var rw = this._has_right_child(node) ? node.right.weight : 0;

		if (rank <= lw) {
			return this._find_by_rank(node.left, rank);
		}
		else if (rank > lw + 1) {
			return this._find_by_rank(node.right, rank - lw - 1);
		}
		else {
			// Must be the root
			return node.value;
		}
    }, 

    _remove: function(node) {
		// console.log("_remove::node:", node);

		var is_leaf = this._is_leaf(node);
		var has_one_child = this._has_one_child(node);

		// console.log("is_leaf, has_one_child:", is_leaf, has_one_child);

		if (is_leaf || has_one_child) {
			if (is_leaf) {
				// console.log("Node:", node, "is a leaf");
				if (this._is_root(node)) {
					this.root = null;
				}
				else {
					if (this._is_left_child(node)) {
						// console.log("Setting left child of:", node.parent, "to null");
						node.parent.left = null;
					}
					else {
						node.parent.right = null;
					}
					this._rebalance_to_root(node.parent);
				}
			}
			else {
				// Only 1 child
				var tgt_node = null;
				if (this._has_left_child(node)) {
					tgt_node = node.left;
				}
				else {
					tgt_node = node.right;
				}

				if (this._is_root(node)) {
					this.root = tgt_node;
					// No need to re-balance since this case can occur only 
					// if the tree has just 2 nodes
				}
				else {
					if (this._is_left_child(node)) {
						node.parent.left = tgt_node;
					}
					else {
						node.parent.right = tgt_node;
					}
				}
				if (tgt_node) {
					tgt_node.parent = node.parent;
				}
				this._rebalance_to_root(node.parent);
			}
		}
		else {
			// Has 2 children. Find the successor of this node, 
			// delete that node and replace the value of this 
			// node with that node's value
			var replacement = this.successor(node);
			// console.log("replacement:", replacement);
			this._remove(replacement);
			node.value = replacement.value;
		}
    }, 

	successor: function(node) {
		if (node.right) {
			node = node.right;
			while (node && node.left) {
				node = node.left;
			}
			return node;
		}
		else {
			while (node.parent && this._is_right_child(node)) {
				node = node.parent;
			}
			// node is node.parent's left child or null (if node is the root)
			node = node.parent;
			return node;
		}
	}, 

	predecessor: function(node) {
		if (node.left) {
			node = node.left;
			while (node && node.right) {
				node = node.right;
			}
			return node;
		}
		else {
			while (node.parent && this._is_left_child(node)) {
				node = node.parent;
			}
			// node is node.parent's right child or null (if node is the root)
			node = node.parent;
			return node;
		}
	}, 

    _is_leaf: function(node) {
		return !node.left && !node.right;
    }, 

    _has_one_child: function(node) {
		return this._has_left_child(node) + this._has_right_child(node) == 1;
    }, 

    _has_left_child: function(node) {
		return !!node.left;
    }, 

    _has_right_child: function(node) {
		return !!node.right;
    }, 

    _update_metadata: function(node) {
		if (!node) {
			return;
		}

		var height = Math.max(
			(node.left  ? node.left.height  : 0), 
			(node.right ? node.right.height : 0)
		) + 1;

		var weight = (node.left ? node.left.weight : 0) + 
			(node.right ? node.right.weight : 0) + 1;

		// console.log("\nvalue, height, weight:", node.value, height, weight);
		node.height = height;
		node.weight = weight;

		// Provide a set of "hook" methods to the user so that the user may
		// add custom fields to the AVLTreeNode. Useful for doing stuff like:
		// sum, min, max in O(1)
		this.hooks.forEach(function(hook) {
			hook(node);
		});

    }, 

    _update_metadata_upto_root: function(node) {
		while (node) {
			this._update_metadata(node);
			node = node.parent;
		}
    }, 

    _is_root: function(node) {
		return !node.parent;
    }, 

    _is_left_child: function(node) {
		if (!node) {
			return false;
		}
		return node.parent.left === node;
    }, 

    _is_right_child: function(node) {
		if (!node) {
			return false;
		}
		return node.parent.right === node;
    }, 

    _find_node: function(value) {
		var node = this.lower_bound(value);
		if (node && this.cmp_eq(node.value, value)) {
			return node;
		}
		else {
			return null;
		}
	}, 

    _rotate_left: function(node) {
		if (!node) {
			return;
		}
		assert(node.right !== null);
		var tmp = node.right;

		if (this._is_root(node)) {
			this.root = node.right;
			this.root.parent = null;
		}
		else if (this._is_left_child(node)) {
			node.parent.left = node.right;
			node.right.parent = node.parent;
		}
		else {
			// Must be a right child
			node.parent.right = node.right;
			node.right.parent = node.parent;
		}

		node.right = tmp.left;
		if (tmp.left) {
			tmp.left.parent = node;
		}
		tmp.left = node;
		node.parent = tmp;

		this._update_metadata(node);
		this._update_metadata(tmp);
    }, 

    _rotate_right: function(node) {
		if (!node) {
			return;
		}
		assert(node.left !== null);
		var tmp = node.left;

		if (this._is_root(node)) {
			this.root = tmp;
			this.root.parent = null;
		}
		else if (this._is_left_child(node)) {
			node.parent.left = tmp;
			tmp.parent       = node.parent;
		}
		else {
			// Must be a right child
			node.parent.right = tmp;
			tmp.parent        = node.parent;
		}

		node.left = tmp.right;
		if (tmp.right) {
			tmp.right.parent = node;
		}
		tmp.right = node;
		node.parent = tmp;

		this._update_metadata(node);
		this._update_metadata(tmp);
    }, 

    _balance_factor: function(node) {
		if (!node) {
			return 0;
		}

		var lh = node.left  ? node.left.height  : 0;
		var rh = node.right ? node.right.height : 0;

		// console.log("_balance_factor::of:", node.value, "is:", lh-rh);
		return lh - rh;
    }, 

    _rebalance_to_root: function(node) {
		while (node) {
			this._rebalance(node);
			node = node.parent;
		}
    }, 

    _rebalance: function(node) {
		this._update_metadata(node);
		var bf = this._balance_factor(node);
		var _bf;

		if (bf > 1) {
			// Do a right rotation since the left subtree is > the right subtree
			_bf = this._balance_factor(node.left);
			if (_bf < 0) {
				this._rotate_left(node.left);
			}
			this._update_metadata(node.left);
			this._rotate_right(node);
		}
		else if (bf < -1) {
			// Do a left rotation since the right subtree is > the left subtree
			_bf = this._balance_factor(node.right);
			if (_bf > 0) {
				this._rotate_right(node.right);
			}
			this._update_metadata(node.right);
			this._rotate_left(node);
		}

		// update metadata for 'node'
		this._update_metadata(node);
    }
};

AVLTree.prototype.__defineGetter__('height', function() {
	return this.root ? this.root.height : 0;
});

AVLTree.prototype.__defineGetter__('length', function() {
	return this.root ? this.root.weight : 0;
});

AVLTree.prototype.__defineGetter__('min', function() {
	return this.length ? this.find_by_rank(1) : null;
});

AVLTree.prototype.__defineGetter__('max', function() {
	return this.length ? this.find_by_rank(this.length) : null;
});

exports.AVLTree = AVLTree;





function _swap(range, i, j) {
	var t = range[i];
	range[i] = range[j];
	range[j] = t;
}

//
// A range [begin, end)
// 
// A range is a sub-range of another range.
// It just calls the slice function on the underlying range.
// Can be used on an array or an arguments object.
//
function range(range, begin, end) {
	return Array.prototype.slice.call(range, begin, end);
}


// Time Complexity:  O(log n)
// Space Complexity: O(1)
function lower_bound(range, value, cmp_lt) {
	/* Returns the first index before which it is safe to insert 'value'
	 * such that 'range' remains sorted
	 */
	if (range.length === 0) {
		return 0;
	}

	cmp_lt = cmp_lt || exports.cmp_lt;
	var cmp_gt_eq = cmp_gt_eq_gen(cmp_lt);

	var b = 0;
	var e = range.length;
	var m = Math.floor(b + (e-b) / 2);
	var lb = e;

	while (b < e) {
		if (cmp_gt_eq(range[m], value)) {
			lb = m;
			e = m;
		}
		else {
			b = m + 1;
		}
		m = Math.floor(b + (e-b) / 2);
	}
	return lb;
}

// Time Complexity:  O(log n)
// Space Complexity: O(1)
function upper_bound(range, value, cmp_lt) {
	/* Returns the last index before which it is safe to insert 'value'
	 * such that 'range' remains sorted
	 */
	if (range.length === 0) {
		return 0;
	}

	cmp_lt = cmp_lt || exports.cmp_lt;

	var b = 0;
	var e = range.length;
	var m = Math.floor(b + (e-b) / 2);
	var ub = e;

	while (b < e) {
		// if (value < range[m]), go left
		if (cmp_lt(value, range[m])) {
			ub = m;
			// console.log("Setting ub to:", ub);
			e = m;
		}
		else {
			b = m + 1;
		}
		m = Math.floor(b + (e-b) / 2);
	}
	// console.log("ub:", ub);
	return ub;
}


// Time Complexity:  O(log n)
// Space Complexity: O(1)
function equal_range(range, value, cmp_lt) {
	var lb = lower_bound(range, value, cmp_lt);
	var ub = upper_bound(range, value, cmp_lt);
	return [ lb, ub ];
}


// Time Complexity:  O(log n)
// Space Complexity: O(1)
function binary_search(range, value, cmp_lt) {
	var lb = lower_bound(range, value, cmp_lt);
	if (lb == range.length) {
		return -1;
	}
	return cmp_eq_gen(cmp_lt)(range[lb], value) ? lb : -1;
}

// Time Complexity:  O(n)
// Space Complexity: O(1)
// Note: This function is unstable
function partition(range, pivot_index, cmp_lt) {
	cmp_lt = cmp_lt || exports.cmp_lt;

	assert(pivot_index < range.length);
	// Swap the pivot with the 1st element of the range
	_swap(range, 0, pivot_index);
	var pivot = range[0];

	var l = 1;
	var u = range.length - 1;

	while (true) {
		// console.log("while(true), l, u:", l, u);

		// range[l] <= pivot
		while (l < u && !cmp_lt(pivot, range[l])) {
			l += 1;
		}

		// console.log("range[u], pivot:", range[u], pivot);
		// range[u] > pivot
		while (l < u && cmp_lt(pivot, range[u])) {
			u -= 1;
		}

		if (l === u) {
			// console.log("partition::exiting:", l, "and", u);
			// range[u] > pivot
			if (cmp_lt(pivot, range[u])) {
				--u;
			}
			break;
		}

		// console.log("partition::swapping indexes:", l, "and", u);
		_swap(range, u, l);
		// l += 1;
		u -= 1;
	}

	// console.log("RET:", range.join(", "), "u:", u);
	_swap(range, 0, u);
	return u;
}

// Time Complexity:  O(n)
// Space Complexity: O(n)
function stable_partition(range, pivot_index, cmp_lt) {
	var p1 = [ ];
	var p2 = [ ];

	assert(pivot_index < range.length);

	// Swap the pivot with the 1st element of the range
	_swap(range, 0, pivot_index);
	var pivot = range[0];

	for (var i = 0; i < range.length; ++i) {
		// range[i] > pivot  -> p2
		// range[i] <= pivot -> p1
		(cmp_lt(pivot, range[i]) ? p2 : p1).push(range[i]);
	}

	// Invariant: p1.length > 0
	// console.log("p1.length:", p1.length);
	assert(p1.length > 0);

	_swap(p1, 0, p1.length - 1);
	range.splice(0, range.length);
	range.push.apply(range, p1.concat(p2));
	return p1.length - 1;
}

// Time Complexity:  O(n)
// Space Complexity: O(n)
function merge(range1, range2, cmp_lt) {
	cmp_lt = cmp_lt || exports.cmp_lt;
	var ret = [ ];
	var i1 = 0;
	var i2 = 0;

	while (i1 < range1.length && i2 < range2.length) {
		if (cmp_lt(range1[i1], range2[i2])) {
			ret.push(range1[i1]);
			i1 += 1;
		}
		else {
			ret.push(range2[i2]);
			i2 += 1;
		}
	}

	while (i1 < range1.length) {
		ret.push(range1[i1]);
		i1 += 1;
	}

	while (i2 < range2.length) {
		ret.push(range2[i2]);
		i2 += 1;
	}

	return ret;
}


function is_sorted(range, cmp) {
	cmp = cmp || cmp_lt;
	for (var i = 1; i < range.length; ++i) {
		if (cmp(range[i], range[i-1])) {
			return false;
		}
	}
	return true;
}

function is_heap(range, cmp) {
	cmp = cmp || cmp_lt;
	for (var i = 0; i < range.length; ++i) {
		var ci1 = i * 2 + 1;
		var ci2 = i * 2 + 2;

		if ((ci1 < range.length && cmp(range[ci1], range[i])) || 
			(ci2 < range.length && cmp(range[ci2], range[i]))) {
			return false;
		}
	}
	return true;
}

function _randomized_select(range, k, cmp) {
	// console.log("_randomized_select:", k);

	assert(range.length != 0);
	if (range.length == 1) {
		return range[0];
	}
	var ri = Math.floor(Math.random()*range.length);
	var pat = range[ri];
	// console.log("range1: [", range.join(", "), "]");
	var pi = partition(range, ri, cmp);
	// console.log("range2: [", range.join(", "), "]");
	// console.log("ri, pi, pat:", ri, pi, pat);
	// console.log("range[pi]:", range[pi], "pat:", pat);

	if (k == pi) {
		return range[pi];
	}
	else if (k < pi) {
		return _randomized_select(range.slice(0, pi+1), k, cmp);
	}
	else {
		return _randomized_select(range.slice(pi+1), k-pi-1, cmp);
	}
}

// Time Complexity:  O(n) [expected]
// Space Complexity: O(n) [expected]
function randomized_select(range, k, cmp) {
	cmp = cmp || cmp_lt;
	if (range.length === 0) {
		return null;
	}
	assert(k > 0 && k <= range.length);
	return _randomized_select(range, k-1, cmp);
}




exports.range            = range;
exports.lower_bound      = lower_bound;
exports.upper_bound      = upper_bound;
exports.equal_range      = equal_range;
exports.binary_search    = binary_search;
exports.partition        = partition;
exports.stable_partition = stable_partition;
exports.merge            = merge;
exports.is_sorted        = is_sorted;
exports.is_heap          = is_heap;
exports.randomized_select = randomized_select;

// TODO: String processing algorithms
