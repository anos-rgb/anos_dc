const { exec } = require('child_process');
const path = require('path');

function cloneRepository(repoUrl, targetDir = null) {
  return new Promise((resolve, reject) => {
    let command;
    
    if (targetDir) {
      command = `git clone ${repoUrl} ${targetDir}`;
    } else {
      command = `git clone ${repoUrl}`;
    }

    console.log(`Menjalankan: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        reject(error);
        return;
      }
      
      console.log('Repository berhasil di-clone!');
      console.log(stdout);
      
      if (stderr) {
        console.warn('Warning:', stderr);
      }
      
      resolve(stdout);
    });
  });
}

// Contoh penggunaan
async function main() {
  const repoUrl = 'https://github.com/anos-rgb/anos_dc';
  const targetDirectory = './anos_dc_clone'; // opsional
  
  try {
    await cloneRepository(repoUrl, targetDirectory);
    console.log('Proses clone selesai!');
  } catch (error) {
    console.error('Gagal melakukan clone:', error);
  }
}

main();