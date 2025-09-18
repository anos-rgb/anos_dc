const { spawn, exec } = require('child_process');
const fs = require('fs');
const https = require('https');

const GITHUB_TOKEN = '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';
const OWNER = 'anos-rgb';
const REPO_NAME = 'still-alive';
const MAX_CODESPACE_HOURS = 30;

class AnosAutoRunner {
    constructor() {
        this.currentProcess = null;
        this.currentCodespace = null;
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.log('Anos Auto Runner started');
        this.randomDelay(() => {
            this.checkAndRun();
        });
    }

    randomDelay(callback) {
        const delay = Math.floor(Math.random() * 4000) + 1000;
        this.log(`Random delay: ${delay}ms`);
        setTimeout(callback, delay);
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Anos: ${message}`);
    }

    async getCurrentCodespace() {
        try {
            const options = {
                hostname: 'api.github.com',
                path: '/user/codespaces',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Anos-AutoRunner/1.0'
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            const response = JSON.parse(data);
                            const activeCodespace = response.codespaces.find(cs => 
                                cs.state === 'Available' && cs.repository.full_name === `${REPO_OWNER}/${REPO_NAME}`
                            );
                            resolve(activeCodespace);
                        } else {
                            reject(new Error(`API Error: ${res.statusCode}`));
                        }
                    });
                });
                req.on('error', reject);
                req.end();
            });
        } catch (error) {
            this.log(`Error getting codespace: ${error.message}`);
            return null;
        }
    }

    async createNewCodespace() {
        try {
            this.log('Creating new codespace...');
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${REPO_OWNER}/${REPO_NAME}/codespaces`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Anos-AutoRunner/1.0',
                    'Content-Type': 'application/json'
                }
            };

            const postData = JSON.stringify({
                machine: 'basicLinux32gb'
            });

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 201) {
                            const codespace = JSON.parse(data);
                            this.log(`New codespace created: ${codespace.name}`);
                            resolve(codespace);
                        } else {
                            reject(new Error(`Create Error: ${res.statusCode} - ${data}`));
                        }
                    });
                });
                req.on('error', reject);
                req.write(postData);
                req.end();
            });
        } catch (error) {
            this.log(`Error creating codespace: ${error.message}`);
            return null;
        }
    }

    async deleteOldCodespace(codespaceName) {
        try {
            this.log(`Deleting old codespace: ${codespaceName}`);
            const options = {
                hostname: 'api.github.com',
                path: `/user/codespaces/${codespaceName}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Anos-AutoRunner/1.0'
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    if (res.statusCode === 202 || res.statusCode === 204) {
                        this.log('Old codespace deleted successfully');
                        resolve(true);
                    } else {
                        reject(new Error(`Delete Error: ${res.statusCode}`));
                    }
                });
                req.on('error', reject);
                req.end();
            });
        } catch (error) {
            this.log(`Error deleting codespace: ${error.message}`);
        }
    }

    updateAnosConfig(codespaceName) {
        try {
            const anosPath = './anos.js';
            if (fs.existsSync(anosPath)) {
                let content = fs.readFileSync(anosPath, 'utf8');
                content = content.replace(
                    /const CODESPACE_NAME = '[^']*';/,
                    `const CODESPACE_NAME = '${codespaceName}';`
                );
                fs.writeFileSync(anosPath, content);
                this.log(`Updated anos.js with new codespace: ${codespaceName}`);
            }
        } catch (error) {
            this.log(`Error updating anos config: ${error.message}`);
        }
    }

    runNpmInstall() {
        return new Promise((resolve, reject) => {
            this.log('Running npm install...');
            const npmInstall = spawn('npm', ['install'], {
                stdio: 'pipe',
                shell: true
            });

            npmInstall.on('close', (code) => {
                if (code === 0) {
                    this.log('npm install completed successfully');
                    resolve();
                } else {
                    this.log(`npm install failed with code ${code}`);
                    reject(new Error(`npm install failed`));
                }
            });

            npmInstall.on('error', (error) => {
                this.log(`npm install error: ${error.message}`);
                reject(error);
            });
        });
    }

    startAnosKeepAlive() {
        if (this.currentProcess) {
            this.currentProcess.kill();
        }

        this.log('Starting Anos keep-alive...');
        this.currentProcess = spawn('node', ['anos.js'], {
            stdio: 'pipe',
            shell: true
        });

        this.currentProcess.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });

        this.currentProcess.stderr.on('data', (data) => {
            console.error(data.toString().trim());
        });

        this.currentProcess.on('close', (code) => {
            this.log(`Anos process exited with code ${code}`);
            this.randomDelay(() => {
                this.checkAndRun();
            });
        });

        this.currentProcess.on('error', (error) => {
            this.log(`Anos process error: ${error.message}`);
            this.randomDelay(() => {
                this.checkAndRun();
            });
        });
    }

    isCodespaceExpired(codespace) {
        if (!codespace || !codespace.created_at) return false;
        
        const createdTime = new Date(codespace.created_at).getTime();
        const currentTime = Date.now();
        const hoursRunning = (currentTime - createdTime) / (1000 * 60 * 60);
        
        this.log(`Codespace running for ${hoursRunning.toFixed(2)} hours`);
        return hoursRunning >= MAX_CODESPACE_HOURS;
    }

    async checkAndRun() {
        try {
            this.log('Checking codespace status...');
            const currentCodespace = await this.getCurrentCodespace();

            if (!currentCodespace) {
                this.log('No active codespace found, creating new one...');
                const newCodespace = await this.createNewCodespace();
                if (newCodespace) {
                    await this.waitForCodespaceReady(newCodespace.name);
                    this.updateAnosConfig(newCodespace.name);
                    await this.runNpmInstall();
                    this.startAnosKeepAlive();
                    this.currentCodespace = newCodespace;
                }
            } else if (this.isCodespaceExpired(currentCodespace)) {
                this.log('Codespace expired, creating new one...');
                const newCodespace = await this.createNewCodespace();
                if (newCodespace) {
                    await this.deleteOldCodespace(currentCodespace.name);
                    await this.waitForCodespaceReady(newCodespace.name);
                    this.updateAnosConfig(newCodespace.name);
                    await this.runNpmInstall();
                    this.startAnosKeepAlive();
                    this.currentCodespace = newCodespace;
                }
            } else {
                this.log(`Using existing codespace: ${currentCodespace.name}`);
                this.updateAnosConfig(currentCodespace.name);
                if (!fs.existsSync('./node_modules')) {
                    await this.runNpmInstall();
                }
                this.startAnosKeepAlive();
                this.currentCodespace = currentCodespace;
            }

            setTimeout(() => {
                this.randomDelay(() => {
                    this.checkAndRun();
                });
            }, 25 * 60 * 1000);

        } catch (error) {
            this.log(`Error in checkAndRun: ${error.message}`);
            this.randomDelay(() => {
                this.checkAndRun();
            });
        }
    }

    async waitForCodespaceReady(codespaceName, maxWait = 300000) {
        this.log(`Waiting for codespace ${codespaceName} to be ready...`);
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            try {
                const options = {
                    hostname: 'api.github.com',
                    path: `/user/codespaces/${codespaceName}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Anos-AutoRunner/1.0'
                    }
                };

                const codespace = await new Promise((resolve, reject) => {
                    const req = https.request(options, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            if (res.statusCode === 200) {
                                resolve(JSON.parse(data));
                            } else {
                                reject(new Error(`Status check failed: ${res.statusCode}`));
                            }
                        });
                    });
                    req.on('error', reject);
                    req.end();
                });

                if (codespace.state === 'Available') {
                    this.log(`Codespace ${codespaceName} is ready!`);
                    return true;
                }

                this.log(`Codespace state: ${codespace.state}, waiting...`);
                await new Promise(resolve => setTimeout(resolve, 10000));

            } catch (error) {
                this.log(`Error checking codespace status: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        throw new Error('Codespace did not become ready in time');
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            this.log('Shutting down Anos Auto Runner...');
            if (this.currentProcess) {
                this.currentProcess.kill();
            }
            process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
        process.on('SIGQUIT', shutdown);
    }
}

const runner = new AnosAutoRunner();
runner.setupGracefulShutdown();