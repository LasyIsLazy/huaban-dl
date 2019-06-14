# huaban-dl

下载花瓣网的图片

## 安装

依赖于 `axios`，先安装 `axios`：

```shell
yarn add axios
# 或者
npm i axios
```

```shell
yarn add huaban-dl
# 或者
npm i huaban-dl
```

## 使用

### 简单使用

直接获取画板所有图片的下载链接

```JavaScript
const boardId = 35237897
const Board = require('huaban-dl')

async function download(boardId) {
  const board = new Board(boardId)
  console.log('初始化中……')
  await board.init()
  console.log('正在获取所有图片信息……')
  await board.getAll()
  const { amount, page, links } = board

  console.log(`共有图片页数： ${page}`)
  console.log(`共有图片数量： ${amount}`)
  console.log(`所有图片链接： \n${links.join('\n')}`)
}

download(boardId)
```

### 操作整个流程

可以获取更多信息，流程可控。

```JavaScript
/**
 * 按页数逐步获取图片信息
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const Board = require('huaban-dl')

async function download(boardId) {
  const board = new Board(boardId)
  console.log('初始化中……')
  const { links: firstPageLinks } = await board.init()
  console.log('初始化完成')
  console.log(`第 ${board.page} 页图片数量：${firstPageLinks.length}，该页所有链接：`)
  console.log(`${firstPageLinks.join('\n')}`)

  // 获取下一页数据
  const next = async () => {
    const data = await board.getNextPage()

    // 结束
    if (!data) {
      return
    }

    const { links } = data
    console.log(`第 ${board.page} 页图片数量：${links.length}，该页所有链接：`)
    console.log(`${links.join('\n')}`)

    // 递归
    await next()
  }

  // 递归获取下一页数据
  await next()

  console.log(`共有图片 ${board.page} 页，${board.amount} 张`)

  // 下载
  const { links } = board
  for (let index = 0; index < links.length; index++) {
    const link = links[index];
    console.log(`下载图片: ${link}`)
    const { data } = await axios({
      method: 'GET',
      url: link,
      responseType: 'arraybuffer'
    })
    const directory = path.join(__dirname, '../download')
    fs.exists(directory, isExists => {
      if (!isExists) {
        console.log(`创建文件夹：${directory}`)
        fs.mkdir(directory, err => console.warn)
      }
      const imgPath = `${directory}/img${index}.jpeg`
      console.log(`写入路径：${imgPath}`)
      fs.writeFile(imgPath, data, err => { err && console.log(err) })
    })
  }
  return
}

const boardId = 35237897
download(boardId)
```
