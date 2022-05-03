// Third-party dependencies.
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import sio from "socket.io";

// App dependencies.
import SocketIOComms from "./comms/SocketIOComms";
import DiffSynchronizer from "./synchronizer/DiffSynchronizer";

// Environment configuration.
dotenv.config();

// Server apps initialization
const app: Express = express();
const server = http.createServer(app);
const io: sio.Server = new sio.Server(server);
const port = process.env.PORT;

// HTTP.
app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

// Socket-io.
io.on('connection', (socket) => {
    console.log(`a user connected with id = ${socket.id}`);
});

// Document Synchronization
const editorPath: string = '/editor';
const comms = new SocketIOComms(io.of(editorPath));
const synchronizer = new DiffSynchronizer();
comms.registerSynchronizer(synchronizer);

// start
server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});