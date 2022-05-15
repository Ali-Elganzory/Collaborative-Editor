import { HttpMethod, useHttp } from "../../hooks/useHttp";
import AppBar from "../../components/AppBar";
import NewDocBtn from "../../components/NewDocBtn";
import DocumentTile from "./DocumentTile";
import Loader from "../../components/Loader";


export default function Home() {
    // UI configuration.
    const sidePadding = ' px-6 ';
    const bodyVerticalPadding = ' py-4 ';

    // State.
    const { cancel, data, error, loaded } = useHttp('/documents', HttpMethod.GET);


    return (
        <div className="flex flex-col h-full">

            <AppBar
                leading={
                    <p className="flex-1">
                        Hi! Join your colleagues or create a new one.
                    </p>
                }
                trailing={<NewDocBtn />}
            />

            <div className={`bg-gray-200 w-full flex-grow ${sidePadding} ${bodyVerticalPadding}`}>
                {
                    !loaded && (
                        <Loader />
                    )
                }

                {
                    loaded && (error || !data) && (
                        <div>
                            <p>There's been an error.</p>
                            <br />
                            <p>{error}</p>
                        </div>
                    )
                }

                {
                    loaded && !error && data && (
                        <div className="w-full h-full grid grid-cols-4 gap-8">
                            {((data as any).data as any[]).map((e) => { return (<DocumentTile key={e.id} document={e}></DocumentTile>) })}
                        </div>
                    )
                }
            </div>

        </div>
    );
}