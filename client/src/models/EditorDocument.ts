import { Diff, diff_match_patch, patch_obj } from "diff-match-patch";

type DocumentInfo = { id: string, title: string };


class EditorDocument {

    protected _shadow: string;
    protected dmp: diff_match_patch;

    constructor(
        readonly id: string,
        readonly title: string,
        protected _content: string,
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

}


export type { DocumentInfo };
export default EditorDocument;