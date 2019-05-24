import axios from 'axios'
const imgBaseUrl = 'https://hbimg.huabanimg.com'
const boardUrl = 'https://huaban.com/boards/'
interface ParsedData {
  boardDataStr: string,
  title: string,
  imgKeys: Array<string>,
  lastPinId: number
}

/**
 * 解析返回的页面中的数据
 * @param boardId 画板 id
 * @param data 返回的数据
 */
function parsePageData(data: string): ParsedData {
  let match: RegExpMatchArray | null // 正则匹配结果
  // board
  match = data.match(/(?<=page\["board"\]\s*=\s*).+(?=;)/g) // page["board"] = <>;
  if (!match) {
    throw new Error('page["board"] not found')
  }
  const boardDataStr: string = match[0]

  // title
  match = boardDataStr.match(/(?<="title":\s*").+?(?=")/g) // "title": "<>"
  const title = match ? match[0] : ''

  // keys
  match = boardDataStr.match(/(?<="file":\{.+"key":").+?(?=",.+\})/g) // "file":{..."key":"<>",...}
  const imgKeys = match ? [...match] : []

  // 该页最后一张图片的 pin_id
  match = boardDataStr.match(/(?<="pins":\[.+"pin_id":).+?(?=,.+\])/g) // "pins":[..."pin_id":<>,]
  const lastPinId = match ? +match[match.length - 1] : 0

  const parsedData: ParsedData = {
    boardDataStr,
    title,
    imgKeys,
    lastPinId
  }
  return parsedData
}

/**
 * 根据 lastPinId 获取画板一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
function getPageData(boardId: number, lastPinId?: number): Promise<any> {
  const params = lastPinId ? { max: lastPinId } : {}
  return axios.get(`${boardUrl}/${boardId}`, { params })
    .then(res => {
      const { data } = res
      return data
    })
}

/**
 * 转换图片的 key 为图片的链接
 * @param keys 图片的 key
 */
function convertKeysToLinks(keys: Array<string>) {
  return keys.map(key => `${imgBaseUrl}/${key}`)
}

/**
 * 直接获取画板的所有图片下载链接
 * @param boardId 画板 id
 */
async function getLinks(boardId: number) {
  const keys: Array<string> = []
  const getAllData = async (lastPinId?: number) => {
    const pageData = await getPageData(boardId, lastPinId)
    const parsedData = await parsePageData(pageData)
    let {
      imgKeys,
      lastPinId: pinId
    } = parsedData
    if (imgKeys.length) {
      keys.push(...imgKeys)
      getAllData(pinId)
    }
  }
  await getAllData()
  return convertKeysToLinks(keys)
}

export {
  getPageData,
  parsePageData,
  convertKeysToLinks,
  getLinks
}
