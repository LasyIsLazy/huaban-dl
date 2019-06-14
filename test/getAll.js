/**
 * 直接获取所有图片信息
 */

const Board = require('../lib')

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

download(35237897)