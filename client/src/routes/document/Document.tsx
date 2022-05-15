import { useEffect, useState } from "react";
import { Params, useParams } from "react-router-dom"

import DocumentBody from "./DocumentBody";


const Document: React.FC = () => {
    const params: Params<string> = useParams();

    // State.
    const [id, setId] = useState(BigInt(-1));
    const [parsedId, setParsedId] = useState(false);
    const [errorParsingId, setErrorParsingId] = useState(false);

    // Parse document id from url.
    useEffect(
        () => {
            try {
                setId(BigInt(params.id!));
                setParsedId(true);
            } catch (error: any) {
                setErrorParsingId(true);
            }
        },
        []
    );


    return (
        <div className="w-full h-full">

            {
                errorParsingId && (
                    <div className="w-full text-center py-8">
                        Sorry seems like the document id in the url is invalid.
                    </div>
                )
            }

            {
                // If id is valid, try to view the subject document.
                !errorParsingId && parsedId && (
                    <DocumentBody id={id} />
                )
            }

        </div>

    )
}

export default Document;