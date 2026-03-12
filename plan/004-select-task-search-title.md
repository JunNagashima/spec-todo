# 実装計画: spec/004 タイトル検索（絞り込み）機能

## 概要

カンバンボード上部に検索フォーム（テキスト入力 + 絞り込みボタン）を配置し、タイトルの部分一致（contains）で全列のタスクを絞り込む。

## 設計方針

**既存のソート機能と同じ URL Search Params 方式を踏襲**
- 検索ワードを `searchTitle` パラメータで URL 管理
- ボタン押下時に URL 更新 → Server Component 再レンダリング → Prisma where 条件に反映
- `useSearchParams` は使わず、props から現在値を受け取る（spec/003 で学んだ教訓）

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/components/task/search-title-form.tsx` | 新規 | 検索フォーム（テキスト入力 + 絞り込みボタン）Client Component |
| `src/actions/task.ts` | 修正 | `getTasks` に `searchTitle` パラメータ追加、Prisma `where` に `contains` 条件追加 |
| `src/app/page.tsx` | 修正 | `searchParams` から `searchTitle` を取り出し下流に渡す |
| `src/components/task/kanban-board.tsx` | 修正 | `searchTitle` を受け取り、`getTasks` と `SearchTitleForm` に渡す |
| `docs/changes/20260311-select-task-search-title.md` | 新規 | 作業ログ |

## ステップ詳細

### Step 1: `getTasks` に検索パラメータ追加

**`src/actions/task.ts`**:

```ts
export async function getTasks(
  sortField: SortField = "createdAt",
  sortOrder: SortOrder = "desc",
  searchTitle?: string,
) {
  const where = searchTitle
    ? { title: { contains: searchTitle } }
    : {};

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
  });
}
```

- `searchTitle` は呼び出し側で trim 済みの値を渡す前提
- 空文字列の場合は `undefined` として扱う（全件取得）

### Step 2: `page.tsx` の修正

- `SearchParams` 型に `searchTitle?: string` を追加
- `params.searchTitle` を trim し、空文字なら `undefined` にする
- `KanbanPageContent` → `KanbanBoard` に `searchTitle` を渡す

### Step 3: `kanban-board.tsx` の修正

- Props に `searchTitle?: string` を追加
- `getTasks(sortField, sortOrder, searchTitle)` に渡す
- `SearchTitleForm` を SortControl の上に配置し、現在の検索ワードを props で渡す

### Step 4: `search-title-form.tsx` の新規作成

**Client Component（`"use client"`）**:

- テキスト入力（shadcn/ui `Input`）+ 絞り込みボタン（shadcn/ui `Button`）
- ローカル state で入力値を管理（`useState`）
- 初期値は props の `searchTitle`（現在の検索ワード）
- ボタン押下時:
  - 入力値を trim
  - `router.replace` で URL 更新（既存の sort パラメータも保持）
  - 空欄なら `searchTitle` パラメータを URL から除去
- `useSearchParams` は使わない（sort パラメータは props で受け取る）

### Step 5: テスト観点

1. 初期表示: 全件表示される
2. 「1」で絞り込み → 部分一致するタスクのみ表示
3. 空欄で絞り込み → 全件表示に戻る
4. ソートと検索の併用が正しく動作する

## 注意点

- **DBスキーマ変更なし** — tasks テーブルは参照のみ
- **依存追加なし** — shadcn/ui の Input / Button は導入済み
- ソート params（`sortField` / `sortOrder`）との共存: URL 更新時に既存パラメータを維持する
- PostgreSQL の `contains` はデフォルトで大文字小文字を区別する。スペックに case-insensitive の要件がないためそのまま使用
