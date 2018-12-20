import { threadId } from "worker_threads";

type QueueNode<T> = { element: T, next?: QueueNode<T> };

export class Queue<T> {
	private firstNode: QueueNode<T>;
	private lastNode: QueueNode<T>;

	public get isEmpty(): boolean {
		return this.firstNode === undefined;
	}

	public add(element: T) {
		if (this.isEmpty) {
			this.firstNode = {
				element
			};
			this.lastNode = this.firstNode;
		}
		else {
			this.lastNode.next = {
				element
			};
			this.lastNode = this.lastNode.next;
		}
	}

	public get(): T {
		if (this.isEmpty) {
			return null;
		}
		else {
			let toReturn = this.firstNode;
			this.firstNode = this.firstNode.next;
			return toReturn.element;
		}
	}
}

export class DefaultListDictionaryString<T> {
	private dictionary: { [key: string]: T[] } = {}
	constructor() {
	}
	public add(key: string, value: T) {
		this.ensureKey(key);
		this.dictionary[key].push(value);
	}
	private ensureKey(key: string) {
		if (this.dictionary[key] === undefined) {
			this.dictionary[key] = [];
		}
	}
	public get(key: string): T[] {
		this.ensureKey(key);
		return this.dictionary[key];
	}
	public remove(key: string) {
		this.dictionary[key] = undefined;
	}
}

export class DoubleLinkedNode<T> {
	private _isEmpty: boolean = true;
	private _next?: DoubleLinkedNode<T> = null;
	private _prev?: DoubleLinkedNode<T> = null;
	constructor(public value: T) {

	}
	public get isEmpty() {
		return this._isEmpty;
	}

	public append(item: T): DoubleLinkedNode<T> {
		let newNext = new DoubleLinkedNode<T>(item);
		if (this._next === null) {
			newNext._next = this;
			newNext._prev = this;
			this._next = newNext;
			this._prev = newNext;
		}
		else {
			newNext._next = this._next;
			newNext._next._prev = newNext;
			this._next = newNext;
			newNext._prev = this;
		}
		return newNext;
	}

	public removePrevious(): T {
		if (this._prev === null) {
			throw Error("Cannot remove non existing element");
		}
		else {
			let toRemove = this._prev;
			this._prev = this._prev._prev;
			if (this._prev === this) {
				this._prev = null;
				this._next = null;
			}
			else {
				this._prev._next = this;
			}
			toRemove._prev = null;
			toRemove._next = null;
			return toRemove.value;
		}
	}

	public removeNext(): T {
		return this.next.next.removePrevious();
	}

	public get prev(): DoubleLinkedNode<T> {
		if (this._prev === null) {
			return this;
		}
		else {
			return this._prev;
		}
	}

	public get next(): DoubleLinkedNode<T> {
		if (this._next === null) {
			return this;
		}
		else {
			return this._next;
		}
	}

	public prepend(item: T): DoubleLinkedNode<T> {
		return this.prev.append(item);
		// let newPrev = new DoubleLinkedNode<T>(item);
		// if (this._next === null) {
		// 	newPrev._next = this;
		// 	newPrev._prev = this;
		// 	this._next = newPrev;
		// 	this._prev = newPrev;
		// }
		// else {
		// 	newPrev._prev = this._prev;
		// 	this._prev = newPrev;
		// 	newPrev._next = this;
		// }
		// return newPrev;
	}
}