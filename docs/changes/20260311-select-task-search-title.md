# タスク一覧タイトル検索（絞り込み）機能

## 目的

カンバンボード上部にタイトル絞り込みフォームを追加し、部分一致で全列のタスクを絞り込めるようにする。

## 変更点

### 新規ファイル

- `src/components/task/search-title-form.tsx`: 検索フォームコンポーネント（Client Component）
  - テキスト入力 + 絞り込みボタン
  - ボタン押下時に入力値を trim し URL の `searchTitle` パラメータを更新
  - 空欄の場合は `searchTitle` パラメータを除去して全件表示

### 修正ファイル

- `src/actions/task.ts`: `getTasks` に `searchTitle?` パラメータ追加、Prisma `where.title.contains` 条件を追加
- `src/app/page.tsx`: `SearchParams` 型に `searchTitle` を追加、trim して下流に渡す
- `src/components/task/kanban-board.tsx`: `searchTitle` を受け取り `SearchTitleForm` と `getTasks` に渡す

## 受け入れ条件

| 条件 | 確認方法 |
|------|---------|
| 初期表示で全件表示 | 一覧画面を開いて絞り込みなし |
| 部分一致絞り込み | タイトルの一部を入力 → 絞り込みボタン押下 → 一致タスクのみ表示 |
| 空欄で全件表示 | 入力欄を空にして絞り込みボタン押下 → 全件表示に戻る |
| ソートとの併用 | ソート変更後に検索しても両方が正しく動作する |

## 動作確認手順

1. `bun run dev` でローカル起動
2. ブラウザで `http://localhost:3000` を開く
3. タイトル絞り込み欄に文字列を入力して絞り込みボタンを押す
4. 部分一致するタスクのみ表示されることを確認
5. 入力欄を空にして絞り込みボタンを押し、全件表示に戻ることを確認
6. ソートと検索を組み合わせて動作確認
