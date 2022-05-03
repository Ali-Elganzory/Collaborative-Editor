import { Diff } from "diff-match-patch";


export type SendEditsToClientCallback = (edits: Diff[]) => void
export type ClientSentEditsCallback = (edits: Diff[]) => void
/**
 * a tuple of the initial document content and a callback for future user edits, respectively.
 */
export type ClientEnteredSessionResponse = [string, ClientSentEditsCallback];


export default interface Synchronizer {

    readonly documents: ReadonlyArray<Document>;

    /**
     * call it whenever a user starts a session 
     * to get initial document content as well 
     * as a callback for user edits.
     * 
     * @param uid user id
     * @param documentId session's document id
     */
    clientEnteredSession(uid: string, documentId: bigint, sendEditsToClient: SendEditsToClientCallback): false | ClientEnteredSessionResponse;

    /**
     * call it whenever a users closes a session
     * to clean his reserved resources.
     * 
     * @param uid user id
     */
    clientLeftSession(uid: string): boolean;

    _clientSentEdits(uid: string, edits: Diff[],): ReadonlyArray<Diff>;

}