interface QueueNode<T> { element: T; next?: QueueNode<T>; }

export class Lifo<T> {
  private _elements: T[] = [];

  public add(element: T) {
    this._elements.push(element);
  }

  public get(): T | undefined {
    return this._elements.pop();
  }

  public get isEmpty(): boolean {
    return this._elements.length === 0;
  }

  public get size(): number {
    return this._elements.length;
  }
}

export class LinkedList<T> implements Iterable<{element: T, remove: () => void}> {
  // private currentNode?: DoubleLinkedNode<T>;
  private startNode?: DoubleLinkedNode<T>;

  public addNode(element: T) {
    if (!this.startNode) {
      this.startNode = new DoubleLinkedNode<T>(element);
    } else {
      this.startNode.append(element);
    }
  }

  public get length() {
    let l = 0;
    let n = this.startNode || null;
    while (n) {
      l++;
      n = n.next;
    }
    return l;
  }

  public *[Symbol.iterator](): Iterator<{element: T, remove: () => void}> {
    let current = this.startNode;
    const remove = () => {
      if (!current) {
        return;
      }
      if (current.prev) {
          current.prev.removeNext();
        } else {
          if (current.next) {
            current.next.removePrev();
            this.startNode = current.next;
          } else {
            this.startNode = undefined;
          }
        }
    };
    while (true) {
      if (!current) {
        return;
      }
      const c = current;
      yield {element: c.value, remove};
      current = current.next || undefined;
    }
  }

}

export class Queue<T> {
  private firstNode?: QueueNode<T>;
  private lastNode?: QueueNode<T>;
  private _size: number = 0;

  public get isEmpty(): boolean {
    return this.firstNode === undefined;
  }

  public forEach(callback: (e: T) => undefined | boolean): void {
    if (this.isEmpty) {
      return;
    }
    let node = this.firstNode;
    while (node) {
      const res = callback(node.element);
      if (res) {
        return;
      }
      node = node.next;
    }
  }

  public add(element: T) {
    if (this.isEmpty) {
      this.firstNode = {
        element,
      };
      this.lastNode = this.firstNode;
    } else {
      this.lastNode!.next = {
        element,
      };
      this.lastNode = this.lastNode!.next;
    }
    this._size++;
  }

  public prepend(element: T) {
    if (this.isEmpty) {
      this.add(element);
    } else {
      const newFirst = {
        element,
        next: this.firstNode!
      };
      this.firstNode = newFirst;
      this._size++;
    }
  }

  public get(): T | null {
    if (this.isEmpty) {
      return null;
    } else {
      this._size--;
      const toReturn = this.firstNode;
      this.firstNode = this.firstNode!.next;
      return toReturn!.element;
    }
  }

  public get size(): number {
    return this._size;
  }
}

export class Counter {
  private _data: {[key: string]: number} = {};

  public incr(key: string) {
    if (!this._data[key]) {
      this._data[key] = 0;
    }
    this._data[key]++;
  }
  public get keys(): string[] {
    return Object.keys(this._data);
  }
  public get(key: string): number {
    return this._data[key] || 0;
  }
}

export class DefaultListDictionaryString<T> {
  private dictionary: { [key: string]: T[] } = {};

  public add(key: string, value: T) {
    this.ensureKey(key);
    this.dictionary[key].push(value);
  }
  public get(key: string): T[] {
    this.ensureKey(key);
    return this.dictionary[key];
  }
  public remove(key: string) {
    delete this.dictionary[key];
  }
  private ensureKey(key: string) {
    if (this.dictionary[key] === undefined) {
      this.dictionary[key] = [];
    }
  }
}

export class DoubleLinkedNode<T> {
  public next: DoubleLinkedNode<T> | null = null;
  public prev: DoubleLinkedNode<T> | null = null;
  constructor(public value: T) {
  }

  public visitToRight(maxLength: number | null = null): T[] {
    let e: DoubleLinkedNode<T> | null = this;
    const res = [];
    while (e !== null && (maxLength === null || maxLength-- > 0)) {
      res.push(e.value);
      e = e.next;
    }
    return res;
  }

  public append(item: T): DoubleLinkedNode<T> {
    const oldNext = this.next;
    const newNext = new DoubleLinkedNode(item);
    newNext.prev = this;
    this.next = newNext;
    if (oldNext !== null) {
      newNext.next = oldNext;
      oldNext.prev = newNext;
    }
    return newNext;
  }

  public prepend(item: T): DoubleLinkedNode<T> {
    const oldPrev = this.prev;
    const newPrev = new DoubleLinkedNode(item);
    newPrev.next = this;
    this.prev = newPrev;
    if (oldPrev !== null) {
      oldPrev.next = newPrev;
      newPrev.prev = oldPrev;
    }
    return newPrev;
  }

  public removePrev(): T | null {
    if (this.prev === null) {
      return null;
    } else {
      const value = this.prev.value;
      this.prev = this.prev.prev;
      if (this.prev !== null) {
        this.prev.next = this;
      }
      return value;
    }
  }

  public removeNext(): T | null {
    if (this.next === null) {
      return null;
    } else {
      const value = this.next.value;
      this.next = this.next.next;
      if (this.next !== null) {
        this.next.prev = this;
      }
      return value;
    }

  }
}

export class Tree<T> {
  private subNodes: Array<Tree<T>> = [];
  constructor(private element: T) { }

  public get children(): Array<Tree<T>> {
    return [...this.subNodes];
  }

  public get head() {
    return this.element;
  }

  public append(e: T, to: T) {
    if (this.element === to) {
      this.subNodes.push(new Tree<T>(e));
    }
  }

  public appendTree(e: Tree<T>) {
    this.subNodes.push(e);
  }
}

export class CircularDoubleLinkedNode<T> {
  // tslint:disable-next-line:variable-name
  private _next: CircularDoubleLinkedNode<T> | null = null;
  // tslint:disable-next-line:variable-name
  private _prev: CircularDoubleLinkedNode<T> | null = null;
  constructor(public value: T) {

  }
  public append(item: T): CircularDoubleLinkedNode<T> {
    const newNext = new CircularDoubleLinkedNode<T>(item);
    if (this._next === null) {
      newNext._next = this;
      newNext._prev = this;
      this._next = newNext;
      this._prev = newNext;
    } else {
      newNext._next = this._next;
      newNext._next!._prev = newNext;
      this._next = newNext;
      newNext._prev = this;
    }
    return newNext;
  }

  public removePrevious(): T {
    if (this._prev === null) {
      throw Error("Cannot remove non existing element");
    } else {
      const toRemove = this._prev;
      this._prev = this._prev!._prev;
      if (this._prev === this) {
        this._prev = null;
        this._next = null;
      } else {
        this._prev!._next = this;
      }
      toRemove!._prev = null;
      toRemove!._next = null;
      return toRemove!.value;
    }
  }

  public removeNext(): T {
    return this.next.next.removePrevious();
  }

  public getAllElements(): T[] {
    const values: T[] = [this.value];
    let current = this.next;
    while (current && current !== this) {
      values.push(current.value);
      current = current.next;
    }
    return values;
  }

  public get prev(): CircularDoubleLinkedNode<T> {
    if (this._prev === null) {
      return this;
    } else {
      return this._prev;
    }
  }

  public get next(): CircularDoubleLinkedNode<T> {
    if (this._next === null) {
      return this;
    } else {
      return this._next;
    }
  }

  public prepend(item: T): CircularDoubleLinkedNode<T> {
    return this.prev.append(item);
  }
}
