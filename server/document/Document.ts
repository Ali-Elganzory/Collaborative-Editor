import { Diff } from "diff-match-patch";


interface Document {

    readonly id: bigint;
    readonly content: string;
    readonly shadows: ReadonlyArray<string>;

    open(): Document;
    close(): boolean;

    addClient(uid: string): false | string;
    removeClient(uid: string): boolean;

    diff(uid: string): false | ReadonlyArray<Diff>;
    patch(uid: string, edits: Diff[]): boolean;

}