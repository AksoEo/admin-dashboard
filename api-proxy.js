const http = require('http');
const https = require('https');

const apiHost = 'apitest.akso.org';

const server = http.createServer((req, res) => {
    const headers = req.headers;
    headers.host = apiHost;

    const inner = https.request({
        hostname: apiHost,
        path: req.url,
        method: req.method,
        headers,
    });
    inner.on('response', ires => {
        res.writeHead(ires.statusCode, ires.statusMessage, ires.headers);
        ires.on('data', data => res.write(data));
        ires.on('end', () => res.end());
        ires.on('aborted', () => res.destroy());
    });
    inner.on('error', err => {
        console.error(err.toString());
        res.end(502);
    });
    req.on('data', data => inner.write(data));
    req.on('end', () => inner.end());
    req.on('aborted', () => inner.destroy());
});
server.listen(2577, () => console.log('api listening on :2577'));

// exit when stdout ends
process.stdout.resume();
process.stdout.on('end', () => process.exit());
