import sio from "socket.io";
import { Diff } from "diff-match-patch";

import Document from "./Document";


/**
 * Mock
 */
export default class MockDocument implements Document {

    readonly id: bigint;
    private _isOpen: boolean = false;
    private _content: string = '';
    private _shadows: string[] = [];

    get isOpen(): boolean { return this._isOpen; };
    get noClients(): boolean { return this._shadows.length == 0; }
    get content(): string { return `${this._content}`; };
    get shadows(): ReadonlyArray<string> { return this._shadows; };


    constructor(id: bigint) {
        this.id = id;
    }


    open(): Document {
        console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);
        this._isOpen = true;
        return this;
    }

    close(): boolean {
        throw new Error("Method not implemented.");
    }

    addClient(uid: string): string | false {
        console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is added.`);
        this._isOpen = true;
        return 'Cat';
    }

    removeClient(uid: string): boolean {
        console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is removed.`);
        return true;
    }

    diff(uid: string): ReadonlyArray<Diff> {
        console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} requested diffs.`);
        return [
            [2, "edit 1"],
            [17, "edit 2"]
        ];
    }

    patch(uid: string, edits: Diff[]): boolean {
        console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} patched diffs: ${edits}.`);
        return true;
    }

}