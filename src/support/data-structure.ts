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