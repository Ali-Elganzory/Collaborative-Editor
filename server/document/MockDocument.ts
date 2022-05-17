import { diff_match_patch } from "diff-match-patch";

import Document, { Clients, CursorPosition } from "./Document";


/**
 * Mock
 */
export default class MockDocument implements Document {

    readonly id: bigint;
    private _isOpen: boolean = false;
    private _content: string = '';
    private _shadows: string[] = [];
    private _clientIdToCursor: Map<string, CursorPosition> = new Map<string, CursorPosition>();

    get isOpen(): boolean { return this._isOpen; };
    get noClients(): boolean { return this._shadows.length == 0; }
    get content(): string { return `${this._content}`; };
    get shadows(): ReadonlyArray<string> { return this._shadows; };
    get clientIdToCursor(): Map<string, CursorPosition> { return this._clientIdToCursor; }
    get clients(): Clients { return Array.from(this._clientIdToCursor, ([id, cursor]) => ({ id, cursor })); }

    constructor(id: bigint) {
        this.id = id;
    }

    open(): Document {
        // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);
        this._isOpen = true;
        return this;
    }

    close(): boolean {
        throw new Error("Method not implemented.");
    }

    addClient(uid: string): string | false {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is added.`);
        this._isOpen = true;
        return 'Cat';
    }

    removeClient(uid: string): boolean {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is removed.`);
        return true;
    }

    diff(uid: string): string {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} requested diffs.`);
        const dmp = new diff_match_patch();
        const patches = dmp.patch_make([
            [0, "edit 1"],
            [1, "edit 2"]
        ]);

        return dmp.patch_toText(patches);
    }

    patch(uid: string, edits: string): boolean {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} patched diffs: ${edits}.`);
        return true;
    }

    updateClientCursor(uid: string, cursor: CursorPosition): void {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} updated cursor: ${cursor}.`);
    }

}