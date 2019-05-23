import axios from 'axios'
const imgBaseUrl = 'https://hbimg.huabanimg.com'
const boardUrl = 'https://huaban.com/boards/'
const downloadImglinks: Array<string> = []
let pageCount: number = 0 // 处理的页数
function parsePageData(boardId: number, data: string) {
  let match: RegExpMatchArray | null // 正则匹配结果

  // board
  match = data.match(/(?<=page\["board"\]\s*=\s*).+(?=;)/g) // page["board"] = <>;
  if (!match) {
    throw new Error('page["board"] not found')
  }
  const boardStr: string = match[0]

  // title
  match = boardStr.match(/(?<="title":\s*").+?(?=")/g) // "title": "<>"
  if (!match) {
    console.warn('title not found')
  }
  const title: string = match ? match[0] : ''

  // keys
  match = boardStr.match(/(?<="file":\{.+"key":").+?(?=",.+\})/g) // "file":{..."key":"<>",...}
  // 空画板或没有数据了
  if (!match) {
    // 没有数据了
    if (pageCount) {
      console.log(`处理完成，共获取图片数量 ${downloadImglinks.length}`)
    } else {
      console.log('空画板')
    }
    return downloadImglinks
  }
  const keys: Array<string> = [...match]

  // link
  downloadImglinks.push(...keys.map(key => `${imgBaseUrl}/${key}`))

  console.log(`第 ${++pageCount} 页处理完成，该页图片链接数量 ${match.length}`)

  // 该页最后一张图片的 pin_id
  match = boardStr.match(/(?<="pins":\[.+"pin_id":).+?(?=,.+\])/g) // "pins":[..."pin_id":<>,]
  if (match) {
    const lastPinId = +match[match.length - 1]
    console.log(`最后一张图片的 pin_id 是 ${lastPinId}`)
    return getLinks(boardId, lastPinId)
  }
  // TODO: 没有取到 pin_id
  return
}
function getLinks(boardId: number, lastPinId?: number):Promise<any> {
  const params = lastPinId ? { max: lastPinId } : {}
  return axios.get(`${boardUrl}/${boardId}`, { params })
    .then(res => {
      const { data } = res
      return parsePageData(boardId, data)
    })
}
export {
  getLinks
}
