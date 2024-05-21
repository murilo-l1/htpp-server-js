const net = require("net");
//curl -i -X GET http://localhost:4221/index.html
const okResponse = "HTTP/1.1 200 OK\r\n\r\n";
const notFoundResponse = "HTTP/1.1 404 Not Found\r\n\r\n";

const server = net.createServer((socket) => {
    //writeOkMessage(socket);
    socket.on("close", () => {
     socket.end();
     server.close();
   });
    socket.on("data", (data) => {
       const request = data.toString();
        //console.log(request);
        if(request.startsWith("GET /")){
           writeSocketMessage(socket, okResponse);
       }else{
           writeSocketMessage(socket, notFoundResponse);
       }
    });
 });

server.listen(4221, "localhost");

const writeSocketMessage = (socket, message) => {
    socket.write(message);
    socket.end();
}