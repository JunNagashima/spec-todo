# カンバンタスク一覧表示

## 目的

spec/002-select-task.md に基づき、タスクをカンバンボード形式（TODO/DOING/DONE）で一覧表示する機能を追加した。

## 変更点

### 新規ファイル

- `src/components/task/kanban-board.tsx` — async Server Component。DB からタスクを取得しステータス別にグルーピングして3列表示
- `src/components/task/kanban-column.tsx` — Server Component。1列分のカンバン列を描画
- `src/components/task/task-card.tsx` — Server Component。個別タスクカード（title / dueDate / priority）を表示
- `src/components/task/kanban-board-skeleton.tsx` — ローディング中に表示するスケルトン UI
- `src/components/task/kanban-board-error-boundary.tsx` — エラー時に Sonner toast を表示し空のカンバンを描画する Error Boundary（class component）

### 修正ファイル

- `src/actions/task.ts` — `getTasks()` 関数を追加（createdAt DESC 順で全タスク取得）
- `src/lib/date.ts` — `formatDate()` 関数を追加（JST での日付フォーマット）
- `src/app/page.tsx` — Suspense + KanbanBoardErrorBoundary + KanbanBoard を組み込み

## 受け入れ条件

- [x] ページ表示時にローディングスケルトンが表示される
- [x] ローディング中は全ボタンが操作不可（Suspense fallback で全体を置換）
- [x] 各ステータス列に対応するタスクのみ表示
- [x] createdAt の新しい順に並んでいる
- [x] カードに title / dueDate / priority が表示される
- [x] 0件時はカードなし（空列のみ表示）
- [x] DB 障害時は「一覧取得に失敗しました」トーストが5秒間表示される

## 動作確認手順

1. `docker compose up -d` で DB 起動
2. `bun dev` でアプリ起動
3. `http://localhost:3000` にアクセスし、スケルトン → カンバンボードが表示されることを確認
4. タスク登録ダイアログでタスクを作成し、TODO 列に表示されることを確認
5. DB を停止してページをリロードし、トーストが表示されることを確認
6. `bun run check` で Biome lint/format が通ることを確認
