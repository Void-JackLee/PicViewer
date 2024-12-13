const fs = require('fs');
import { join } from 'path'

function isPath(path) {
  try {
    const stat = fs.statSync(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}

function isFile(path) {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch (e) {
    return false;
  }
}

function filterFile(path: string,filter: Set<String>): boolean {
  try {
    const stat = fs.statSync(path);
    const last = path.lastIndexOf('.');
    return stat.isFile() && last > -1 && filter.has(path.substring(last+1));
  } catch (e) {
    return false;
  }
}

function listFiles(dir: string,filter?: Set<String>): string[] {
  const files = fs.readdirSync(dir)
  if (filter) {
    const res: string[] = []
    files.forEach(file => {
      if (!file.startsWith('.') && filterFile(join(dir,file),filter)) res.push(file)
    })
    return res
  }
  return files
}

function mkdir(dir: string): boolean {
  try {
    const stat = fs.statSync(dir);
    if (stat.isDirectory()) return true
    fs.mkdirSync(dir);
    return true
  } catch (e) {
    return false;
  }
}



export {
  isPath,
  isFile,
  filterFile,
  listFiles,
  mkdir,
}
