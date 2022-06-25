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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseDocument_1 = __importDefault(require("../document/DatabaseDocument"));
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
        return __awaiter(this, void 0, void 0, function* () {
            // Debug.
            // console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}.`);
            // Check the document openness state.
            // If not open, open it.
            if (!this._documentIdToDocument.has(documentId)) {
                const document = new DatabaseDocument_1.default(documentId);
                const opened = yield document.open();
                // Check if the document is opended successfully.
                if (opened === false) {
                    return false;
                }
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
        });
    }
    clientLeftSession(uid, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove client from document.
            const document = this._documentIdToDocument.get(documentId);
            if (document == null) {
                return false;
            }
            document.removeClient(uid);
            // Close document if no clients are
            // collaborating.
            if (document.noClients) {
                yield document.close();
                this._documentIdToDocument.delete(document.id);
            }
            // Stub.
            return true;
        });
    }
}
exports.default = DiffSynchronizer;
