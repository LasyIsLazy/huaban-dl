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
  title: string,
  keys: string[],
  links: string[],
  lastPinId: number
}

/**
 * 根据 lastPinId 获取画板一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
function getBoardData(boardId: number, lastPinId?: number): Promise<object> {
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


export = class Board {
  id: number
  title: string
  keys: string[]
  links: string[]
  page: number
  amount: number
  protected status: number
  private lastPinId: number
  /**
   * 构造函数 
   * @param id 画板 id
   */

  constructor(id: number) {
    this.id = id
    this.title = ''
    this.keys = []
    this.links = []
    this.lastPinId = NO_PIN_ID
    this.page = 0
    this.amount = 0
    this.status = NOT_INITED
    Object.defineProperty(this, 'amount', {
      get() {
        return this.keys.length
      },
      set() {
        console.warn('Can not set the value of "amount"')
      }
    })
  }

  /**
   * 解析数据
   * @param data 数据
   */
  private parseBoardData(data: any): Page {

    // 标题、pins
    const { title, pins } = data

    // keys、links
    const keys: string[] = []
    const pin_ids: number[] = []
    pins.forEach((pin: any) => {
      const { file, pin_id } = pin
      keys.push(file.key)
      pin_ids.push(pin_id)
    })

    // 完成
    if (!keys.length) {
      this.status = FINISHED
      return {
        title,
        keys: [],
        links: [],
        lastPinId: NO_PIN_ID
      }
    }

    // links
    const links = convertKeysToLinks(keys)

    // 该页最后一张图片的 pin_id
    const lastPinId: number = pin_ids.length ? pin_ids[pin_ids.length - 1] : NO_PIN_ID

    this.title = title
    this.keys.push(...keys)
    this.links.push(...links)
    this.lastPinId = lastPinId

    return { title, keys, lastPinId, links }
  }

  /**
   * 初始化
   */
  async init(): Promise<Page> {
    const boardData = await getBoardData(this.id)
    const pageData = this.parseBoardData(boardData)
    this.page = 1
    this.status = INITED
    return pageData
  }

  /**
   * 获取下一页图片信息
   */
  async getNextPage(): Promise<Page | undefined | null> {
    if (!this.status) {
      console.warn('Has not been inited')
      return
    }
    const boardData = await getBoardData(this.id, this.lastPinId)
    const pageData = this.parseBoardData(boardData)
    if (this.status === FINISHED) {
      return
    }
    this.status = PAGING
    this.page++
    return pageData
  }

  /**
   * 直接获取所有图片信息
   */
  async getAll() {
    // 初始化
    !this.status && await this.init()

    // 下一次递归
    const next = async () => {
      
      // 完成
      if (this.status === FINISHED) {
        return
      }
      
      // 页数溢出
      if (this.page >= MAX_PAGE) {
        throw new Error(`Overflow: Max page: ${MAX_PAGE}`)
      }

      // 获取下一页数据
      await this.getNextPage()

      // 进入下一次递归
      await next()
    }

    // 开始递归
    await next()
  }
}
