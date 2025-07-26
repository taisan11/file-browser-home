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
                                ★ <span id="star-text-${item.url.replace(/[^a-zA-Z0-9]/g, '_')}">${shortDisplayText}</span>
                            </a>
                            <input type="text" 
                                   id="star-edit-${item.url.replace(/[^a-zA-Z0-9]/g, '_')}" 
                                   value="${(item.name || '').replace(/"/g, '&quot;')}"
                                   style="display: none; width: 80%; padding: 4px; border: 1px solid #ccc; border-radius: 3px;"
                                   onkeydown="handleEditKeydown(event, '${item.url}')">
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="toggleEdit('${item.url}')" 
                                    id="edit-btn-${item.url.replace(/[^a-zA-Z0-9]/g, '_')}"
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

// インライン編集を切り替える関数
function toggleEdit(url: string): void {
    const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, '_');
    const textSpan = document.getElementById(`star-text-${sanitizedUrl}`);
    const editInput = document.getElementById(`star-edit-${sanitizedUrl}`) as HTMLInputElement;
    const editBtn = document.getElementById(`edit-btn-${sanitizedUrl}`);
    
    if (!textSpan || !editInput || !editBtn) return;
    
    if (editInput.style.display === 'none') {
        // 編集モードに切り替え
        textSpan.style.display = 'none';
        editInput.style.display = 'inline';
        editBtn.textContent = '保存';
        editInput.focus();
    } else {
        // 保存して表示モードに戻る
        const newName = editInput.value;
        if (updateStarredItem(url, newName)) {
            displayStarredHistory();
        }
    }
}

// キーボードイベントハンドラー
function handleEditKeydown(event: KeyboardEvent, url: string): void {
    if (event.key === 'Enter') {
        toggleEdit(url);
    } else if (event.key === 'Escape') {
        displayStarredHistory(); // 変更をキャンセルして再表示
    }
}

// スターを削除する関数
function removeStar(url: string): void {
    removeStarredItem(url);
    displayStarredHistory();
}

// グローバル関数として定義（HTMLから呼び出し用）
(window as any).toggleEdit = toggleEdit;
(window as any).handleEditKeydown = handleEditKeydown;
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