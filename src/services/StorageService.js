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

  async writeFile(file, meta) {
    const filename = `${Date.now()}-${meta.filename}`;
    const filePath = path.join(this._folder, filename);

    // 🔥 gunakan fs langsung (bukan fs.promises)
    await fs.mkdir(this._folder, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    return filename;
  }

  async deleteFile(filename) {
    if (!filename) return;

    const filePath = path.join(this._folder, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch {
      // abaikan jika file tidak ada
    }
  }
}

module.exports = StorageService;
