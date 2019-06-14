interface Page {
    title: string;
    keys: string[];
    links: string[];
    lastPinId: number;
}
declare const _default: {
    new (id: number): {
        id: number;
        title: string;
        keys: string[];
        links: string[];
        page: number;
        amount: number;
        status: number;
        lastPinId: number;
        /**
         * 解析数据
         * @param data 数据
         */
        parseBoardData(data: any): Page;
        /**
         * 初始化
         */
        init(): Promise<Page>;
        /**
         * 获取下一页图片信息
         */
        getNextPage(): Promise<Page | null | undefined>;
        /**
         * 直接获取所有图片信息
         */
        getAll(): Promise<void>;
    };
};
export = _default;
