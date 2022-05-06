import { Diff } from "diff-match-patch";

import Document from "../document/Document";


export type SendEditsToClientCallback = (edits: ReadonlyArray<Diff>) => void
export type ClientSentEditsCallback = (edits: Diff[]) => void
/**
 * a tuple of the initial document content and a callback for future user edits, respectively.
 */
export type ClientEnteredSessionResponse = [initialContent: string, clientSentEditsCallback: ClientSentEditsCallback];


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