
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const HuabanDl = require('../lib')

let count = 0
async function download(links) {

  // 下载
  for (let index = 0; index < links.length; index++) {
    const link = links[index];
    console.log(`下载图片: ${link}`)
    const { data } = await axios({
      method: 'GET',
      url: link,
      responseType: 'arraybuffer'
    })
    const directory = path.join(__dirname, '../download')
    await new Promise(resolve => {
      fs.exists(directory, isExists => {
        if (!isExists) {
          console.log(`创建文件夹：${directory}`)
          fs.mkdir(directory, err => console.warn)
        }
        const imgPath = `${directory}/img${count++}.jpeg`
        console.log(`写入路径：${imgPath}`)
        fs.writeFile(imgPath, data, err => {
          err && console.error(err)
          resolve()
        })
      })
    })
  }
  return
}

const boardId = 54016322
let pageData
let keys
let links
let page = 0
async function downloadAll(lastPinId) {
  pageData = await HuabanDl.getPageData(boardId, lastPinId)
  keys = pageData.pins.map(pin => pin.file.key)
  links = HuabanDl.convertKeysToLinks(keys)
  if (!links.length) {
    console.log(`下载完成，下载数量：${count}`)
    return
  }
  await download(links)
  console.log(`第${++page}页下载完成，数量：${links.length}`)
  await downloadAll(pageData.pins[pageData.pins.length - 1].pin_id)
}
downloadAll()