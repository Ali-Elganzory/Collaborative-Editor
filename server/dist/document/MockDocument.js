"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);
            this._isOpen = true;
            return this;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
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
