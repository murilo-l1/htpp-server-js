const net = require("net");

const okResponse = "HTTP/1.1 200 OK\r\n\r\n";

const server = net.createServer((socket) => {
    socket.write(okResponse);
    socket.on("close", () => {
     socket.end();
     server.close();
   });
 });

server.listen(4221, "localhost");