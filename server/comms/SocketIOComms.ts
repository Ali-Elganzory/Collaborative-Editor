import { Diff } from "diff-match-patch";
import sio from "socket.io";

import Comms from "./Comms";
import Synchronizer, {
    ClientEnteredSessionResponse,
    ClientSentEditsCallback,
    SendEditsToClientCallback,
} from "../synchronizer/Synchronizer";
import { Clients, CursorPosition } from "../document/Document";

type InitialDocumentState = {
    initialContent: string,
    clients: Clients,
};

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
                    async (id: string, callback: ((state: InitialDocumentState) => any)) => {
                        // parse document id.
                        documentId = BigInt(id);

                        // Check that the client sent a
                        // callback function for ack-ing
                        // the initial document content.
                        if ((typeof callback) != 'function') {
                            socket.disconnect();

                            // Debug.
                            // console.log(`[${this.constructor.name}] User: ${socket.id} didn't send a callback. Document: ${documentId}.`);

                            return;
                        }

                        // Debug.
                        // console.log(`[${this.constructor.name}] User: ${socket.id}. Document: ${documentId}.`);

                        // Callback for sending updates to this
                        // user.
                        const sendEditsToClient: SendEditsToClientCallback = (edits) => {
                            socket.emit(this.editsEventName, edits);
                        }

                        // Notify the synchronizer of this new
                        // user session.
                        const response: false | ClientEnteredSessionResponse =
                            await synchronizer.clientEnteredSession(
                                socket.id,
                                documentId,
                                sendEditsToClient,
                            );

                        // Synchronizer failed to initialize
                        // session.
                        if (response === false) {
                            socket.disconnect();

                            // Debug.
                            // console.log(`[${this.constructor.name}] User: ${socket.id} couldn't be added. Document: ${documentId}.`);

                            return;
                        }

                        const successfulResponse = (response as ClientEnteredSessionResponse);

                        const clientSentEditsCallback = successfulResponse.clientSentEditsCallback;

                        // Register the listener for user's 
                        // incoming edits.
                        socket.on(this.editsEventName, clientSentEditsCallback);

                        // Send back initial document content
                        // (acknowledgment).
                        const initialDocumentState = {
                            initialContent: successfulResponse.initialContent,
                            clients: successfulResponse.clients,
                        };
                        callback(initialDocumentState);

                        // Remove client session when disconnected.
                        socket.once('disconnect', async () => {
                            await synchronizer.clientLeftSession(socket.id, documentId);
                        });
                    }
                );
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