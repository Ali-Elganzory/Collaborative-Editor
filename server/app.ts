import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import sio from "socket.io";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io: sio.Server = new sio.Server(server);
const port = process.env.PORT;

// HTTP
app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

// Socket-io
io.on('connection', (socket) => {
    console.log(`a user connected with id = ${socket.id}`);
});

// serve
server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});