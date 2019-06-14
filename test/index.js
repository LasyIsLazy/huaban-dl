const huaban = require('../lib')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const {
  getPageData,
  parsePageData,
  convertKeysToLinks,
} = huaban

async function getAllInfo(boardId, pageCount = 0, keys = [], pinId = 0) {

  // pageData 是请求到的整个页面的内容，可以自己去匹配需要的信息
  const pageData = await getPageData(boardId, pinId)
  // console.log(`页面数据：${pageData}`)

  // parsedData 是从页面内容里解析出来的数据
  const parsedData = await parsePageData(pageData)
  const {
    title, // 画板标题
    keys: imgKeys, // 该页所有图片的 key，主要用于转换为图片链接
    lastPinId // 该页最后一张图片的 pin_id，用于获取下一页
  } = parsedData

  // 完成
  if (!imgKeys.length) {
    console.log(`获取完毕，共 ${pageCount} 页图片`)
    console.log(`图片数量: ${keys.length}`)
    const links = convertKeysToLinks(keys) // `convertKeysToLinks()` 将图片的 `key` 转换为图片链接
    return {
      boardId,
      pageCount,
      keys,
      links,
      title,
      length: keys.length
    }
  }

  // 保存数据
  console.log(`从第 ${++pageCount} 页解析的数据：\n
    画板标题：${title}\n
    该页图片数量：${imgKeys.length}\n
    最后一张图片的 pinId：${lastPinId}\n
    `)
  keys.push(...imgKeys)

  // 获取下一页数据
  return getAllInfo(boardId, pageCount, keys, lastPinId)
}
async function download(boardId) {
  console.log('Getting info...')
  const info = await getAllInfo(boardId)
  const { links } = info
  console.log('Downloading...')
  for (let index = 0; index < links.length; index++) {
    const link = links[index];
    console.log(`Downloading link: ${link}`)
    const { data } = await axios({
      method: 'GET',
      url: link,
      responseType: 'arraybuffer'
    })
    fs.writeFile(path.join(__dirname, '../download', `img${index}.jpeg`), data, err => { err && console.log(err) })
  }
  console.log(`Download finished, total: ${links.length}`)
  return
}

download(35237897)