const https = require('https');
const http = require('http');

const GITHUB_TOKEN = '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';
const CODESPACE_NAME = 'fantastic-spoon-4jvq9xrw46wqcj77r.github.dev/';
const OWNER = 'anos-rgb';
const PING_INTERVAL = 5 * 60 * 1000;

class AnosKeepAlive {
    constructor() {
        this.server = null;
        this.intervalId = null;
        this.init();
    }

    init() {
        this.startServer();
        this.startKeepAlive();
        this.setupGracefulShutdown();
    }

    startServer() {
        this.server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Anos Codespace Keep-Alive Running\n');
        });

        const port = 3000;
        this.server.listen(port, () => {
            console.log(`Anos server listening on port ${port}`);
        });
    }

    async pingCodespace() {
        try {
            const options = {
                hostname: 'api.github.com',
                path: `/user/codespaces/${CODESPACE_NAME}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Anos-KeepAlive/1.0'
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            const codespace = JSON.parse(data);
                            console.log(`Anos ping: ${codespace.name} - ${codespace.state}`);
                            resolve(codespace);
                        } else {
                            reject(new Error(`API Error: ${res.statusCode} - ${data}`));
                        }
                    });
                });

                req.on('error', reject);
                req.end();
            });
        } catch (error) {
            console.error('Anos ping error:', error.message);
        }
    }

    async startCodespace() {
        try {
            const options = {
                hostname: 'api.github.com',
                path: `/user/codespaces/${CODESPACE_NAME}/start`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Anos-KeepAlive/1.0'
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 202) {
                            console.log('Anos: Codespace starting...');
                            resolve(true);
                        } else {
                            reject(new Error(`Start Error: ${res.statusCode} - ${data}`));
                        }
                    });
                });

                req.on('error', reject);
                req.end();
            });
        } catch (error) {
            console.error('Anos start error:', error.message);
        }
    }

    async performKeepAlive() {
        try {
            const codespace = await this.pingCodespace();
            
            if (codespace && codespace.state === 'Shutdown') {
                console.log('Anos: Codespace is shut down, starting...');
                await this.startCodespace();
            } else if (codespace && codespace.state === 'Available') {
                const machineRequest = {
                    hostname: 'api.github.com',
                    path: `/user/codespaces/${CODESPACE_NAME}/machines`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Anos-KeepAlive/1.0'
                    }
                };

                https.request(machineRequest, (res) => {
                    res.on('data', () => {});
                    res.on('end', () => {
                        console.log('Anos: Activity sent to keep codespace alive');
                    });
                }).end();
            }
        } catch (error) {
            console.error('Anos keep-alive error:', error.message);
        }
    }

    startKeepAlive() {
        this.performKeepAlive();
        
        this.intervalId = setInterval(() => {
            this.performKeepAlive();
        }, PING_INTERVAL);

        console.log(`Anos keep-alive started with ${PING_INTERVAL / 1000}s interval`);
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            console.log('Anos: Shutting down gracefully...');
            
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            
            if (this.server) {
                this.server.close(() => {
                    console.log('Anos: Server closed');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
        process.on('SIGQUIT', shutdown);
    }
}

new AnosKeepAlive();