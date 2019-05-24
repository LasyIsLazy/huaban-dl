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
huaban.getLinks(boardId).then(links => { // boardId 为画板 id
    console.log(links)
})
```

### 操作整个流程

可以获取更多信息，流程可控。

```JavaScript
const huaban = require('huaban-dl')
const {
  getPageData,
  parsePageData,
  convertKeysToLinks,
  getLinks
} = huaban
const boardId = 35237897 // 画板 id

async function getAllInfo(boardId, pageCount = 0, keys = [], pinId = 0) {

  // pageData 是请求到的整个页面的内容，可以自己去匹配需要的信息
  const pageData = await getPageData(boardId, pinId)
  // console.log(`页面数据：${pageData}`)

  // parsedData 是从页面内容里解析出来的数据
  const parsedData = await parsePageData(pageData)
  const {
    boardDataStr, // `boardDataStr` 是匹配到画板相关的内容，可以自己去匹配需要的信息
    title, // 画板标题
    imgKeys, // 该页所有图片的 key，主要用于转换为图片链接
    lastPinId // 该页最后一张图片的 pin_id，用于获取下一页
  } = parsedData

  // 完成
  if (!imgKeys.length) {
    console.log(`获取完毕，共 ${keys.length} 页图片`)
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
    该页所有图片的 key：${imgKeys}\n
    最后一张图片的 pinId：${lastPinId}\n
    `)
  keys.push(...imgKeys)

  // 获取下一页数据
  return getAllInfo(boardId, pageCount, keys, lastPinId)
}
getAllInfo(boardId).then(info => {
  // console.log(`所有信息：${info}`)
})
```