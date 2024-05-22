const net = require("net");

const okMessage = "HTTP/1.1 200 OK\r\n\r\n";
const notFoundMessage = "HTTP/1.1 404 Not Found\r\n\r\n";


const server = net.createServer((socket) => {
    //writeOkMessage(socket);
    socket.on("close", () => {
     socket.end();
     server.close();
   });
    socket.on("data", (data) => {
       handleData(socket, data);
    });
 });

server.listen(4221, "localhost");

const writeSocketMessage = (socket, message) => {
    socket.write(message);
    socket.end();
}

function handleData(socket, data) {
    const firstLineItems = parseFirstLine(socket, data);
    if(firstLineItems['path'] === '/'){
        console.log(firstLineItems['path']);
        writeSocketMessage(socket, okMessage);
    }
    else{
        writeSocketMessage(socket, notFoundMessage);
    }
}

function parseFirstLine(socket, data){
    const request = data.toString();
    //console.log(request);
    const lines = request.split('\r\n');
    const method = lines[0].split(" ")[0];
    const path = lines[0].split(" ")[1];
    const version = lines[0].split(" ")[2];
    return {'method': method, 'path': path, 'version': version};
}