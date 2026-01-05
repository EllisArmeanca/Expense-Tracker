const { app, port } = require("./app");
const http = require('http');

const httpServer = http.createServer(app);


httpServer.listen(port, (error) => {
    if(error) {
        console.error(error);
    }

    console.log(`Example app listening on port ${port}`)
});