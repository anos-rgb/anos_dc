const fs = require('fs');
const path = require('path');

function initializeDatabase() {
  const dataDir = path.join(__dirname, '..', 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Folder data dibuat');
  }
  
  const statsDataPath = path.join(dataDir, 'serverstats.json');
  if (!fs.existsSync(statsDataPath)) {
    fs.writeFileSync(statsDataPath, JSON.stringify({}, null, 2));
    console.log('File serverstats.json dibuat');
  }
}

module.exports = { initializeDatabase };