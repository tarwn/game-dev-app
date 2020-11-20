const http = require('http');
const https = require('https');

if (process.argv.length < 5) {
    console.log("Target URL Required.\nRequired Syntax: node index.js targetUrl delay_in_ms timeout_in_ms");
    process.exit(1);
}

const args = process.argv.slice(2)
const targetUrl = args[0];
const delay_in_ms = parseInt(args[1]);
const timeout_in_ms = parseInt(args[2]);

let attemptNumber = 0;
const startTime = new Date();
const endTime = startTime - -timeout_in_ms;

const protocol = targetUrl.split("/")[0];
const seriously = protocol == "http:" ? http : https;
const requestOptions = {
    method: 'GET',
    headers: {
        "Accept": "application/json",
        "Accept-Charset": "utf-8",
        "User-Agent": "pollhealthcheck/1.0.0"
    }
};

function performCheck(attempt) {
    console.log(`[Attempt ${attempt}] Checking ${targetUrl} via ${protocol.slice(0,-1)}...`);
    return new Promise((resolve, reject) => {
        const requestTime = new Date();
        seriously.request(targetUrl, requestOptions, (res) => {
            console.log(`[Attempt ${attempt}] Status=${res.statusCode || "UNKNOWN"}, request took ${new Date() - requestTime}ms`);
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ attempt, state: res.statusCode, result });
                }
                catch (error) {
                    reject(error);
                }
            });
        }).on('error', (err) => reject(err)).end();
    });
}

function evaluateResponse({ attempt, state, result }) {
    if (state == 200 && result.status == "Healthy") {
        console.log(`[Attempt ${attempt}] Success! Healthcheck is "Healthy"`);
        process.exit(0);
    }
    else {
        console.log(`[Attempt ${attempt}] Failed: Healthcheck returned ${state}: status="${result.status}"`);
    }

    // console.log(`Checking, is ${new Date()} past the end time of ${new Date(endTime)}? ${endTime < new Date()}`)
    if (endTime < new Date()) {
        console.log(`[Attempt ${attempt}] Timeout expired, no more attempts left.`);
        process.exit(1);
    }

    // schedule next poll
    setTimeout(poll, delay_in_ms);
}

function poll() {
    const attempt = ++attemptNumber;
    performCheck(attempt)
        .then(r => evaluateResponse(r))
        .catch(err => {
            console.log(`Attempt ${attempt}: Error occurred, cannot continue`);
            console.error(err);
            process.exit(1);
        });
}

poll();
