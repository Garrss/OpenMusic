const fs = require('fs').promises;
const path = require('path');

class StorageService {
  constructor(folder) {
    this._folder = folder;
  }

  async initialize() {
    try {
      await fs.access(this._folder);
    } catch {
      await fs.mkdir(this._folder, { recursive: true });
    }
  }

  // Perbaiki method writeFile di StorageService.js
  async writeFile(file, meta) {
    const filename = `${Date.now()}-${meta.filename}`;
    const filePath = path.join(this._folder, filename);

    // Pastikan folder uploads/covers ada
    await fs.promises.mkdir(this._folder, { recursive: true });

    // Tulis file
    await fs.promises.writeFile(filePath, file.buffer);

    return filename;
  }

  async deleteFile(filename) {
    if (!filename) return;

    const filePath = path.join(this._folder, filename);
    try {
      await fs.promises.access(filePath);
      await fs.promises.unlink(filePath);
    } catch (error) {
      // File tidak ada, abaikan
      console.log('File tidak ditemukan:', filename);
    }
  }
}

module.exports = StorageService;
