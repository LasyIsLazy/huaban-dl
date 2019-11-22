/**
 * 根据 lastPinId 获取画板和一页的数据
 * @param boardId 画板 id
 * @param lastPinId 上页最后一张图片的 id
 */
export declare function getPageData(boardId: number, lastPinId?: number): Promise<object>;
/**
 * 转换图片的 key 为图片的链接
 * @param keys 图片的 key
 */
export declare function convertKeysToLinks(keys: Array<string>): string[];
