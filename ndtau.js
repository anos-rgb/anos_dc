const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const CONFIG = {
  discord: "https://discord.gg/y8jYv2ZgJ7",
  github: "https://github.com/anos-rgb",
  createInterval: 3000,
  deleteInterval: 10000,
  filePrefix: 'anos_',
  fileExtension: '.txt'
};

class AutoFileManager {
  constructor(config) {
    this.config = config;
    this.createIntervalId = null;
    this.deleteIntervalId = null;
    this.isRunning = false;
    this.createdFiles = new Set();
    this.targetFolder = path.join(__dirname, 'anos-py');
  }

  getSystemInfo() {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(os.totalmem() / 1024 / 1024)
      }
    };
  }

  async ensureFolderExists() {
    try {
      await fs.access(this.targetFolder);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(this.targetFolder, { recursive: true });
        console.log(`📁 Created folder: ${path.basename(this.targetFolder)}`);
      } else {
        throw err;
      }
    }
  }

  generateFilename() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.config.filePrefix}${timestamp}_${random}${this.config.fileExtension}`;
  }

  createFileContent() {
    const time = new Date().toISOString();
    const systemInfo = this.getSystemInfo();
    
    return `Keepalive Service Active
Discord: ${this.config.discord}
GitHub: ${this.config.github}
Created: ${time}
Hostname: ${systemInfo.hostname}
Platform: ${systemInfo.platform} ${systemInfo.arch}
Node: ${systemInfo.nodeVersion}
Uptime: ${systemInfo.uptime}s
Memory: ${systemInfo.memory.used}MB / ${systemInfo.memory.total}MB
${'='.repeat(50)}
`;
  }

  async createFile() {
    try {
      await this.ensureFolderExists();
      
      const filename = this.generateFilename();
      const filepath = path.join(this.targetFolder, filename);
      const content = this.createFileContent();
      
      await fs.writeFile(filepath, content);
      this.createdFiles.add(filepath);
      
      console.log(`✓ File created: anos-py/${filename} (${new Date().toLocaleTimeString()})`);
    } catch (err) {
      console.error('✗ File creation failed:', err.message);
    }
  }

  async deleteOldFiles() {
    const files = Array.from(this.createdFiles);
    let deletedCount = 0;

    for (const filepath of files) {
      try {
        await fs.unlink(filepath);
        this.createdFiles.delete(filepath);
        deletedCount++;
        
        const filename = path.basename(filepath);
        console.log(`✗ File deleted: anos-py/${filename} (${new Date().toLocaleTimeString()})`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          this.createdFiles.delete(filepath);
        } else {
          console.error('Delete failed:', path.basename(filepath), err.message);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`📁 Cleaned up ${deletedCount} files. Remaining: ${this.createdFiles.size}`);
    }
  }

  async cleanupAllFiles() {
    try {
      await this.ensureFolderExists();
      const dirFiles = await fs.readdir(this.targetFolder);
      const targetFiles = dirFiles.filter(file => 
        file.startsWith(this.config.filePrefix) && 
        file.endsWith(this.config.fileExtension)
      );

      for (const file of targetFiles) {
        try {
          await fs.unlink(path.join(this.targetFolder, file));
          console.log(`🗑️ Cleaned: anos-py/${file}`);
        } catch (err) {
          console.error(`Failed to clean: anos-py/${file}`, err.message);
        }
      }

      this.createdFiles.clear();
      console.log(`🧹 Cleanup complete. Removed ${targetFiles.length} files.`);
    } catch (err) {
      console.error('Cleanup failed:', err.message);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Service already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Auto File Manager...');
    console.log(`📁 Target folder: anos-py/`);
    console.log(`📝 Creating files every: ${this.config.createInterval}ms`);
    console.log(`🗑️ Deleting files every: ${this.config.deleteInterval}ms`);
    console.log(`Discord: ${this.config.discord}`);
    console.log(`GitHub: ${this.config.github}`);
    console.log('─'.repeat(60));

    this.createFile();

    this.createIntervalId = setInterval(() => {
      this.createFile();
    }, this.config.createInterval);

    this.deleteIntervalId = setInterval(() => {
      this.deleteOldFiles();
    }, this.config.deleteInterval);

    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('\n🛑 Stopping Auto File Manager...');
    
    if (this.createIntervalId) {
      clearInterval(this.createIntervalId);
      this.createIntervalId = null;
    }

    if (this.deleteIntervalId) {
      clearInterval(this.deleteIntervalId);
      this.deleteIntervalId = null;
    }

    this.isRunning = false;
    
    console.log('🧹 Performing final cleanup...');
    await this.cleanupAllFiles();
    
    console.log('✅ Service stopped cleanly');
    process.exit(0);
  }

  status() {
    return {
      running: this.isRunning,
      createdFiles: this.createdFiles.size,
      createInterval: this.config.createInterval,
      deleteInterval: this.config.deleteInterval,
      uptime: Math.floor(process.uptime())
    };
  }

  getStatus() {
    const status = this.status();
    console.log('📊 Current Status:');
    console.log(`   Running: ${status.running}`);
    console.log(`   Active Files: ${status.createdFiles}`);
    console.log(`   Uptime: ${status.uptime}s`);
    console.log(`   Create Interval: ${status.createInterval}ms`);
    console.log(`   Delete Interval: ${status.deleteInterval}ms`);
    console.log('DEVELOPED CODE BY ANOS')
  }
}

const fileManager = new AutoFileManager(CONFIG);

if (require.main === module) {
  fileManager.start();
  
  setInterval(() => {
    fileManager.getStatus();
  }, 30000);
}

module.exports = { AutoFileManager, CONFIG };