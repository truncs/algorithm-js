##Data Structures & Algorithms for Javascript

    var algo = require('algorithm');


###Data Structures:
1. Queue/FIFO Operations:
    * push(1, 2, 3, 4): Pushes 4 integers into the queue - O(1)
    * pop(): Removes the earliest value from the queue and returns it - O(1)
    * top(): Returns the earliest pushed value without removing it - O(1)

2. Stack/FILO/LIFO Operations:
    * push(1, 2, 3, 4) - O(1)
    * pop() - O(1)
    * top() - O(1)
    * Indexing (like an array) - O(1)

3. MinHeap Operations:
    * (constructor) takes in an (possibly non-empty) array which will be used for storage
    * push(1, 2, 3, 4): Pushes 4 integers into the heap - O(log n)
    * pop(): Removes the smallest value from the heap and returns it - O(log n)
    * top(): Returns the smallest value in the heap without removing it - O(1)

4. Similarly, we have MaxHeap as well.

5. There is also a general Heap/PriorityQueue that can be constructed using 
an existing array and a comparator:

	var h = new algo.PriorityQueue(algo.cmp_lt, [92, 19, 192, 11, 0, 3])



###Algorithms:
1. range(range/array, start index, one after end index): Retuns a range of 
values from the passed array. The returned range is also an array. O(n)

2. lower_bound(range, value, cmp_lt): (range MUST be sorted) Returns the first 
location before which value can safely be inserted so that the resulting range is also
sorted. Will return one past the last valid index if value is greater than any 
element in the list. O(log n)

3. upper_bound(range, value, cmp_lt): (range MUST be sorted) Returns the last 
location after which value can safely be inserted so that the resulting range is also
sorted. Will return one the last valid index if value is greater than any 
element in the list. O(log n)

4. equal_range(range, value, cmp_lt): (range MUST be sorted) Returns the first and
last locations before and after which 'value' can safely be inserted so that the 
resulting range is also sorted. O(log n)

5. binary_search(range, value, cmp_lt): (range MUST be sorted) Returns the first
index where value is equal to the value at index. Returns -1 if the value is not to
be found in the range. O(log n)

6. partition(range, pivot, cmp_lt): Partitions a range around 'pivot' and returns
the index in the modified range that corresponds to the location before which pivot
can be inserted so that the partition remains.
Time Complexity: O(n)
Space Complexity: O(1)

7. stable_partition: Same as above, but retains the original order of elements.
Time Complexity: O(n)
Space Complexity: O(n)

8. merge(range1, range2, cmp_lt): Merges 2 sorted ranges and returns a new merged
range.
Time Complexity: O(n)
Space Complexity: O(n)

9. is_sorted(range, cmp_lt): Returns true or false depending on whether range 
is sorted according to 'cmp_lt'.

10. is_heap(range, cmp_lt): Returns true or false depending on whether range 
is a heap according to 'cmp_lt'. If 'cmp_gt' is used, then is_heap will check
range for being in Max-Heap order. If 'cmp_lt' is used, it will check for 
range to be in Min-Heap order.


###Comparators:
1. cmp_lt(lhs, rhs): Returns whatever lhs < rhs returns

2. cmp_gt(lhs, rhs): Uses < to do a > comparison

3. cmp_lt_eq(lhs, rhs): Uses < to do a <= comparison

4. cmp_gt_eq(lhs, rhs): Uses < to do a >= comparison

5. cmp_eq(lhs, rhs): Uses < to do an == comparison

6. cmp_gt_gen(cmp_lt): Given a less-than comparator, generates a greater-than
comparator from it

7. cmp_gt_eq_gen(cmp_lt): Given a less-than comparator, generates a greater-than
or equal to comparator from it

8. cmp_lt_eq_gen(cmp_lt): Given a less-than comparator, generates a less-than
or equal to comparator from it

9. cmp_eq_gen(cmp_lt): Given a less-than comparator, generates an equal to 
comparator from it