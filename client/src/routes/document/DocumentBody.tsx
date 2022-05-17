import { useEffect, useState } from "react";
import { Params, useParams } from "react-router-dom"

import { HttpMethod, useHttp } from "../../hooks/useHttp";
import NewDocBtn from "../../components/NewDocBtn";
import Loader from "../../components/Loader";
import AppBar from "../../components/AppBar";
import Editor from "./Editor";


const DocumentBody: React.FC<{ id: bigint }> = (props) => {
    // State.
    const id: bigint = props.id;

    const { cancel, data, error, loaded } = useHttp(`/documents/${id}`, HttpMethod.GET);

    return (
        <div className="w-full h-full">

            {
                !loaded && (
                    <div className="w-full text-center py-8">
                        <Loader />
                    </div>
                )
            }

            {
                loaded && error && (
                    <div className="w-full text-center py-8">
                        Sorry seems like this document doesn't exist.
                        <br />
                        You can create a new one.
                        <br />
                        <div className="py-4">
                            <NewDocBtn />
                        </div>
                    </div>
                )
            }

            {
                // If document exists view page content.
                loaded && !error && (
                    <div className="w-full h-full flex flex-col">

                        {
                            // Document editor.
                            <Editor documentInfo={(data! as any).data} />
                        }

                    </div>
                )
            }

        </div>

    )
}

export default DocumentBody;