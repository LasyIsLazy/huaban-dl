import axios from 'axios'
const imgBaseUrl = 'https://hbimg.huabanimg.com'
const boardUrl = 'https://huaban.com/boards/'
interface ParsedData {
  title: string,
  keys: Array<string>,
  lastPinId: number
}

/**
 * 解析返回的页面中的数据
 * @param boardId 画板 id
 * @param data 返回的数据
 */
function parsePageData(data: any): ParsedData {

  // 标题、pins
  const { title, pins } = data

  // keys
  const keys: Array<string> = pins.map((pin: any) => pin.file.key)

  // 该页最后一张图片的 pin_id
  const lastPinId: number = pins.length ? pins[pins.length - 1].pin_id : 0

  const parsedData: ParsedData = {
    title,
    keys,
    lastPinId
  }
  return parsedData
}

/**
 * 根据 lastPinId 获取画板一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
function getPageData(boardId: number, lastPinId?: number): Promise<object> {
  const params = lastPinId ? { max: lastPinId } : {}
  const url = `${boardUrl}/${boardId}`
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  return axios({
    method: 'GET',
    url,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    params
  })
    .then(res => {
      const { data, headers } = res

      // application/json
      if (!/.*application\/json.*/.test(headers['content-type'])) {
        throw new Error('Response "content-type" is not "application/json"')
      }
      return data.board
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
  const imgKeys: Array<string> = []
  const getAllData = async (lastPinId?: number) => {
    const pageData = await getPageData(boardId, lastPinId)
    const parsedData = await parsePageData(pageData)
    let {
      keys,
      lastPinId: pinId
    } = parsedData
    if (keys.length) {
      imgKeys.push(...keys)
      getAllData(pinId)
    }
  }
  await getAllData()
  return convertKeysToLinks(imgKeys)
}

export {
  getPageData,
  parsePageData,
  convertKeysToLinks,
  getLinks
}
