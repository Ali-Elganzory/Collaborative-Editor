import { Diff } from "diff-match-patch";
import sio from "socket.io";

import Comms from "./Comms";
import Synchronizer, { ClientEnteredSessionResponse, ClientSentEditsCallback, SendEditsToClientCallback } from "../synchronizer/Synchronizer";


/**
 * Comms implementation using Socket.IO library,
 * supporting websockets and long polling.
 */
export default class SocketIOComms implements Comms {

    private _io: sio.Namespace;
    private _synchronizers: Synchronizer[] = [];

    readonly editsEventName: string = 'edits';

    constructor(io: sio.Namespace) {
        this._io = io;
    }

    registerSynchronizer(synchronizer: Synchronizer): void {
        this._synchronizers.push(synchronizer);

        // Listen for new client connections.
        this._io.on('connection',
            (socket) => {
                // Receive document id.
                let documentId: bigint;
                socket.once('document_id',
                    (id: string, callback: Function) => {
                        // parse document id.
                        documentId = BigInt(id);

                        // Check that the client sent a
                        // callback function for ack-ing
                        // the initial document content.
                        if ((typeof callback) != 'function') {
                            socket.disconnect();

                            // Debug.
                            console.log(`[${this.constructor.name}] User: ${socket.id} didn't send a callback. Document: ${documentId}.`);

                            return;
                        }

                        // Debug.
                        console.log(`[${this.constructor.name}] User: ${socket.id}. Document: ${documentId}.`);

                        // Callback for sending updates to this
                        // user.
                        const sendEditsToClient: SendEditsToClientCallback = (edits: ReadonlyArray<Diff>) => {
                            socket.emit(this.editsEventName, edits);
                        }

                        // Notify the synchronizer of this new
                        // user session.
                        const response: false | ClientEnteredSessionResponse =
                            synchronizer.clientEnteredSession(
                                socket.id,
                                documentId,
                                sendEditsToClient,
                            );

                        // Synchronizer failed to initialize
                        // session.
                        if (response === false) {
                            socket.disconnect();

                            // Debug.
                            console.log(`[${this.constructor.name}] User: ${socket.id} couldn't be added. Document: ${documentId}.`);

                            return;
                        }

                        const clientSentEditsCallback = (response as ClientEnteredSessionResponse)[1];

                        // Register the listener for user's 
                        // incoming edits.
                        socket.on(this.editsEventName, clientSentEditsCallback);

                        // Send back initial document content
                        // (acknowledgment).
                        callback((response as ClientEnteredSessionResponse)[0]);
                    }
                )

            }
        );
    }

    sendEditsToClient(uid: string, edits: ReadonlyArray<Diff>): void {
        this._io.to(uid).emit(this.editsEventName, edits);
    }

    onClientSentEdits(callback: ClientSentEditsCallback): void {
        throw new Error("Method not implemented.");
    }

}