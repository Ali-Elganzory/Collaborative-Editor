"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Comms implementation using Socket.IO library,
 * supporting websockets and long polling.
 */
class SocketIOComms {
    constructor(io) {
        this._synchronizers = [];
        this.editsEventName = 'edits';
        this._io = io;
    }
    registerSynchronizer(synchronizer) {
        this._synchronizers.push(synchronizer);
        // Listen for new client connections.
        this._io.on('connection', (socket) => {
            // Receive document id.
            let documentId;
            socket.once('document_id', (id, callback) => {
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
                const sendEditsToClient = (edits) => {
                    socket.emit(this.editsEventName, edits);
                };
                // Notify the synchronizer of this new
                // user session.
                const response = synchronizer.clientEnteredSession(socket.id, documentId, sendEditsToClient);
                // Synchronizer failed to initialize
                // session.
                if (response === false) {
                    socket.disconnect();
                    // Debug.
                    // console.log(`[${this.constructor.name}] User: ${socket.id} couldn't be added. Document: ${documentId}.`);
                    return;
                }
                const successfulResponse = response;
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
                socket.once('disconnect', () => {
                    synchronizer.clientLeftSession(socket.id, documentId);
                });
            });
        });
    }
    sendEditsToClient(uid, edits) {
        this._io.to(uid).emit(this.editsEventName, edits);
    }
    onClientSentEdits(callback) {
        throw new Error("Method not implemented.");
    }
}
exports.default = SocketIOComms;
