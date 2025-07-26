const storageKey = 'browserStar';

export interface HistoryItem {
    url: string;
    name?: string;
    id: string;
}

// スター付きアイテムの取得
export function getStarredItems(): HistoryItem[] {
    try {
        const items = localStorage.getItem(storageKey);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error('スター付きアイテムの取得に失敗しました:', error);
        return [];
    }
}

// スター付きアイテムの追加
export function addStarredItem(item: HistoryItem): void {
    try {
        const starredItems = getStarredItems();
        // 重複を避けるため、同じURLのアイテムが存在する場合は更新
        const existingIndex = starredItems.findIndex(i => i.url === item.url);
        if (existingIndex >= 0) {
            starredItems[existingIndex] = item;
        } else {
            starredItems.push(item);
        }
        localStorage.setItem(storageKey, JSON.stringify(starredItems));
    } catch (error) {
        console.error('スター付きアイテムの追加に失敗しました:', error);
    }
}

// スター付きアイテムの更新
export function updateStarredItem(url: string, newName: string): boolean {
    try {
        const starredItems = getStarredItems();
        const existingIndex = starredItems.findIndex(i => i.url === url);
        if (existingIndex >= 0) {
            starredItems[existingIndex].name = newName;
            localStorage.setItem(storageKey, JSON.stringify(starredItems));
            return true;
        }
        return false;
    } catch (error) {
        console.error('スター付きアイテムの更新に失敗しました:', error);
        return false;
    }
}

// スター付きアイテムの削除
export function removeStarredItem(url: string): void {
    try {
        let starredItems = getStarredItems();
        starredItems = starredItems.filter(item => item.url !== url);
        localStorage.setItem(storageKey, JSON.stringify(starredItems));
    } catch (error) {
        console.error('スター付きアイテムの削除に失敗しました:', error);
    }
}