const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const CODESPACES_URL = 'YOUR_CODESPACES_URL_HERE';
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
const REPO_OWNER = 'YOUR_USERNAME';
const REPO_NAME = 'YOUR_REPO_NAME';

const octokit = new Octokit({
    auth: GITHUB_TOKEN
});

class AnosKeepAlive {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.fileCounter = 0;
    }

    async createRandomFile() {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `anos_${timestamp}_${randomId}.txt`;
        const content = `Anos keepalive file created at ${new Date().toISOString()}\nCounter: ${this.fileCounter++}\nRandom: ${Math.random()}`;
        
        try {
            await octokit.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: `keepalive/${fileName}`,
                message: `Anos auto commit ${timestamp}`,
                content: Buffer.from(content).toString('base64'),
            });
            console.log(`Anos file created: ${fileName}`);
        } catch (error) {
            console.error('Anos error creating file:', error.message);
        }
    }

    async deleteOldFiles() {
        try {
            const { data } = await octokit.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: 'keepalive'
            });

            if (Array.isArray(data) && data.length > 10) {
                const oldestFile = data[0];
                await octokit.repos.deleteFile({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    path: oldestFile.path,
                    message: `Anos auto cleanup ${oldestFile.name}`,
                    sha: oldestFile.sha
                });
                console.log(`Anos cleaned up: ${oldestFile.name}`);
            }
        } catch (error) {
            console.error('Anos cleanup error:', error.message);
        }
    }

    async makeHttpRequest() {
        try {
            const response = await fetch(CODESPACES_URL);
            console.log(`Anos ping status: ${response.status}`);
        } catch (error) {
            console.error('Anos ping error:', error.message);
        }
    }

    async performKeepAlive() {
        console.log(`Anos keepalive cycle: ${new Date().toISOString()}`);
        
        await this.createRandomFile();
        await this.makeHttpRequest();
        
        if (Math.random() > 0.7) {
            await this.deleteOldFiles();
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Anos keepalive started');
        
        this.performKeepAlive();
        
        this.interval = setInterval(() => {
            this.performKeepAlive();
        }, 5 * 60 * 1000);
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log('Anos keepalive stopped');
    }
}

const anos = new AnosKeepAlive();

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down Anos...');
    anos.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down Anos...');
    anos.stop();
    process.exit(0);
});

anos.start();

setInterval(() => {
    console.log(`Anos heartbeat: ${new Date().toISOString()}`);
}, 30 * 1000);