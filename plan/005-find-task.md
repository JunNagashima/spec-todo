# 実装計画: spec/005-find-task.md（タスク詳細モーダル）

## Context

タスクカードをクリックすると、サーバーからタスク詳細を取得し、モーダルで表示する機能を追加する。
取得中はローディングインジケーターを表示し、失敗時はトーストを表示してモーダルを閉じる。

---

## 変更ファイル一覧

| ファイル | 操作 | 概要 |
|---|---|---|
| `src/actions/task.ts` | 追記 | `getTaskById` Server Action を追加 |
| `src/components/task/task-detail-dialog.tsx` | 新規作成 | タスク詳細モーダル（Client Component） |
| `src/components/task/task-card.tsx` | 修正 | クリック時にダイアログを開く処理を追加 |
| `docs/changes/20260312-find-task.md` | 新規作成 | 作業ログ |

---

## 実装詳細

### 1. `src/actions/task.ts` に `getTaskById` を追加

```ts
export async function getTaskById(id: number) {
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return { success: false, error: "タスクが見つかりません" } as const;
    return { success: true, data: task } as const;
  } catch {
    return { success: false, error: "取得に失敗しました" } as const;
  }
}
```

---

### 2. `src/components/task/task-detail-dialog.tsx` を新規作成（Client Component）

- `open` / `loading` / `task` の3つの state を持つ
- ラップした子要素（TaskCard の div）のクリックで `handleOpen` が発火
- `handleOpen` の処理:
  1. `setOpen(true)` → `setLoading(true)`
  2. `getTaskById(taskId)` を呼び出す
  3. 失敗時: `toast.error("取得に失敗しました", { duration: 5000 })` → `setOpen(false)`
  4. 成功時: `setTask(result.data)` → `setLoading(false)`
- `onOpenChange` で閉じたとき `setTask(null)` もリセット
- Dialog 内の表示:
  - ローディング中: `<Loader2 className="animate-spin" />`
  - 取得済み: タイトル / 期限 / 優先度 / ステータス / 登録日
- 表示フォーマット:
  - dueDate / createdAt: `formatDate()` を再利用（`src/lib/date.ts`）→ `YYYY/MM/DD`
  - priority: `{ HIGH: "高", MIDDLE: "中", LOW: "低" }` マッピング（task-card.tsx の既存ラベルと同様）
  - status: そのまま表示（TODO / DOING / DONE）

---

### 3. `src/components/task/task-card.tsx` を修正

- `"use client"` ディレクティブを追加
- `TaskDetailDialog` をインポート
- 既存の `<div className="rounded-lg border ...">` を `TaskDetailDialog` でラップ
- Props 変更なし（`task: Task` のまま）

---

## 既存の再利用箇所

- `formatDate()` → `src/lib/date.ts:12`
- `priorityLabel` マッピング → `task-card.tsx:4` のパターンを踏襲
- shadcn Dialog → `src/components/ui/dialog.tsx`
- Sonner toast → `src/components/ui/sonner.tsx`、`toast.error()` を使用

---

## 受け入れ条件の確認方法

1. `bun dev` でサーバー起動
2. タスク一覧画面を開く → 詳細モーダルが非表示であることを確認
3. 任意のタスクカードをクリック → モーダルが開き、ローディングスピナーが表示されること
4. スピナーが消えた後、タイトル / 期限 (YYYY/MM/DD) / 優先度 (高/中/低) / ステータス / 登録日が表示されること
5. X ボタンまたはモーダル枠外クリックでモーダルが閉じること
6. DB 接続エラーを再現させた場合、「取得に失敗しました」トーストが 5 秒表示されてモーダルが閉じること
