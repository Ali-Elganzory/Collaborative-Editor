"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diff_match_patch_1 = require("diff-match-patch");
/**
 * In-memory document: not persistant across
 * restarts.
 */
class MemoryDocument {
    constructor(id) {
        this._isOpen = false;
        this._content = '';
        this._clientIdToShadow = new Map();
        this._clientIdToCursor = new Map();
        this.id = id;
        this.dmp = new diff_match_patch_1.diff_match_patch();
    }
    get isOpen() { return this._isOpen; }
    ;
    get noClients() { return this._clientIdToShadow.size == 0; }
    get content() { return `${this._content}`; }
    ;
    get shadows() { return Array.from(this._clientIdToShadow.values()); }
    ;
    get clientIdToCursor() { return this._clientIdToCursor; }
    get clients() { return Array.from(this._clientIdToCursor, ([id, cursor]) => ({ id, cursor })); }
    open() {
        // Debug.
        // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);
        this._isOpen = true;
        return this;
    }
    close() {
        return true;
    }
    addClient(uid) {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is added.`);
        // Check the client existence.
        // If not added, add.
        if (!this._clientIdToShadow.has(uid)) {
            this._clientIdToShadow.set(uid, this._content);
        }
        return this._clientIdToShadow.get(uid);
    }
    removeClient(uid) {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} is removed.`);
        this._clientIdToCursor.delete(uid);
        return this._clientIdToShadow.delete(uid);
    }
    diff(uid) {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} requested diffs.`);
        const shadow = this._clientIdToShadow.get(uid);
        const diffs = this.dmp.diff_main(shadow, this._content);
        this.dmp.diff_cleanupEfficiency(diffs);
        const patches = this.dmp.patch_make(shadow, diffs);
        const patchesText = this.dmp.patch_toText(patches);
        this._clientIdToShadow.set(uid, this._content);
        return patchesText;
    }
    patch(uid, edits) {
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} patched diffs: ${edits}.`);
        const shadow = this._clientIdToShadow.get(uid);
        const patches = this.dmp.patch_fromText(edits);
        const [patchedContent, resultsContent] = this.dmp.patch_apply(patches, this._content);
        this._content = patchedContent;
        const [patchedShadow, resultsShadow] = this.dmp.patch_apply(patches, shadow);
        this._clientIdToShadow.set(uid, patchedShadow);
        return true;
    }
    updateClientCursor(uid, cursor) {
        this._clientIdToCursor.set(uid, cursor);
        // Debug.
        // console.log(`[${this.constructor.name}] Document: ${this.id}. User ${uid} updated cursor: ${cursor.row}, ${cursor.column}.`);
    }
}
exports.default = MemoryDocument;
