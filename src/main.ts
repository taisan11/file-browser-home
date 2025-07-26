import { getStarredItems, updateStarredItem, removeStarredItem } from './star.js';

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

// スターが付いた履歴を表示
function displayStarredHistory(): void {
    try {
        const starredItems = getStarredItems();
        const starredList = document.getElementById('starredList');
        
        if (!starredList) return;
        
        if (starredItems.length === 0) {
            starredList.innerHTML = '<p style="color: #666; font-style: italic;">お気に入りはありません</p>';
            return;
        }
        
        const listHTML = starredItems.map((item: any) => {
            const displayText = item.name || item.url;
            const shortDisplayText = displayText.length > 50 ? displayText.substring(0, 50) + '...' : displayText;
            
            return `
                <div style="margin-bottom: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="flex: 1;">
                            <a href="${item.url}" target="_blank" style="color: #646cff; text-decoration: none;">
                                ★ ${shortDisplayText}
                            </a>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="editStarName('${item.url}', '${(item.name || '').replace(/'/g, "\\'")}')" 
                                    style="padding: 4px 8px; font-size: 12px; background: #e0e0e0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
                                編集
                            </button>
                            <button onclick="removeStar('${item.url}')" 
                                    style="padding: 4px 8px; font-size: 12px; background: #ff6b6b; color: white; border: 1px solid #ff5252; border-radius: 3px; cursor: pointer;">
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        starredList.innerHTML = listHTML;
    } catch (error) {
        console.error('スター履歴の表示に失敗しました:', error);
        const starredList = document.getElementById('starredList');
        if (starredList) {
            starredList.innerHTML = '<p style="color: #f00;">エラーが発生しました</p>';
        }
    }
}

// スター名前を編集する関数
function editStarName(url: string, currentName: string): void {
    const newName = prompt('名前を編集してください:', currentName);
    if (newName !== null) {
        if (updateStarredItem(url, newName)) {
            displayStarredHistory();
        } else {
            alert('名前の更新に失敗しました');
        }
    }
}

// スターを削除する関数
function removeStar(url: string): void {
    if (confirm('このお気に入りを削除しますか？')) {
        removeStarredItem(url);
        displayStarredHistory();
    }
}

// グローバル関数として定義（HTMLから呼び出し用）
(window as any).editStarName = editStarName;
(window as any).removeStar = removeStar;

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
    
    // スター履歴を表示
    displayStarredHistory();
})