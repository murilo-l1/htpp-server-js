const fs = require("fs"); // fileSystem to handle file operations
const net = require("net");

const HTTP_OK = "HTTP/1.1 200 OK\r\n\r\n";
const HTTP_NOT_FOUND = "HTTP/1.1 404 Not Found\r\n\r\n";
const HTTP_CREATED = "HTTP/1.1 201 Created\r\n\r\n";


const server = net.createServer((socket) => {
    //writeHTTP_OK(socket);
    socket.on("close", () => {
     socket.end();
     //server.close();
   });
    socket.on("data", (data) => {
       handleData(socket, data);
    });
 });

server.listen(4221, "localhost");

function handleData(socket, data) {
    const requestLineItems = parseRequestLine(socket, data);
    const currentPath = requestLineItems['path'];
    const currentMethod = requestLineItems['method'];
    if(currentPath === '/'){
        writeSocketMessage(socket, HTTP_OK);
    }
    else if(currentPath.startsWith('/echo')){
        const bodyContent = currentPath.split('/')[2];
        const content_length = bodyContent.length.toString();
        let response = '';
        const encodingMethod = getEncodingMethod(socket, data);
        if(encodingMethod !== 'invalid-encoding' && encodingMethod !== null){
            response = `HTTP/1.1 200 OK\r\nContent-Encoding: ${encodingMethod}\r\nContent-Type: text/plain\r\nContent-Length: ${content_length}\r\n\r\n${bodyContent}`;
        }
        else{
            response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content_length}\r\n\r\n${bodyContent}`;
        }
        writeSocketMessage(socket, response);
    }
    else if(currentPath.startsWith('/user-agent')){
        //console.log(headerContent);
        const userAgent = getUserAgent(socket, data);
        const userAgent_length = userAgent.length.toString();
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent_length}\r\n\r\n${userAgent}`;
        writeSocketMessage(socket,response);
    }
    else if(currentPath.startsWith('/files') && currentMethod === 'GET'){
        const fileName = currentPath.split('/')[2];
        const fileDirectory = process.argv[3];
        const file = `${fileDirectory}/${fileName}`;
        if(fs.existsSync(file)){
            const content = fs.readFileSync(file).toString();
            const length = content.length;
            const response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${length}\r\n\r\n${content}\r\n`;
            writeSocketMessage(socket, response);
        }else {
            writeSocketMessage(socket, HTTP_NOT_FOUND);
        }
    }
    else if(currentPath.startsWith('/files') && currentMethod === 'POST'){
        const fileName = currentPath.split('/')[2];
        const fileDirectory = process.argv[3];
        const file = `${fileDirectory}/${fileName}`;
        const content = getRequestBody(socket, data);
        fs.writeFileSync(file, content);
        writeSocketMessage(socket, HTTP_CREATED);
    }
    else{
        writeSocketMessage(socket, HTTP_NOT_FOUND);
    }
}

//TODO: refatorar as funcoes de headers para metodo que encontra o que eu quero, assim fica mais clean

function parseRequestLine(socket, data){
    const request = data.toString();
    const lines = request.split('\r\n');
    const method = lines[0].split(" ")[0];
    const path = lines[0].split(" ")[1];
    const version = lines[0].split(" ")[2];
    return {'method': method, 'path': path, 'version': version};
}

function parseHeaders(socket, data){
    const request = data.toString();
    const lines = request.split('\r\n');
    console.log(lines);
    const host = lines[1].split(" ")[1];
    const userAgent = (lines[3].split(" ")[1]).trim();
    console.log(userAgent);
    return {'host': host, 'userAgent': userAgent};
}

function getEncodingMethod(socket, data){
    const request = data.toString();
    const lines = request.split('\r\n');
    let index = -1;
    for(let i = 0; i < lines.length; i++){
        if(lines[i].startsWith("Accept-Encoding")){
            index = i;
            break;
        }
    }
    if(index !== -1){
        const encoding = (lines[index].split(" ")[1]).trim();
        return encoding;
    }
    else{
        return null;
    }
}

function getUserAgent(socket, data){

    const request = data.toString();
    const lines = request.split('\r\n');
        let index = -1;
        for(let i = 0; i < lines.length; i++){
            if(lines[i].startsWith("User-Agent")){
                index = i;
                break;
            }
        }
        if(index !== -1){
            const userAgent = (lines[index].split(" ")[1]).trim();
            return userAgent;
        }
        else{
            return null;
        }

}

function getRequestBody(socket, data){
    const request = data.toString();
    const lines = request.split('\r\n');
    const body = lines[lines.length - 1];
    return body;
}

function writeSocketMessage (socket, message){
    socket.write(message);
    socket.end();
}