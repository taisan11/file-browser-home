// 履歴に追加する関数
function addToHistory(url: string, query?: string): void {
    try {
        const storageKey = 'browserHistory';
        const stored = localStorage.getItem(storageKey);
        const history = stored ? JSON.parse(stored) : [];
        
        const newItem = {
            url,
            query,
            timestamp: Date.now(),
            id: Date.now().toString(36) + Math.random().toString(36).substr(2)
        };
        
        // 同じURLの重複を避ける
        const existingIndex = history.findIndex((item: any) => item.url === url);
        if (existingIndex >= 0) {
            history[existingIndex] = newItem;
        } else {
            history.push(newItem);
        }
        
        // 最大1000件まで保持
        if (history.length > 1000) {
            history.splice(1000);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
        console.error('履歴の保存に失敗しました:', error);
    }
}

window.addEventListener("load", () => {
    const searchBox = document.getElementById('searchbox');
    const searchText = document.getElementById('searchtext');

    if (searchBox && searchText) {
        searchBox.addEventListener("submit", (event) => {
            event.preventDefault(); // デフォルトのフォーム送信を防ぐ
            
            const query = (searchText as HTMLInputElement).value.trim();
            if (/^https?:\/\/\S+$/i.test(query)) {
                console.log("Valid URL detected, redirecting...");
                // 履歴に追加
                addToHistory(query);
                window.location.href = query;
                return;
            }
            if (query) {
                console.log("Searching for:", query);
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                // 履歴に追加
                addToHistory(searchUrl, query);
                window.location.href = searchUrl;
            }
        });
    }
})