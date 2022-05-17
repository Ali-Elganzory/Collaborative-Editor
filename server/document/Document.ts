import { Diff } from "diff-match-patch";

export type CursorPosition = { row: number, column: number };
export type Client = { id: string, cursor: CursorPosition };
export type Clients = Client[];

export default interface Document {

    readonly id: bigint;
    get isOpen(): boolean;
    get noClients(): boolean;
    get content(): string;
    get shadows(): ReadonlyArray<string>;
    get clientIdToCursor(): Map<string, CursorPosition>;
    get clients(): Clients;

    open(): Document;
    close(): boolean;

    addClient(uid: string): false | string;
    removeClient(uid: string): boolean;

    diff(uid: string): string;
    patch(uid: string, edits: string): boolean;
    updateClientCursor(uid: string, cursor: CursorPosition): void;

}