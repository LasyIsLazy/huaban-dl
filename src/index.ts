import axios from 'axios'
const imgBaseUrl = 'https://hbimg.huabanimg.com'
const boardUrl = 'https://huaban.com/boards/'
const MAX_PAGE = 1000
const NOT_INITED = 0
const INITED = 1
const PAGING = 2
const FINISHED = 3
const NO_PIN_ID = 0

interface Page {
  title: string
  keys: string[]
  links: string[]
  lastPinId: number
}

interface PinData {
  pin_id: number
  user_id: number
  board_id: number
  file_id: number
  file: {
    file_id: number
    bucket: string
    type: string
    width: number
    height: number
    key: string
    file_length: number
    frames: number
    [prop: string]: any
  }
}

interface PageData {
  board_id: number
  user_id: number
  title: string
  description: string
  category_id: string
  seq: string
  pin_count: number
  follow_count: number
  like_count: number
  created_at: number
  updated_at: number
  deleting: number
  is_private: number
  extra: any
  user: any
  category_name: string
  pins: PinData[]
  [prop: string]: any
}

/**
 * 根据 lastPinId 获取画板和一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
export async function getPageData(
  boardId: number,
  lastPinId?: number
): Promise<PageData> {
  const params = lastPinId ? { max: lastPinId } : {}
  const url = `${boardUrl}/${boardId}`

  const { data } = await axios({
    method: 'GET',
    url,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    params
  })
  return data.board as PageData
}

/**
 * 转换图片的 key 为图片的链接
 * @param keys 图片的 key
 */
export function convertKeysToLinks(keys: Array<string>) {
  return keys.map(key => `${imgBaseUrl}/${key}`)
}
