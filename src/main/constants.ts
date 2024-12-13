import { homedir } from 'os'
import { join } from 'path'

const supportFileType = ['jpg', 'JPG', 'jpeg', 'JPEG']
const thumbPath = join(homedir(),'.jthumb')

export {
  supportFileType,
  thumbPath
}
