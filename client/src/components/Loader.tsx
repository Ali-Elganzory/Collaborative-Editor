const Loader: React.FC = () => {
    return (
        <div className="flex items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full m-12" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

export default Loader;