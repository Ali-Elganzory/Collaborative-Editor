import sio from "socket.io";
import { Diff, diff_match_patch, patch_obj } from "diff-match-patch";

import Document, { Clients, CursorPosition } from "./Document";
import MemoryDocument from "./MemoryDocument";
import DocumentModel from "../models/DocumentModel";


/**
 * Database document: persistant across
 * sessions.
 */
export default class DatabaseDocument extends MemoryDocument {

    async open(): Promise<Document | false> {
        // Debug.
        // console.log(`[${this.constructor.name}] Document ${this.id} is opened.`);

        const document: DocumentModel | null = await DocumentModel.findOne(
            { where: { id: this.id || null }, },
        );

        if (document == null) {
            return false;
        }

        this._content = document.content;

        this._isOpen = true;
        return this;
    }

    async close(): Promise<boolean> {
        const [affectedCount] = await DocumentModel.update(
            { content: this._content },
            { where: { id: this.id }, },
        );

        if (affectedCount <= 1) {
            return false;
        }

        return true;
    }

}