import { Diff } from "diff-match-patch";

import Synchronizer, { ClientSentEditsCallback } from "../synchronizer/Synchronizer";


/**
 * Responsible for all server communications.
 */
export default interface Comms {

    /**
     * Registers a synchronizer to resolve user's incoming edits
     * and update the user with other collaborators' edits.
     * 
     * @param synchronizer Any implementation of [Synchronizer] interface.
     */
    registerSynchronizer(synchronizer: Synchronizer): void;

    /**
     * Sends an array of [Diff]s to a user in a specific document
     * session.
     * 
     * @param uid user id
     * @param documentId document id
     * @param edits edits to send to the user
     */
    sendDocumentEditsToUser(uid: string, documentId: string, edits: ReadonlyArray<Diff>): Promise<void>;

    /**
     * Global event callback for any received edits from 
     * client side.
     * 
     * @param callback to call on edits
     */
    onClientSentEdits(callback: ClientSentEditsCallback): void;

}