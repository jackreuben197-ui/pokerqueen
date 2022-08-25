
export default class TweenSequence {

    sequence: { type: number, spawn?: Function[], time: number }[] = [];

    Append(...item: { type: number, spawn?: Function[], time: number }[]) {
        this.sequence.push(...item);
    }
    Join(...items: Function[]) {
        this.sequence[this.sequence.length - 1].spawn.push(...items);
    }
    Clear() {
        this.sequence = [];
    }
}
