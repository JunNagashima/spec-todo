# 実装計画: 002-select-task（カンバンタスク一覧表示）

## Context

spec/002-select-task.md に基づき、タスクをカンバンボード形式（TODO/DOING/DONE）で一覧表示する機能を実装する。現在はタスク作成機能のみ実装済みで、作成したタスクを確認する手段がない。

## アーキテクチャ方針

**データ取得**: Server Component（async）で Prisma から直接取得
**ローディング**: React Suspense + fallback skeleton
**エラーハンドリング**: Error Boundary（class component）+ Sonner toast
**「全ボタン無効化」**: Suspense boundary で CreateTaskDialog も含めてラップし、ローディング中は skeleton のみ表示（ボタン自体が存在しないため操作不可）

## 実装ステップ

### Step 1: データ取得関数を追加

**`src/actions/task.ts`** (修正)

```typescript
export async function getTasks() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: tasks } as const;
  } catch {
    return { success: false, error: "一覧取得に失敗しました" } as const;
  }
}
```

### Step 2: 日付フォーマット関数を追加

**`src/lib/date.ts`** (修正)

```typescript
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(date);
}
```

### Step 3: タスクカードコンポーネント（Server Component）

**`src/components/task/task-card.tsx`** (新規)

- title, dueDate（formatDate で表示）, priority を表示
- priority に応じたバッジ色（HIGH=赤系, MIDDLE=黄系, LOW=青系）

### Step 4: カンバン列コンポーネント（Server Component）

**`src/components/task/kanban-column.tsx`** (新規)

- ステータス名をヘッダーに表示
- タスク配列を受け取り TaskCard をリスト表示
- 0件時はカードなし（空の列を表示）

### Step 5: カンバンボード（async Server Component）

**`src/components/task/kanban-board.tsx`** (新規)

- `getTasks()` を呼び出してデータ取得
- 失敗時は `throw new Error("一覧取得に失敗しました")` で Error Boundary に委譲
- 成功時は tasks を TODO/DOING/DONE にグルーピングし、3つの KanbanColumn を横並び表示

### Step 6: スケルトン（ローディング表示）

**`src/components/task/kanban-board-skeleton.tsx`** (新規)

- カンバンボードと同じ3列レイアウトのスケルトン UI
- アニメーション付き placeholder

### Step 7: Error Boundary（Client Component）

**`src/components/task/kanban-board-error-boundary.tsx`** (新規)

- class component（React の制約）
- `componentDidCatch` で `toast.error("一覧取得に失敗しました", { duration: 5000 })` を発火
- fallback UI: 空のカンバンボード（カードなし状態）を表示

### Step 8: page.tsx を更新

**`src/app/page.tsx`** (修正)

```tsx
import { Suspense } from "react";
import { KanbanBoard } from "@/components/task/kanban-board";
import { KanbanBoardSkeleton } from "@/components/task/kanban-board-skeleton";
import { KanbanBoardErrorBoundary } from "@/components/task/kanban-board-error-boundary";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <KanbanBoardErrorBoundary>
        <Suspense fallback={<KanbanBoardSkeleton />}>
          <KanbanPageContent />
        </Suspense>
      </KanbanBoardErrorBoundary>
    </main>
  );
}

// async Server Component: Suspense 境界内に配置
async function KanbanPageContent() {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <CreateTaskDialog />
      </div>
      <KanbanBoard />
    </>
  );
}
```

CreateTaskDialog を Suspense 内に含めることで、ローディング中はスケルトンのみ表示され「全ボタン操作不可」を満たす。

### Step 9: 変更ログ

**`docs/changes/20260309-select-task.md`** (新規)

## ファイル一覧

| ファイル | 操作 | 目的 |
|---|---|---|
| `src/actions/task.ts` | 修正 | `getTasks()` 追加 |
| `src/lib/date.ts` | 修正 | `formatDate()` 追加 |
| `src/app/page.tsx` | 修正 | Suspense + ErrorBoundary + カンバン配置 |
| `src/components/task/kanban-board.tsx` | 新規 | async SC、データ取得・グルーピング |
| `src/components/task/kanban-column.tsx` | 新規 | SC、1列分の表示 |
| `src/components/task/task-card.tsx` | 新規 | SC、カード表示 |
| `src/components/task/kanban-board-skeleton.tsx` | 新規 | ローディングスケルトン |
| `src/components/task/kanban-board-error-boundary.tsx` | 新規 | エラー時 toast + 空表示 |
| `docs/changes/20260309-select-task.md` | 新規 | 変更ログ |

## 既存再利用

- `src/lib/prisma.ts` — Prisma Client singleton
- `src/lib/date.ts` — 日付ユーティリティ（formatDate を追記）
- `src/actions/task.ts` — Server Actions（getTasks を追記）
- Sonner toast — 既にレイアウトに設定済み
- `src/components/ui/button.tsx` — ボタンコンポーネント

## 検証方法

1. `docker compose up -d` で DB 起動
2. `bun dev` でアプリ起動
3. 初期表示: スケルトン → 空のカンバンボード（3列）が表示される
4. タスク登録ダイアログで各ステータスのタスクを作成（※DOING/DONE は DB 直接更新で確認）
5. 各列に正しいステータスのタスクのみ表示されること
6. createdAt の新しい順に並んでいること
7. カード上に title, dueDate, priority が表示されること
8. DB 停止時にトースト「一覧取得に失敗しました」が5秒間表示されること
9. `bun run check`（Biome lint/format）が通ること
