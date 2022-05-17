import { FormEvent, useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";

import { HttpMethod, useHttp } from "../hooks/useHttp";
import { useNavigate } from "react-router-dom";


export default function NewDocBtn() {
    // State.
    const [showField, setShowField] = useState(false);
    const docTitleRef = useRef(null);
    const { send, cancel, data, error, loaded } = useHttp(`/documents`, HttpMethod.POST);
    const navigate = useNavigate();

    // Form actions.
    const toggleField = () => setShowField(!showField);
    const submit = (e: FormEvent) => {
        e.preventDefault();

        const title = (docTitleRef?.current as any)?.value ?? null;

        if (title != null) {
            send({ title: title });
        }

        return false;
    };

    // On successful submission.
    useEffect(() => {
        if (loaded && data && !error) {
            navigate(`/documents/${(data as any).data}`);
        }
    }, [data]);

    return (
        <div
            className="relative object-cover">
            <button
                onClick={toggleField}>
                <FontAwesomeIcon icon={faFileCirclePlus} color="navy" size="lg"></FontAwesomeIcon>
            </button>

            {
                showField && (
                    <form
                        action=""
                        onSubmit={submit}>
                        <div className="z-40 w-60 rounded-md bg-blue-500 absolute top-8 right-2/4 flex flex-col p-2">
                            <input
                                type="text"
                                className="h-8 rounded-sm p-1"
                                placeholder="Document name"
                                ref={docTitleRef}
                            />

                            <button
                                className="text-white pt-2"
                                onSubmit={submit}>
                                Create
                            </button>
                        </div>
                    </form>
                )
            }
        </div >
    );
}