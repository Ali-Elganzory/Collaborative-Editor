import { useNavigate } from "react-router-dom";

const DocumentTile: React.FC<{ document: { id: string, title: string } }> = (props) => {
    // State.
    const document = props.document;
    const navigate = useNavigate();

    // Navigate to document page.
    const onTileClicked = () => {
        navigate(`/documents/${document.id}`);
    }

    return (
        <div className="bg-blue-800 rounded-3xl text-white flex 
                        items-center justify-center hover:cursor-pointer hover:scale-105"
            onClick={onTileClicked}>
            {document.title}
        </div>
    );
}

export default DocumentTile;