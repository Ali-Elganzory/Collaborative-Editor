import { Diff } from "diff-match-patch";


export type SendEditsToClientCallback = (edits: Diff[]) => void
export type ClientSentEditsCallback = (edits: Diff[], sendEditsToClient: SendEditsToClientCallback) => void
/**
 * a tuple of the initial document content and a callback for future user edits.
 */
export type ClientEnteredSessionResponse = [string, ClientSentEditsCallback];


interface Synchronizer {

    readonly documents: ReadonlyArray<Document>;

    onClientEnteredSession(uid: string, documentId: bigint): false | ClientEnteredSessionResponse;
    onClientLeftSession(uid: string): boolean;

    _onClientSentEdits(uid: string, edits: Diff[],): ReadonlyArray<Diff>;

}