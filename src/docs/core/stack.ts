// stack.ts
class Stack<T> {
    private storage: T[] = [];

    push(item: T) {
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    peek(): T | undefined {
        return this.storage[this.size() - 1];
    }

    size(): number {
        return this.storage.length;
    }

    clear() {
        this.storage = [];
    }
}
export {Stack}