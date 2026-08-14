import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// fileDelete.js 位于 server/src/utils/，回退两级到 server/，再进 uploads/
const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

// 物理删除单个文件（支持 /uploads/xxx URL、纯文件名、绝对路径）
function deleteFile(relOrAbs) {
  if (!relOrAbs) return false;
  let abs;
  let s = String(relOrAbs);
  // 1) 形如 /uploads/xxx 的 URL 路径（注意：在 Linux 上 path.isAbsolute 会误判，需先处理）
  if (s.startsWith('/uploads/')) {
    abs = path.join(UPLOAD_ROOT, s.slice('/uploads/'.length));
  } else if (s.startsWith('uploads/')) {
    abs = path.join(UPLOAD_ROOT, s.slice('uploads/'.length));
  } else if (path.isAbsolute(s) && fs.existsSync(s)) {
    // 真正的文件系统绝对路径
    abs = s;
  } else {
    // 纯文件名或相对路径
    abs = path.join(UPLOAD_ROOT, s);
  }
  try {
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      fs.unlinkSync(abs);
      return true;
    }
  } catch (e) {
    console.error('deleteFile error:', abs, e.message);
  }
  return false;
}

// 批量物理删除（主图 + 详情图集）
function deleteImageSet(mainImage, detailImages = []) {
  let count = 0;
  if (mainImage) count += deleteFile(mainImage) ? 1 : 0;
  for (const img of detailImages) {
    count += deleteFile(img) ? 1 : 0;
  }
  return count;
}

export { deleteFile, deleteImageSet, UPLOAD_ROOT };
