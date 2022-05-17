import { Diff } from "diff-match-patch";

import Document, { Clients, CursorPosition } from "../document/Document";

export type ClientEdits = { cursor: CursorPosition, patch: string }
export type ServerEdits = { clients: Clients, patch: string }
export type SendEditsToClientCallback = (edits: ServerEdits) => void
export type ClientSentEditsCallback = (edits: ClientEdits) => void
/**
 * a tuple of the initial document content and a callback for future user edits, respectively.
 */
export type ClientEnteredSessionResponse = {
    initialContent: string,
    clients: Clients,
    clientSentEditsCallback: ClientSentEditsCallback,
};


export default interface Synchronizer {

    get documents(): ReadonlyArray<Document>;

    /**
     * call it whenever a user starts a session 
     * to get initial document content as well 
     * as a callback for user edits.
     * 
     * @param uid 
     * @param documentId 
     * @param sendEditsToClient 
     */
    clientEnteredSession(uid: string, documentId: bigint, sendEditsToClient: SendEditsToClientCallback): false | ClientEnteredSessionResponse;

    /**
     * call it whenever a users closes a session
     * to clean his reserved resources.
     * 
     * @param uid user id
     * @param documentId document id
     */
    clientLeftSession(uid: string, documentId: bigint): boolean;

}