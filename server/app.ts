// Third-party dependencies.
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import bodyParser from 'body-parser';
import cors from "cors";
import sio from "socket.io";
import path from "path";

// App dependencies.
import SocketIOComms from "./comms/SocketIOComms";
import DiffSynchronizer from "./synchronizer/DiffSynchronizer";

// Environment configuration.
dotenv.config();

/**
 * HTTP server initialization.
 */
const app: Express = express();
const server = http.createServer(app);
const port = process.env.PORT;

// Parser.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

// CORS.
const domainsFromEnv = process.env.CORS_DOMAINS || "";
const whitelist = domainsFromEnv.split(",").map(item => item.trim());
const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

/**
 * Socket.io server initialization.
 */
const io: sio.Server = new sio.Server(server, { cors: { origin: whitelist } });

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
app.use(express.static(path.resolve(__dirname, '../../client/build')));

// All other GET requests not handled before will return our React app.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
});


/**
 * Document Synchronization.
 */
const editorPath: string = '/editor';
const comms = new SocketIOComms(io.of(editorPath));
const synchronizer = new DiffSynchronizer();
comms.registerSynchronizer(synchronizer);

// Start.
server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});