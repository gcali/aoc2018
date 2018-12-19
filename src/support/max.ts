export interface MaxArg<U> {
    key: number,
    value: U
}
export default class Max<U> {
    public currentMax?: MaxArg<U> = null;
    public add(e: MaxArg<U>) {
        if (!this.currentMax || this.currentMax.key < e.key) {
            this.currentMax = e;
        }
    }
}