# タスク一覧ソート機能

## 目的

カンバンボードの各列内のタスクを、ユーザーが選択した項目・順序でソートできるようにする。

## 変更点

### 新規ファイル

- `src/components/task/sort-control.tsx`: ソートUIコンポーネント（Client Component）
  - ソート項目（登録日 / 期限 / タイトル）のラジオボタン
  - ソート順（昇順 / 降順）のラジオボタン
  - 選択変更時に URL searchParams を更新（`router.replace`）

### 修正ファイル

- `src/schemas/task.ts`: `SortField` / `SortOrder` の Zod スキーマと型を追加
- `src/actions/task.ts`: `getTasks` にソートパラメータ（`sortField`, `sortOrder`）を追加
- `src/app/page.tsx`: `searchParams` を受け取り、バリデーション後に KanbanBoard へ渡す
- `src/components/task/kanban-board.tsx`: ソートパラメータを受け取り、SortControl を表示

### 追加コンポーネント

- `src/components/ui/radio-group.tsx`: shadcn/ui RadioGroup（`@base-ui/react/radio-group` ベース）

## 受け入れ条件

| 条件 | 確認方法 |
|------|---------|
| デフォルト: createdAt Desc | 一覧画面を開いて各列が新しい順に並んでいる |
| createdAt Asc | ソート項目「登録日」・順番「昇順」を選択 → 古い順 |
| dueDate Desc | ソート項目「期限」・順番「降順」を選択 → 期限が新しい順 |
| dueDate Asc | ソート項目「期限」・順番「昇順」を選択 → 期限が古い順 |
| title Desc | ソート項目「タイトル」・順番「降順」を選択 → 辞書順降順 |
| title Asc | ソート項目「タイトル」・順番「昇順」を選択 → 辞書順昇順 |

## 動作確認手順

1. `bun run dev` でローカル起動
2. ブラウザで `http://localhost:3000` を開く
3. 各ソートパターンをラジオボタンで切り替えて各列内の並び順を確認
4. ページリロード後も URL に `?sortField=xxx&sortOrder=xxx` が残り、選択状態が保持されていることを確認
