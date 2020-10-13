interface QueueNode<T> { element: T; next?: QueueNode<T>; }

export class Queue<T> {
  private firstNode?: QueueNode<T>;
  private lastNode?: QueueNode<T>;
  private _size: number = 0;

  public get isEmpty(): boolean {
    return this.firstNode === undefined;
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
