import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AceEditor from "react-ace";
import ReactAce from "react-ace/lib/ace";
import "ace-builds/webpack-resolver";

import EditorDocument, { DocumentInfo, InitialDocumentState, ServerEdits, Clients, ClientEdits } from "../../models/EditorDocument";
import Loader from "../../components/Loader";
import { textToHexColor } from "../../helpers/string";
import "./Editor.css"
import AppBar from "../../components/AppBar";
import Identicon from "../../components/Identicon";


const Editor: React.FC<{ documentInfo: DocumentInfo }> = (props) => {

    const documentInfo: DocumentInfo = props.documentInfo;
    const commsApiUrl = process.env.REACT_APP_API_ADDRESS + '/editor';
    const editsEventName = 'edits';
    const updateInterval = 2000;

    // State.
    const [editorDocument, setEditorDocument] = useState(new EditorDocument(documentInfo.id, documentInfo.title, ''));
    const [loadedDoc, setLoadedDoc] = useState(false);
    const [remoteClients, setRemoteClients] = useState<Clients>([]);
    const [socket, setSocket] = useState(io(commsApiUrl));
    const editorElementRef = useRef<ReactAce>(null);

    const onInitialDocumentStateReceived = (initialState: InitialDocumentState) => {
        setEditorDocument(oldEditorDocument => new EditorDocument(oldEditorDocument.id, oldEditorDocument.title, initialState.initialContent));
        setRemoteClients(initialState.clients);
        setLoadedDoc(true);
    }

    // Init.
    useEffect(() => {
        // After connecing.
        socket.on('connect', () => {
            // Init initial document content.
            socket.emit(
                'document_id',
                editorDocument.id,
                onInitialDocumentStateReceived,
            );
        });

        // Cleaner.
        return () => {
            socket.removeAllListeners();
            socket.close();
        };
    }, []);

    useEffect(() => {
        if (loadedDoc) {
            // Timer reference.
            let timer: NodeJS.Timeout | undefined;

            // Sync.
            timer = setInterval(() => {
                // If document is loaded.
                const editor = editorElementRef.current!.editor;
                const editorContent = editor.getValue();
                if (editorContent != null) {
                    const edits = editorDocument.diff(editorContent);
                    const currentCursorPos = editor!.getCursorPosition();
                    // Debug.
                    // console.log('sent edits: ' + edits)
                    const clientEdits: ClientEdits = { patch: edits, cursor: currentCursorPos };
                    socket.emit(editsEventName, clientEdits);
                }
            }, updateInterval);

            // React to incoming edits.
            socket.on(editsEventName, (edits: ServerEdits) => {
                // Debug.
                // console.log('received edits: ' + edits)
                const editor = editorElementRef.current?.editor;
                const doc = editor!.session.getDocument();
                const currentContent = editor!.getValue();
                const currentCursorPos = editor!.getCursorPosition();
                const currentCursorLocation = doc.positionToIndex(currentCursorPos);
                const { cursor, patchedContent } = editorDocument.patchWithCursor(edits.patch, currentContent, currentCursorLocation);
                const cursorPos = doc.indexToPosition(cursor, 0);
                editor!.setValue(patchedContent);
                editor!.moveCursorToPosition(cursorPos);
                editor!.clearSelection();
                // Debug.
                // console.log('Remote clients: ' + JSON.stringify(edits));
                setRemoteClients(edits.clients);
            })

            // Cleaner.
            return () => {
                socket.removeAllListeners();
                clearInterval(timer);
            };
        }
    }, [editorDocument, loadedDoc]);

    const avatarCount = Math.min(13, remoteClients.length);
    const hiddenAvatarCount = Math.max(0, remoteClients.length - avatarCount);

    return (
        <div className="w-full h-full flex flex-col">
            <AppBar
                leading={
                    documentInfo.title
                }
                trailing={(
                    <div className="flex flex-row">
                        <div className="-space-x-4 mr-6">
                            {
                                remoteClients.slice(0, avatarCount).map((e, i) => {
                                    const clientColor = textToHexColor(e.id);

                                    return (
                                        <div
                                            key={e.id}
                                            className="tooltip">
                                            <Identicon
                                                string={e.id}
                                                size={32}
                                                fg={clientColor}
                                                bg="gray"
                                                className="inline object-cover w-8 h-8 
                                            border-2 border-white rounded-full"
                                            />

                                            <span
                                                className="tooltiptext tooltip-bottom"
                                                style={{
                                                    backgroundColor: clientColor,
                                                }}>
                                                {e.id}
                                            </span>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        {
                            (hiddenAvatarCount > 0) && (
                                <div className=" w-8 h-8 border-2 border-gray-200 rounded-full text-center">
                                    {`+${hiddenAvatarCount}`}
                                </div>
                            )
                        }
                    </div>
                )
                }
            />

            < div className="bg-gray-200 px-6 pt-6 w-full flex-grow" >

                {
                    !loadedDoc && (
                        <Loader />
                    )
                }

                {
                    loadedDoc && (
                        <AceEditor
                            ref={editorElementRef}

                            value={editorDocument.content}

                            setOptions={{
                                showGutter: false,
                                highlightActiveLine: false,
                                showPrintMargin: false,
                                wrapBehavioursEnabled: true,
                                fontSize: 16,
                            }}

                            height='100%'
                            width='100%'

                            className="bg-gray-200"
                        />
                    )
                }

                {
                    loadedDoc && editorElementRef.current?.editor && (
                        <div>
                            {
                                remoteClients.map(
                                    (e) => {
                                        const editor = editorElementRef.current!.editor;
                                        const isVisible = editor.isRowVisible(e.cursor.row);

                                        if (!isVisible) {
                                            return (
                                                <div className="hidden"></div>
                                            );
                                        }

                                        const screenPosition = editor.renderer.textToScreenCoordinates(e.cursor.row, e.cursor.column);
                                        const bgColor = textToHexColor(e.id);

                                        return (
                                            <div key={e.id}>
                                                { /* Simulated remote client cursor.*/}
                                                <div
                                                    className="absolute w-1 h-5 animate-cursor-blink"
                                                    style={{
                                                        backgroundColor: bgColor,
                                                        left: screenPosition.pageX,
                                                        top: screenPosition.pageY,
                                                    }}>
                                                </div>

                                                {/*  Overlay for tooltip. */}
                                                <div
                                                    className="absolute w-1 h-5"
                                                    style={{
                                                        left: screenPosition.pageX,
                                                        top: screenPosition.pageY,
                                                    }}>
                                                    <div className="relative tooltip w-1 h-5">
                                                        <span
                                                            className="tooltiptext tooltip-bottom"
                                                            style={{
                                                                backgroundColor: bgColor,
                                                            }}>
                                                            {e.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            }
                        </div>
                    )
                }

            </div >
        </div >
    );

}


export default Editor;