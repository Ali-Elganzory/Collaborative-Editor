import sio from "socket.io";
import { Diff, diff_match_patch, patch_obj } from "diff-match-patch";

import Document, { Clients, CursorPosition } from "./Document";


/**
 * In-memory document: not persistant across
 * sessions.
 */
export default class MemoryDocument implements Document {

    readonly id: bigint;
    protected _isOpen: boolean = false;
    protected _content: string = '';
    protected _clientIdToShadow: Map<string, string> = new Map<string, string>();
    protected _clientIdToCursor: Map<string, CursorPosition> = new Map<string, CursorPosition>();
    protected dmp: diff_match_patch;

    get isOpen(): boolean { return this._isOpen; };
    get noClients(): boolean { return this._clientIdToShadow.size == 0; }
    get content(): string { return `${this._content}`; };
    get shadows(): ReadonlyArray<string> { return Array.from(this._clientIdToShadow.values()); };
    get clientIdToCursor(): Map<string, CursorPosition> { return this._clientIdToCursor; }
    get clients(): Clients { return Array.from(this._clientIdToCursor, ([id, cursor]) => ({ id, cursor })); }


    constructor(id: bigint) {
        this.id = id;
        this.dmp = new diff_match_patch();
    }

    async open(): Promise<Document | false> {
        // Debug.
        // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);

        this._isOpen = true;
        return this;
    }

    async close(): Promise<boolean> {
        return true;
    }

    addClient(uid: string): string | false {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is added.`);

        // Check the client existence.
        // If not added, add.
        if (!this._clientIdToShadow.has(uid)) {
            this._clientIdToShadow.set(uid, this._content);
        }

        return this._clientIdToShadow.get(uid)!;
    }

    removeClient(uid: string): boolean {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is removed.`);

        this._clientIdToCursor.delete(uid);
        return this._clientIdToShadow.delete(uid);
    }

    diff(uid: string): string {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} requested diffs.`);

        const shadow = this._clientIdToShadow.get(uid)!;
        const diffs: Diff[] = this.dmp.diff_main(shadow, this._content);
        this.dmp.diff_cleanupEfficiency(diffs);
        const patches: patch_obj[] = this.dmp.patch_make(shadow, diffs);
        const patchesText: string = this.dmp.patch_toText(patches);
        this._clientIdToShadow.set(uid, this._content);

        return patchesText;
    }

    patch(uid: string, edits: string): boolean {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} patched diffs: ${edits}.`);

        const shadow = this._clientIdToShadow.get(uid)!;
        const patches: patch_obj[] = this.dmp.patch_fromText(edits);
        const [patchedContent, resultsContent] = this.dmp.patch_apply(patches, this._content);
        this._content = patchedContent;
        const [patchedShadow, resultsShadow] = this.dmp.patch_apply(patches, shadow);
        this._clientIdToShadow.set(uid, patchedShadow);

        return true;
    }

    updateClientCursor(uid: string, cursor: CursorPosition): void {
        this._clientIdToCursor.set(uid, cursor);

        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} updated cursor: ${cursor.row}, ${cursor.column}.`);
    }

}