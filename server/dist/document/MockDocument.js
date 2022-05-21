"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diff_match_patch_1 = require("diff-match-patch");
/**
 * Mock
 */
class MockDocument {
    constructor(id) {
        this._isOpen = false;
        this._content = '';
        this._shadows = [];
        this._clientIdToCursor = new Map();
        this.id = id;
    }
    get isOpen() { return this._isOpen; }
    ;
    get noClients() { return this._shadows.length == 0; }
    get content() { return `${this._content}`; }
    ;
    get shadows() { return this._shadows; }
    ;
    get clientIdToCursor() { return this._clientIdToCursor; }
    get clients() { return Array.from(this._clientIdToCursor, ([id, cursor]) => ({ id, cursor })); }
    open() {
        // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);
        this._isOpen = true;
        return this;
    }
    close() {
        throw new Error("Method not implemented.");
    }
    addClient(uid) {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is added.`);
        this._isOpen = true;
        return 'Cat';
    }
    removeClient(uid) {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is removed.`);
        return true;
    }
    diff(uid) {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} requested diffs.`);
        const dmp = new diff_match_patch_1.diff_match_patch();
        const patches = dmp.patch_make([
            [0, "edit 1"],
            [1, "edit 2"]
        ]);
        return dmp.patch_toText(patches);
    }
    patch(uid, edits) {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} patched diffs: ${edits}.`);
        return true;
    }
    updateClientCursor(uid, cursor) {
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} updated cursor: ${cursor}.`);
    }
}
exports.default = MockDocument;
