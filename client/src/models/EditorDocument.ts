import { Diff, diff_match_patch, patch_obj } from "diff-match-patch";

export type DocumentInfo = { id: string, title: string };
export type CursorPosition = { row: number, column: number };
export type ClientEdits = { cursor: CursorPosition, patch: string }
export type ServerEdits = { clients: Clients, patch: string }
export type Client = { id: string, cursor: CursorPosition };
export type Clients = Client[];
export type InitialDocumentState = { initialContent: string, clients: Clients };
export type PatchWithCursorResult = { cursor: number, patchedContent: string };

class EditorDocument {

    protected _shadow: string;
    protected dmp: diff_match_patch;

    constructor(
        readonly id: string,
        readonly title: string,
        protected _content: string,
        protected _cursorPreservationContextSize: number = 8,
    ) {
        this._shadow = _content;
        this.dmp = new diff_match_patch();
    }

    get content(): string { return this._content };
    get shadow(): string { return this._shadow };


    /**
     * Diffs the new content with the shadow 
     * and returns a text format for the diffs.
     * 
     * Then, the current content and shadow are updated.
     * 
     * @param newContent the new realtime conent.
     * @returns diffs as text. 
     */
    public diff(newContent: string): string {
        this._content = newContent;
        const diffs: Diff[] = this.dmp.diff_main(this._shadow, this._content);
        this.dmp.diff_cleanupEfficiency(diffs);
        const patches: patch_obj[] = this.dmp.patch_make(this.shadow, diffs);
        const patchesText: string = this.dmp.patch_toText(patches);
        this._shadow = this._content;
        return patchesText;
    }

    /**
     * Patches [diffs] to [newContent] and returns the patched
     * text after updating the current content and shadow.
     * 
     * @param diffs diffs (in text format) to patch to the text.
     * @param newContent the new content to be patched.
     * @returns the patched text.
     */
    public patch(diffs: string, newContent: string): string {
        const patches: patch_obj[] = this.dmp.patch_fromText(diffs);
        const [patchedContent, resultsContent] = this.dmp.patch_apply(patches, newContent);
        const [patchedShadow, resultsShadow] = this.dmp.patch_apply(patches, this._shadow);
        this._content = patchedContent;
        this._shadow = patchedShadow;
        return patchedContent;
    }

    /**
     * Patches [diffs] to [newContent] and returns the patched
     * text along with the preserved cursor location after 
     * updating the current content and shadow.
     * 
     * @param diffs diffs (in text format) to patch to the text.
     * @param newContent the new content to be patched.
     * @param cursor the cursor offset inside text.
     * @returns the patched text. 
     */
    public patchWithCursor(diffs: string, newContent: string, cursor: number): PatchWithCursorResult {
        // Patch edits.
        const patches: patch_obj[] = this.dmp.patch_fromText(diffs);
        const [patchedContent, resultsContent] = this.dmp.patch_apply(patches, newContent);
        const [patchedShadow, resultsShadow] = this.dmp.patch_apply(patches, this._shadow);

        // Cursor preservation.
        // Algorithm: Context Matching with Absolute Referenced Offsets.
        // 1. Capture the context and absolute offset of cursor (the first step of context matching).
        const contextSize = this._cursorPreservationContextSize;
        const halfContextSize = Math.ceil(contextSize / 2);
        let contextStart = cursor - halfContextSize;
        let contextEnd = cursor + halfContextSize;
        if (contextStart < 0) {
            contextEnd = Math.min(contextEnd + (-contextStart), newContent.length);
            contextStart = 0;
        } else if (contextEnd > newContent.length) {
            contextStart = Math.max(contextStart - (newContent.length - contextStart), 0);
            contextEnd = newContent.length;
        }
        const context = newContent.substring(contextStart, contextEnd);
        const absoluteOffset = cursor;
        // 2. Apply the insertions and deletions while updating the absolute offset of cursor (the absolute referencing algorithm).
        let deltaOffset = 0;
        let elapsedOffset = 0;
        const deltaDiffs = this.dmp.diff_main(newContent, patchedContent);
        for (const diff of deltaDiffs) {
            const offset = Math.min(elapsedOffset + diff[1].length, cursor);
            elapsedOffset += offset;
            deltaOffset += diff[0] * offset;

            if (elapsedOffset >= cursor) {
                break;
            }
        }
        const updatedAbsoluteOffset = absoluteOffset + deltaOffset;
        // 3. Restore the points on the new text based on the context and delta adjusted offset (second step of context matching).
        const matchedContextLocation = this.dmp.match_main(patchedContent, context, updatedAbsoluteOffset);
        const preservedCursorLocation = matchedContextLocation + (absoluteOffset - contextStart);

        this._content = patchedContent;
        this._shadow = patchedShadow;
        return { cursor: preservedCursorLocation, patchedContent };
    }

}

export default EditorDocument;