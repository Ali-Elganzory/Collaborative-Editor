import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";

export default function NewDocBtn() {
    return (
        <button>
            <FontAwesomeIcon icon={faFileCirclePlus} color="navy" size="lg"></FontAwesomeIcon>
        </button>
    );
}