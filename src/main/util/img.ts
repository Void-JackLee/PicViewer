import { join } from 'path'
import * as constants from '../constants'
import { mkdir, isFile } from "./file";
const sharp = require('sharp')

let pid;
const loadThumbnail = (path: string, files: string[], callback?: (path: string, file: string,thumbFile: string) => void) => {
  pid = new Date().getTime()
  const current = pid
  mkdir(constants.thumbPath)
  return new Promise(async (resolve, reject) => {
    for (let i in files) {
      if (pid !== current) {
        reject('break')
        break
      }
      const file = join(path, files[i])
      const thumbFile = join(constants.thumbPath, file.replaceAll('_', '-').replaceAll('/', '_'))

      if (isFile(thumbFile)) {
        if (callback) {
          callback(path, files[i], thumbFile)
        }
        continue
      }

      console.log("cache " + files[i])
      const metadata = await sharp(file).metadata()
      let {width, height} = metadata;
      // 得到宽高比
      let aspectRatio = width! / height! || 0;
      // 读取原始图片
      await sharp(file)
        // 调整图片大小并生成缩略图，
        .resize(Math.floor(80 * aspectRatio), 80)
        // 输出缩略图
        .toFile(thumbFile, (err, _) => {
          if (err) console.error(err);
          else if (callback) {
            callback(path, files[i], thumbFile)
          }
        })

    }
    resolve('ok')
  });
}

export {
  loadThumbnail,
}
