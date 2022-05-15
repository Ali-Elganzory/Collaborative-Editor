import { Diff } from "diff-match-patch";

import Synchronizer, { ClientEnteredSessionResponse, ClientSentEditsCallback, SendEditsToClientCallback } from "../synchronizer/Synchronizer";
import Document from "../document/Document";
import MemoryDocument from "../document/MemoryDocument";


/**
 * Differential Synchronization implementation 
 * of [Synchronizer].
 */
export default class DiffSynchronizer implements Synchronizer {

    private _documentIdToDocument: Map<bigint, Document> = new Map<bigint, Document>();

    get documents(): ReadonlyArray<Document> { return Array.from(this._documentIdToDocument.values()); }


    clientEnteredSession(uid: string, documentId: bigint, sendEditsToClient: SendEditsToClientCallback): false | ClientEnteredSessionResponse {
        // Debug.
        console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}.`);

        // Check the document openness state.
        // If not open, open it.
        if (!this._documentIdToDocument.has(documentId)) {
            const document: Document = new MemoryDocument(documentId);
            document.open();
            this._documentIdToDocument.set(documentId, document);
        }

        // Add client to document.
        const response: false | string = this._documentIdToDocument.get(documentId)!.addClient(uid);

        // Check if the client is added successfully.
        if (response === false) {
            return false;
        }

        const initialDocumentContent = response as string;

        // Callback for client's incoming edits.
        const clientSentEditsCallback: ClientSentEditsCallback = (edits: string) => {
            // Debug.
            console.log(`[${this.constructor.name}] User: ${uid}. Document: ${documentId}. Edits: ${edits}`);

            // Apply edits, and send updates back. 
            const document: Document = this._documentIdToDocument.get(documentId)!;
            document.patch(uid, edits);
            sendEditsToClient(document.diff(uid));
        }

        return [initialDocumentContent, clientSentEditsCallback];
    }

    clientLeftSession(uid: string, documentId: bigint): boolean {
        // Remove client from document.
        const document: Document | undefined = this._documentIdToDocument.get(documentId);
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