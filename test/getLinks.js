const huaban = require('../lib')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const {
  getLinks
} = huaban

getLinks(35237897).then(links => {
  console.log(`共有 ${links.length} 张图片，图片链接为：`)
  links.forEach(link => console.log(link))
})