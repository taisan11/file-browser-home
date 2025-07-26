import { addStarredItem } from './star';

interface HistoryItem {
    url: string;
    query?: string;
    timestamp: number;
    id: string;
}

const storageKey = 'browserHistory';

// 履歴を取得
function getHistory(): HistoryItem[] {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return [];

        const history: HistoryItem[] = JSON.parse(stored);
        // 日時でソート（新しい順）
        return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('履歴の取得に失敗しました:', error);
        return [];
    }
}

// 履歴アイテムを追加
export function addHistoryItem(url: string, query?: string): void {
    try {
        const history = getHistory();
        const newItem: HistoryItem = {
            url,
            query,
            timestamp: Date.now(),
            id: Date.now().toString(36) + Math.random().toString(36).substr(2)
        };

        // 同じURLの重複を避ける（最新のもので更新）
        const existingIndex = history.findIndex(item => item.url === url);
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

// 特定の履歴アイテムを削除
export function deleteHistoryItem(id: string): boolean {
    try {
        const history = getHistory();
        const filteredHistory = history.filter(item => item.id !== id);

        if (filteredHistory.length !== history.length) {
            localStorage.setItem(storageKey, JSON.stringify(filteredHistory));
            return true;
        }
        return false;
    } catch (error) {
        console.error('履歴の削除に失敗しました:', error);
        return false;
    }
}

// 全履歴を削除
export function clearAllHistory(): void {
    try {
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.error('履歴の全削除に失敗しました:', error);
    }
}

// 履歴を表示
function displayHistory(): void {
    const history = getHistory();
    const tbody = document.getElementById('historyBody') as HTMLTableSectionElement;
    const emptyMessage = document.getElementById('emptyMessage') as HTMLDivElement;
    const table = document.getElementById('historyTable') as HTMLTableElement;
    
    if (history.length === 0) {
        table.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    emptyMessage.style.display = 'none';
    
    tbody.innerHTML = '';
    
    history.forEach(item => {
        const row = tbody.insertRow();
        
        // URL列
        const urlCell = row.insertCell();
        urlCell.className = 'url-cell';
        urlCell.innerHTML = `<a href="${item.url}" target="_blank" class="url-link">${item.url}</a>`;
        
        // クエリ列
        const queryCell = row.insertCell();
        queryCell.textContent = item.query || '-';
        
        // 日時列
        const dateCell = row.insertCell();
        dateCell.className = 'date-cell';
        dateCell.textContent = new Date(item.timestamp).toLocaleString('ja-JP');
        
        // 操作列
        const actionCell = row.insertCell();
        actionCell.className = 'action-cell';
        
        // スターボタン
        const starBtn = document.createElement('button');
        starBtn.className = 'star-btn';
        starBtn.textContent = '★'
        starBtn.onclick = () => addStarredItem({ url: item.url, name: item.query || '', id: item.id });
        actionCell.appendChild(starBtn);
        
        // 削除ボタン
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.onclick = () => deleteHistoryItemHTML(item.id);
        actionCell.appendChild(deleteBtn);
    });
}

// 履歴アイテムを削除
function deleteHistoryItemHTML(id: string): void {
    if (confirm('この履歴を削除しますか？')) {
        if (deleteHistoryItem(id)) {
            displayHistory();
        } else {
            alert('削除に失敗しました');
        }
    }
}

// 全履歴を削除
function clearAllHistoryHTML(): void {
    if (confirm('全ての履歴を削除しますか？この操作は取り消せません。')) {
        clearAllHistory();
        displayHistory();
    }
}

// グローバル関数として定義（HTMLから呼び出し用）
(window as any).clearAllHistoryHTML = clearAllHistoryHTML;

// ページ読み込み時に履歴を表示
window.addEventListener('load', () => {
    displayHistory();
});