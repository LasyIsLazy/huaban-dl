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
var axios_1 = __importDefault(require("axios"));
var imgBaseUrl = 'https://hbimg.huabanimg.com';
var boardUrl = 'https://huaban.com/boards/';
var MAX_PAGE = 1000;
var NOT_INITED = 0;
var INITED = 1;
var PAGING = 2;
var FINISHED = 3;
var NO_PIN_ID = 0;
/**
 * 根据 lastPinId 获取画板一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
function getBoardData(boardId, lastPinId) {
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
/**
 * 转换图片的 key 为图片的链接
 * @param keys 图片的 key
 */
function convertKeysToLinks(keys) {
    return keys.map(function (key) { return imgBaseUrl + "/" + key; });
}
module.exports = /** @class */ (function () {
    /**
     * 构造函数
     * @param id 画板 id
     */
    function Board(id) {
        this.id = id;
        this.title = '';
        this.keys = [];
        this.links = [];
        this.lastPinId = NO_PIN_ID;
        this.page = 0;
        this.amount = 0;
        this.status = NOT_INITED;
        Object.defineProperty(this, 'amount', {
            get: function () {
                return this.keys.length;
            },
            set: function () {
                console.warn('Can not set the value of "amount"');
            }
        });
    }
    /**
     * 解析数据
     * @param data 数据
     */
    Board.prototype.parseBoardData = function (data) {
        var _a, _b;
        // 标题、pins
        var title = data.title, pins = data.pins;
        // keys、links
        var keys = [];
        var pin_ids = [];
        pins.forEach(function (pin) {
            var file = pin.file, pin_id = pin.pin_id;
            keys.push(file.key);
            pin_ids.push(pin_id);
        });
        // 完成
        if (!keys.length) {
            this.status = FINISHED;
            return {
                title: title,
                keys: [],
                links: [],
                lastPinId: NO_PIN_ID
            };
        }
        // links
        var links = convertKeysToLinks(keys);
        // 该页最后一张图片的 pin_id
        var lastPinId = pin_ids.length ? pin_ids[pin_ids.length - 1] : NO_PIN_ID;
        this.title = title;
        (_a = this.keys).push.apply(_a, keys);
        (_b = this.links).push.apply(_b, links);
        this.lastPinId = lastPinId;
        return { title: title, keys: keys, lastPinId: lastPinId, links: links };
    };
    /**
     * 初始化
     */
    Board.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var boardData, pageData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getBoardData(this.id)];
                    case 1:
                        boardData = _a.sent();
                        pageData = this.parseBoardData(boardData);
                        this.page = 1;
                        this.status = INITED;
                        return [2 /*return*/, pageData];
                }
            });
        });
    };
    /**
     * 获取下一页图片信息
     */
    Board.prototype.getNextPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var boardData, pageData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.status) {
                            console.warn('Has not been inited');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, getBoardData(this.id, this.lastPinId)];
                    case 1:
                        boardData = _a.sent();
                        pageData = this.parseBoardData(boardData);
                        if (this.status === FINISHED) {
                            return [2 /*return*/];
                        }
                        this.status = PAGING;
                        this.page++;
                        return [2 /*return*/, pageData];
                }
            });
        });
    };
    /**
     * 直接获取所有图片信息
     */
    Board.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, next;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // 初始化
                        _a = !this.status;
                        if (!_a) 
                        // 初始化
                        return [3 /*break*/, 2];
                        return [4 /*yield*/, this.init()
                            // 下一次递归
                        ];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        // 初始化
                        _a;
                        next = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // 完成
                                        if (this.status === FINISHED) {
                                            return [2 /*return*/];
                                        }
                                        // 页数溢出
                                        if (this.page >= MAX_PAGE) {
                                            throw new Error("Overflow: Max page: " + MAX_PAGE);
                                        }
                                        // 获取下一页数据
                                        return [4 /*yield*/, this.getNextPage()
                                            // 进入下一次递归
                                        ];
                                    case 1:
                                        // 获取下一页数据
                                        _a.sent();
                                        // 进入下一次递归
                                        return [4 /*yield*/, next()];
                                    case 2:
                                        // 进入下一次递归
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        // 开始递归
                        return [4 /*yield*/, next()];
                    case 3:
                        // 开始递归
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Board;
}());
