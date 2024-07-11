class Node<T> {
    data: T;
    prev: Node<T> | null;
    next: Node<T> | null;

    constructor(data: T) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList<T> {
    head: Node<T> | null;
    tail: Node<T> | null;

    constructor() {
        this.head = null;
        this.tail = null;
    }

    // 添加节点到链表尾部
    append(data: T) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail!.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
    }

    // 打印链表
    print() {
        let current = this.head;
        const result: T[] = [];
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        console.log(result.join(' <--> '));
    }

    // 删除某个节点之后的所有节点
    deleteAfter(node: Node<T>) {
        if (node && node.next) {
            let current: Node<T> | null = node.next;
            while (current) {
                if (current.next) {
                    current.next.prev = null;
                } else {
                    this.tail = node; // 更新尾节点
                }
                current = current.next;
            }
            node.next = null;
        }
    }

    // 删除某个节点之前的所有节点
    deleteBefore(node: Node<T>) {
        if (node && node.prev) {
            let current = node.prev;
            while (current && current.prev) {
                current = current.prev;
            }
            if (current) {
                this.head = node; // 更新头节点
                this.head.prev = null;
            }
        }
    }
}

export {DoublyLinkedList}
