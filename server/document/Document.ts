import { Diff } from "diff-match-patch";


export default interface Document {

    readonly id: bigint;
    get isOpen(): boolean;
    get noClients(): boolean;
    get content(): string;
    get shadows(): ReadonlyArray<string>;

    open(): Document;
    close(): boolean;

    addClient(uid: string): false | string;
    removeClient(uid: string): boolean;

    diff(uid: string): ReadonlyArray<Diff>;
    patch(uid: string, edits: Diff[]): boolean;

}