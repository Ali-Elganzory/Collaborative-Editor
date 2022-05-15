import { ReactNode } from "react";

import { sidePadding } from "../constants";


const AppBar: React.FC<{ leading: ReactNode, trailing: ReactNode }> =
    (props) => {
        return (
            <div className={`bg-white w-full h-14 flex flex-row items-center ${sidePadding}`}>
                {props.leading}

                <div className="flex-grow"></div>

                {props.trailing}
            </div>
        );
    }

export default AppBar;