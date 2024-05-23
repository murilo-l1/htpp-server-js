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

function handleData(socket, data) {
    const requestLineItems = parseRequestLine(socket, data);
    const currentPath = requestLineItems['path'];
    if(currentPath === '/'){
        //console.log(firstLineItems['path']);
        writeSocketMessage(socket, HTTP_OK);
    }
    else if(currentPath.startsWith('/echo')){
        const bodyContent = currentPath.split('/')[2];
        const content_length = bodyContent.length.toString();
        const response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: '+ content_length + '\r\n\r\n' + bodyContent;
        writeSocketMessage(socket, response);
    }
    else if(currentPath.startsWith('/user-agent')){
        const headerContent = parseHeaders(socket,data);
        const userAgent = headerContent['userAgent'];
        const userAgent_length = userAgent.length.toString();
        const response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: '+ userAgent_length + '\r\n\r\n' + userAgent;
        writeSocketMessage(socket,response);
    }
    else{
        writeSocketMessage(socket, HTTP_NOT_FOUND);
    }
}

function parseRequestLine(socket, data){
    const request = data.toString();
    //console.log(request);
    const lines = request.split('\r\n');
    const method = lines[0].split(" ")[0];
    const path = lines[0].split(" ")[1];
    const version = lines[0].split(" ")[2];
    return {'method': method, 'path': path, 'version': version};
}

function parseHeaders(socket, data){
    const request = data.toString();
    const lines = request.split('\r\n');
    const host = lines[1].split(" ")[1];
    const userAgent = (lines[2].split(" ")[1]).trim();
    const status = lines[3];
    return {'host': host, 'userAgent': userAgent, 'status': status};
}


function writeSocketMessage (socket, message){
    socket.write(message);
    socket.end();
}