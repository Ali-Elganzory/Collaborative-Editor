import { Diff } from "diff-match-patch";

import Synchronizer, {
    ServerEdits,
    ClientEdits,
    ClientEnteredSessionResponse,
    ClientSentEditsCallback,
    SendEditsToClientCallback,
} from "../synchronizer/Synchronizer";
import Document, { Clients, CursorPosition } from "../document/Document";
import MemoryDocument from "../document/MemoryDocument";
import DatabaseDocument from "../document/DatabaseDocument";


/**
 * Differential Synchronization implementation 
 * of [Synchronizer].
 */
export default class DiffSynchronizer implements Synchronizer {

    private _documentIdToDocument: Map<bigint, Document> = new Map<bigint, Document>();

    get documents(): ReadonlyArray<Document> { return Array.from(this._documentIdToDocument.values()); }


    async clientEnteredSession(uid: string, documentId: bigint, sendEditsToClient: SendEditsToClientCallback): Promise<false | ClientEnteredSessionResponse> {
        // Debug.
        // console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}.`);

        // Check the document openness state.
        // If not open, open it.
        if (!this._documentIdToDocument.has(documentId)) {
            const document: Document = new DatabaseDocument(documentId);
            const opened = await document.open();

            // Check if the document is opended successfully.
            if (opened === false) {
                return false;
            }

            this._documentIdToDocument.set(documentId, document);
        }

        // Add client to document.
        const document = this._documentIdToDocument.get(documentId)!;
        const response: false | string = document.addClient(uid);

        // Check if the client is added successfully.
        if (response === false) {
            return false;
        }

        const initialContent = response as string;
        const clients = document.clients.filter((e) => e.id != uid);

        // Callback for client's incoming edits.
        const clientSentEditsCallback: ClientSentEditsCallback = (edits: ClientEdits) => {
            // Debug.
            // console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}. Edits: ${edits}`);

            // Apply edits, update cursor, and send updates back. 
            const document: Document = this._documentIdToDocument.get(documentId)!;
            document.patch(uid, edits.patch);
            document.updateClientCursor(uid, edits.cursor);
            const patch: string = document.diff(uid);
            const clients: Clients = document.clients.filter((e) => e.id != uid);
            const serverEdits: ServerEdits = { patch, clients };
            sendEditsToClient(serverEdits);
        }

        return { initialContent, clients, clientSentEditsCallback };
    }

    async clientLeftSession(uid: string, documentId: bigint): Promise<boolean> {
        // Remove client from document.
        const document: Document | undefined = this._documentIdToDocument.get(documentId);
        if (document == null) {
            return false;
        }

        document.removeClient(uid);

        // Close document if no clients are
        // collaborating.
        if (document.noClients) {
            await document.close();
            this._documentIdToDocument.delete(document.id);
        }

        // Stub.
        return true;
    }

}