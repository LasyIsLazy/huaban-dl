"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var imgBaseUrl = 'https://hbimg.huabanimg.com';
var boardUrl = 'https://huaban.com/boards/';
var downloadImglinks = [];
var pageCount = 0; // 处理的页数
function parsePageData(boardId, data) {
    var match; // 正则匹配结果
    // board
    match = data.match(/(?<=page\["board"\]\s*=\s*).+(?=;)/g); // page["board"] = <>;
    if (!match) {
        throw new Error('page["board"] not found');
    }
    var boardStr = match[0];
    // title
    match = boardStr.match(/(?<="title":\s*").+?(?=")/g); // "title": "<>"
    if (!match) {
        console.warn('title not found');
    }
    var title = match ? match[0] : '';
    // keys
    match = boardStr.match(/(?<="file":\{.+"key":").+?(?=",.+\})/g); // "file":{..."key":"<>",...}
    // 空画板或没有数据了
    if (!match) {
        // 没有数据了
        if (pageCount) {
            console.log("\u5904\u7406\u5B8C\u6210\uFF0C\u5171\u83B7\u53D6\u56FE\u7247\u6570\u91CF " + downloadImglinks.length);
        }
        else {
            console.log('空画板');
        }
        return downloadImglinks;
    }
    var keys = match.slice();
    // link
    downloadImglinks.push.apply(downloadImglinks, keys.map(function (key) { return imgBaseUrl + "/" + key; }));
    console.log("\u7B2C " + ++pageCount + " \u9875\u5904\u7406\u5B8C\u6210\uFF0C\u8BE5\u9875\u56FE\u7247\u94FE\u63A5\u6570\u91CF " + match.length);
    // 该页最后一张图片的 pin_id
    match = boardStr.match(/(?<="pins":\[.+"pin_id":).+?(?=,.+\])/g); // "pins":[..."pin_id":<>,]
    if (match) {
        var lastPinId = +match[match.length - 1];
        console.log("\u6700\u540E\u4E00\u5F20\u56FE\u7247\u7684 pin_id \u662F " + lastPinId);
        return getLinks(boardId, lastPinId);
    }
    // TODO: 没有取到 pin_id
    return;
}
function getLinks(boardId, lastPinId) {
    var params = lastPinId ? { max: lastPinId } : {};
    return axios_1.default.get(boardUrl + "/" + boardId, { params: params })
        .then(function (res) {
        var data = res.data;
        return parsePageData(boardId, data);
    });
}
exports.getLinks = getLinks;
