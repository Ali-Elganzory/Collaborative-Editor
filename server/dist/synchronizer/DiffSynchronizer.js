"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MemoryDocument_1 = __importDefault(require("../document/MemoryDocument"));
/**
 * Differential Synchronization implementation
 * of [Synchronizer].
 */
class DiffSynchronizer {
    constructor() {
        this._documentIdToDocument = new Map();
    }
    get documents() { return Array.from(this._documentIdToDocument.values()); }
    clientEnteredSession(uid, documentId, sendEditsToClient) {
        // Debug.
        // console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}.`);
        // Check the document openness state.
        // If not open, open it.
        if (!this._documentIdToDocument.has(documentId)) {
            const document = new MemoryDocument_1.default(documentId);
            document.open();
            this._documentIdToDocument.set(documentId, document);
        }
        // Add client to document.
        const document = this._documentIdToDocument.get(documentId);
        const response = document.addClient(uid);
        // Check if the client is added successfully.
        if (response === false) {
            return false;
        }
        const initialContent = response;
        const clients = document.clients.filter((e) => e.id != uid);
        // Callback for client's incoming edits.
        const clientSentEditsCallback = (edits) => {
            // Debug.
            // console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}. Edits: ${edits}`);
            // Apply edits, update cursor, and send updates back. 
            const document = this._documentIdToDocument.get(documentId);
            document.patch(uid, edits.patch);
            document.updateClientCursor(uid, edits.cursor);
            const patch = document.diff(uid);
            const clients = document.clients.filter((e) => e.id != uid);
            const serverEdits = { patch, clients };
            sendEditsToClient(serverEdits);
        };
        return { initialContent, clients, clientSentEditsCallback };
    }
    clientLeftSession(uid, documentId) {
        // Remove client from document.
        const document = this._documentIdToDocument.get(documentId);
        if (document == null) {
            return false;
        }
        document.removeClient(uid);
        // Close document if no clients are
        // collaborating.
        if (document.noClients) {
            document.close();
            this._documentIdToDocument.delete(document.id);
        }
        // Stub.
        return true;
    }
}
exports.default = DiffSynchronizer;
