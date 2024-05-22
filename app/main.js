const net = require("net");

const HTTP_OK = "HTTP/1.1 200 OK\r\n\r\n";
const HTTP_NOT_FOUND = "HTTP/1.1 404 Not Found\r\n\r\n";


const server = net.createServer((socket) => {
    //writeHTTP_OK(socket);
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
    const currentPath = firstLineItems['path'];
    if(currentPath === '/'){
        console.log(firstLineItems['path']);
        writeSocketMessage(socket, HTTP_OK);
    }
    else if(currentPath.startsWith('/echo')){
        const bodyContent = currentPath.split('/')[2];
        const content_length = bodyContent.length.toString();
        const response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: '+ content_length + '\r\n\r\n' + bodyContent;
        writeSocketMessage(socket, response);
    }
    else{
        writeSocketMessage(socket, HTTP_NOT_FOUND);
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