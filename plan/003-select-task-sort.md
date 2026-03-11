# 実装計画: spec/003 タスク一覧ソート機能

## 概要

カンバンボード上部にソートコントロール（ラジオボタン）を配置し、全列に対して統一的にソートを適用する。

## 設計方針

**URL Search Params 方式を採用**
- 設計方針「Server Components を優先」に従い、ソート条件を URL の searchParams で管理
- ソート項目変更 → URL 更新 → Server Component が searchParams を読み取り → Prisma クエリに反映
- メリット: Server Component のまま維持、URL でソート状態が共有可能

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/components/task/sort-control.tsx` | 新規 | ソートUI（ラジオボタン）Client Component |
| `src/actions/task.ts` | 修正 | `getTasks` にソートパラメータ対応追加 |
| `src/app/page.tsx` | 修正 | searchParams を受け取り KanbanBoard に渡す |
| `src/components/task/kanban-board.tsx` | 修正 | ソートパラメータを受け取り getTasks に渡す |
| `src/schemas/task.ts` | 修正 | ソートパラメータのバリデーションスキーマ追加 |
| `docs/changes/20260310-select-task-sort.md` | 新規 | 作業ログ |

## ステップ詳細

### Step 1: ソートパラメータの型・バリデーション定義

**`src/schemas/task.ts`** に追加:

```ts
// ソート項目
export const sortFieldSchema = z.enum(["createdAt", "dueDate", "title"]);
export type SortField = z.infer<typeof sortFieldSchema>;

// ソート順
export const sortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof sortOrderSchema>;
```

### Step 2: Server Action `getTasks` の修正

**`src/actions/task.ts`**:
- `getTasks(sortField?: SortField, sortOrder?: SortOrder)` にパラメータ追加
- デフォルト値: `sortField = "createdAt"`, `sortOrder = "desc"`
- Prisma の `orderBy` を動的に構築

```ts
const orderBy = { [sortField]: sortOrder };
const tasks = await prisma.task.findMany({ orderBy });
```

### Step 3: `page.tsx` の修正

**`src/app/page.tsx`**:
- `searchParams` を props から受け取る（Next.js App Router の規約）
- `sortField` / `sortOrder` を取り出して KanbanBoard に渡す
- 不正な値はデフォルト（createdAt / desc）にフォールバック

### Step 4: `kanban-board.tsx` の修正

- props に `sortField`, `sortOrder` を追加
- `getTasks(sortField, sortOrder)` を呼び出す
- SortControl コンポーネントをボード上部に配置

### Step 5: `sort-control.tsx` の新規作成（Client Component）

- `"use client"` 指定
- ソート項目ラジオボタン: createdAt（登録日）/ dueDate（期限）/ title（タイトル）
- ソート順ラジオボタン: Asc（昇順）/ Desc（降順）
- `useRouter` + `useSearchParams` で URL を更新（`router.replace` を使用）
- shadcn/ui の RadioGroup を使用
- 現在の選択状態は searchParams から取得

### Step 6: テスト観点の確認

スペックの受け入れ条件に基づき、以下を手動確認:
1. デフォルト表示: createdAt Desc で各列内ソート済み
2. createdAt Asc 選択 → 古い順に並び替え
3. dueDate Desc → 期限の新しい順
4. dueDate Asc → 期限の古い順
5. title Desc → 辞書順降順
6. title Asc → 辞書順昇順

## 注意点

- **DBスキーマ変更なし** — tasks テーブルは参照のみ
- **依存追加なし** — shadcn/ui の RadioGroup が未導入の場合のみ追加（要確認）
- ソートは全列に統一適用（列ごとの個別ソートではない）
