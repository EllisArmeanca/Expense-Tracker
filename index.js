const express = require('express');
const app = express();
const port = 3009;

app.get('/', (req, res) => {
  res.send('Hello hello!')
});

app.listen(port, (error) => {
    if(error) {
        console.error(error);
    }

    console.log(`Example app listening on port ${port}`)
});
