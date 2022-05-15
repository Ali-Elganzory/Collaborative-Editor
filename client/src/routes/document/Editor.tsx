import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AceEditor from "react-ace";
import ReactAce from "react-ace/lib/ace";
import "ace-builds/webpack-resolver";

import EditorDocument, { DocumentInfo } from "../../models/EditorDocument";
import Loader from "../../components/Loader";


const Editor: React.FC<{ documentInfo: DocumentInfo }> = (props) => {

    const documentInfo: DocumentInfo = props.documentInfo;
    const apiUrl = 'http://localhost:8000/editor';
    const editsEventName = 'edits';
    const updateInterval = 1000;

    // State.
    const [editorDocument, setEditorDocument] = useState(new EditorDocument(documentInfo.id, documentInfo.title, ''));
    const [loadedDoc, setLoadedDoc] = useState(false);
    const [socket, setSocket] = useState(io(apiUrl));
    const editorElementRef = useRef<ReactAce>(null);

    const onDocumentContentReceived = (content: string) => {
        setEditorDocument(oldEditorDocument => new EditorDocument(oldEditorDocument.id, oldEditorDocument.title, content));
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
                onDocumentContentReceived,
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
                const editorContent = editorElementRef.current?.editor.getValue();
                if (editorContent != null) {
                    const edits = editorDocument.diff(editorContent);
                    // console.log('sent edits: ' + edits)
                    socket.emit(editsEventName, edits);
                }
            }, updateInterval);

            // React to incoming edits.
            socket.on(editsEventName, (edits: string) => {
                // console.log('received edits: ' + edits)
                const editor = editorElementRef.current?.editor;
                const updatedContent: string = editorDocument.patch(edits, editor?.getValue() ?? '');
                const currentCursorPos = editor?.getCursorPosition();
                editor?.setValue(updatedContent);
                editor?.moveCursorToPosition(currentCursorPos ?? { row: 0, column: 0 });
                editor?.clearSelection();
            })

            // Cleaner.
            return () => {
                socket.removeAllListeners();
                clearInterval(timer);
            };
        }
    }, [editorDocument, loadedDoc])


    return (
        <div className="bg-gray-200 p-6 w-full h-full">

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

        </div>
    );

}


export default Editor;