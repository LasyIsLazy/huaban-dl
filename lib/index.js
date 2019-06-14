"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var imgBaseUrl = 'https://hbimg.huabanimg.com';
var boardUrl = 'https://huaban.com/boards/';
/**
 * 解析返回的页面中的数据
 * @param boardId 画板 id
 * @param data 返回的数据
 */
function parsePageData(data) {
    // 标题、pins
    var title = data.title, pins = data.pins;
    // keys
    var keys = pins.map(function (pin) { return pin.file.key; });
    // 该页最后一张图片的 pin_id
    var lastPinId = pins.length ? pins[pins.length - 1].pin_id : 0;
    var parsedData = {
        title: title,
        keys: keys,
        lastPinId: lastPinId
    };
    return parsedData;
}
exports.parsePageData = parsePageData;
/**
 * 根据 lastPinId 获取画板一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
function getPageData(boardId, lastPinId) {
    var params = lastPinId ? { max: lastPinId } : {};
    var url = boardUrl + "/" + boardId;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    return axios_1.default({
        method: 'GET',
        url: url,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        params: params
    })
        .then(function (res) {
        var data = res.data, headers = res.headers;
        // application/json
        if (!/.*application\/json.*/.test(headers['content-type'])) {
            throw new Error('Response "content-type" is not "application/json"');
        }
        return data.board;
    });
}
exports.getPageData = getPageData;
/**
 * 转换图片的 key 为图片的链接
 * @param keys 图片的 key
 */
function convertKeysToLinks(keys) {
    return keys.map(function (key) { return imgBaseUrl + "/" + key; });
}
exports.convertKeysToLinks = convertKeysToLinks;
/**
 * 直接获取画板的所有图片下载链接
 * @param boardId 画板 id
 */
function getLinks(boardId) {
    return __awaiter(this, void 0, void 0, function () {
        var imgKeys, getAllData;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    imgKeys = [];
                    getAllData = function (lastPinId) { return __awaiter(_this, void 0, void 0, function () {
                        var pageData, parsedData, keys, pinId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getPageData(boardId, lastPinId)];
                                case 1:
                                    pageData = _a.sent();
                                    return [4 /*yield*/, parsePageData(pageData)];
                                case 2:
                                    parsedData = _a.sent();
                                    keys = parsedData.keys, pinId = parsedData.lastPinId;
                                    if (keys.length) {
                                        imgKeys.push.apply(imgKeys, keys);
                                        getAllData(pinId);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, getAllData()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, convertKeysToLinks(imgKeys)];
            }
        });
    });
}
exports.getLinks = getLinks;
