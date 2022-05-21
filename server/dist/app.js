"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Third-party dependencies.
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = __importDefault(require("socket.io"));
const path_1 = __importDefault(require("path"));
// App dependencies.
const SocketIOComms_1 = __importDefault(require("./comms/SocketIOComms"));
const DiffSynchronizer_1 = __importDefault(require("./synchronizer/DiffSynchronizer"));
// Environment configuration.
dotenv_1.default.config();
/**
 * HTTP server initialization.
 */
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = process.env.PORT;
// Parser.
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
// CORS.
const domainsFromEnv = process.env.CORS_DOMAINS || "";
const whitelist = domainsFromEnv.split(",").map(item => item.trim());
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
/**
 * Socket.io server initialization.
 */
const io = new socket_io_1.default.Server(server, { cors: { origin: whitelist } });
/**
 * Routes.
 */
// Backend API.
// Import routers.
let editorRouter = require('./routes/editor');
// Editor routers.
app.use('/api/editor', editorRouter);
// Frontend.
// Have Node serve the files for our built React app
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../../client/build')));
// All other GET requests not handled before will return our React app.
app.get('*', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, '../../client/build', 'index.html'));
});
/**
 * Document Synchronization.
 */
const editorPath = '/editor';
const comms = new SocketIOComms_1.default(io.of(editorPath));
const synchronizer = new DiffSynchronizer_1.default();
comms.registerSynchronizer(synchronizer);
// Start.
server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
