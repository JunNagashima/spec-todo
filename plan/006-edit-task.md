# 実装計画: spec/006-edit-task.md（タスク編集モード）

## Context

タスク詳細モーダルに「編集モード」を追加する。スペックの重要ポイントとして、**この編集モードでは保存を行わない**。「更新」ボタンも「キャンセル」ボタンも編集モードを終了してテキスト表示に戻るだけで、変更は破棄される。モーダルを閉じた場合も同様。

---

## 変更ファイル一覧

| ファイル | 操作 | 概要 |
|---|---|---|
| `src/components/task/task-detail-dialog.tsx` | 修正 | 編集モード切替機能を追加 |
| `docs/changes/20260314-edit-task.md` | 新規作成 | 作業ログ |

---

## 実装詳細

### 1. `src/components/task/task-detail-dialog.tsx` を修正

**状態追加:**

```ts
const [isEditing, setIsEditing] = useState(false);
```

**編集モード切替ロジック:**

- 「編集」ボタン押下 → `setIsEditing(true)`
- 「キャンセル」ボタン押下 → `setIsEditing(false)`（変更破棄）
- 「更新」ボタン押下 → `setIsEditing(false)`（変更破棄、保存しない）
- モーダルclose時（`handleOpenChange`）→ `setIsEditing(false)` をリセット（再オープン時は再fetchするため元の値に戻る）

**テキスト表示モード（既存 + 編集ボタン追加）:**

- title / dueDate / priority / status / createdAt をテキスト表示（既存）
- 「編集」ボタンを追加（`Button variant="outline"`）

**フォーム表示モード（新規、`isEditing = true` 時）:**

- title: `Input`（`defaultValue={task.title}`）
- dueDate: `<input type="date">`（`defaultValue` = task.dueDate をJST `YYYY-MM-DD` 形式に変換）
- priority: `Select`（`defaultValue={task.priority}`、選択肢: HIGH→高 / MIDDLE→中 / LOW→低）
- status: `Select`（`defaultValue={task.status}`、選択肢: TODO / DOING / DONE）
- createdAt: テキスト表示のまま（編集不可）
- 「キャンセル」ボタン（`Button variant="outline"`）→ `setIsEditing(false)`
- 「更新」ボタン（`Button`）→ `setIsEditing(false)`

**フォーム管理方針:**

- react-hook-form は不要（バリデーション不要・保存しないため）
- ローカルstateも不要（フォームの値は破棄するだけなので管理不要）
- `defaultValue` を使って初期値を設定するだけでよい

---

## 再利用するコンポーネント・パターン

| 用途 | 参照先 |
|---|---|
| `Input` | `src/components/ui/input.tsx` |
| `Select` 系 | `src/components/ui/select.tsx` |
| `Button` | `src/components/ui/button.tsx` |
| 優先度ラベル | `task-card.tsx` の `priorityLabels` マッピング（HIGH→"高" 等）|
| 日付フォーマット | `src/lib/date.ts` の `formatDate()`、`toDateInputValue()` を新規追加（sv-SE ロケールで YYYY-MM-DD 変換）|

---

## 変更しないもの

- Server Actions（保存しないため `updateTask` は不要）
- Prismaスキーマ
- Zodスキーマ
- 他コンポーネント

---

## 受け入れ条件の確認方法

1. `bun run dev` で開発サーバー起動
2. タスクカードクリック → 詳細モーダル表示
3. 「編集」ボタン押下 → フォーム表示に切替、各フィールドに初期値が入っていることを確認
4. 値を変更 → 「キャンセル」 → テキスト表示に戻り、元の値が表示されること
5. 値を変更 → 「更新」 → テキスト表示に戻り、元の値が表示されること
6. 値を変更 → モーダル閉じる → 再度開く → 元の値が表示されること
