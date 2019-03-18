const path = require('path');
const express = require('express');
const app = express();
app.use('/assets', express.static('assets'));
app.use(express.static('dist'));
app.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});
app.listen(2576, () => console.log('listening on :2576'));
