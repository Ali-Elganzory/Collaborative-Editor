import { Diff } from "diff-match-patch";

interface Document {

    readonly content: string;
    readonly shadows: ReadonlyArray<string>;

    open(): Document;
    close(): boolean;

    addCollaborator(uid: string): false | string;
    removeCollaborator(uid: string): boolean;

    diff(uid: string): false | ReadonlyArray<Diff>;
    patch(uid: string, edits: Diff[]): boolean;

}