import sio from "socket.io";

import Comms from "./Comms";


export default class SocketIOComms implements Comms {

    constructor(io: sio.Server) {
        throw new Error("Method not implemented.");
    }

}