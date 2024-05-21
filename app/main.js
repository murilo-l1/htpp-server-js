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
       const request = data.toString();
        //console.log(request);
        if(request.startsWith('GET / ')){
           writeSocketMessage(socket, okMessage);
       }else{
           writeSocketMessage(socket, notFoundMessage);
       }
    });
 });

server.listen(4221, "localhost");

const writeSocketMessage = (socket, message) => {
    socket.write(message);
    socket.end();
}

//tests commands:
//curl -i -X GET http://localhost:4221/index.html
// curl -v -X GET http://localhost:4221/raspberry