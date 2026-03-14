# 実装計画: 009-d&d-task（カンバンD&Dによるステータス更新）

## Context

カンバンボード上でタスクカードをドラッグ&ドロップして status を変更する機能を実装する。スペック `spec/009-d&d-task.md` に基づく。楽観更新で即時 UI 反映し、失敗時はエラーモーダル → 画面再読み込みで復旧する。

現状、KanbanBoard / KanbanColumn は Server Component、TaskCard は Client Component。D&D はクライアント側の状態管理が必須なため、サーバーでフェッチしたタスクをクライアントコンポーネントに渡す構成に変更する。

## 依存追加（承認必要）

- `@dnd-kit/core` — React 向け D&D ライブラリ。HTML5 Drag and Drop API のラッパーで、アクセシビリティ・タッチ対応・ドラッグ中のビジュアルフィードバックを提供する。同一列内ソートは不要なため `@dnd-kit/sortable` は不要。

## 変更対象ファイル

| # | ファイル | 変更種別 | 概要 |
|---|---------|---------|------|
| 1 | `src/app/api/tasks/[id]/status/route.ts` | 新規 | PATCH Route Handler |
| 2 | `src/components/task/kanban-board.tsx` | 修正 | Client Component にタスクを渡す構成に変更 |
| 3 | `src/components/task/kanban-board-client.tsx` | 新規 | DndContext・楽観更新・エラーモーダルを管理 |
| 4 | `src/components/task/droppable-column.tsx` | 新規 | useDroppable を使ったドロップ領域 |
| 5 | `src/components/task/draggable-task-card.tsx` | 新規 | useDraggable を使ったドラッグ可能カード |
| 6 | `src/components/task/kanban-column.tsx` | 修正 | DroppableColumn に置き換えるため不要な部分を整理 |

## 実装ステップ

### Step 1: 依存追加

```bash
bun add @dnd-kit/core
```

### Step 2: Route Handler 追加 (`src/app/api/tasks/[id]/status/route.ts`)

スペックで `PATCH /api/tasks/{id}/status` が定義されているため Route Handler で実装する。CLAUDE.md の「例外: 外部公開 API や特殊要件がある場合は Route Handler を使用」に該当（D&D の楽観更新では fetch で直接呼ぶ必要があるため）。

```ts
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["TODO", "DOING", "DONE"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { status } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    return new NextResponse(null, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
```

**ポイント:**
- `revalidatePath` は呼ばない。楽観更新で UI は既に反映済みで、次回画面遷移やリロード時に最新データが取得される
- レスポンスボディは不要（スペック: `response: 200`）

### Step 3: KanbanBoard の変更 (`src/components/task/kanban-board.tsx`)

Server Component のまま維持。フェッチしたタスク一覧を新しい Client Component に渡す。

```tsx
import { getTasks } from "@/actions/task";
import type { SortField, SortOrder } from "@/schemas/task";
import { SearchTitleForm } from "./search-title-form";
import { SortControl } from "./sort-control";
import { KanbanBoardClient } from "./kanban-board-client";

type Props = {
  sortField: SortField;
  sortOrder: SortOrder;
  searchTitle?: string;
};

export async function KanbanBoard({ sortField, sortOrder, searchTitle }: Props) {
  const result = await getTasks(sortField, sortOrder, searchTitle);

  if (!result.success) {
    throw new Error("一覧取得に失敗しました");
  }

  return (
    <div>
      <SearchTitleForm
        sortField={sortField}
        sortOrder={sortOrder}
        searchTitle={searchTitle}
      />
      <SortControl sortField={sortField} sortOrder={sortOrder} />
      <KanbanBoardClient tasks={result.data} />
    </div>
  );
}
```

### Step 4: DroppableColumn 追加 (`src/components/task/droppable-column.tsx`)

`@dnd-kit/core` の `useDroppable` を使い、各列をドロップ可能領域にする。

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

type Props = {
  id: string; // "TODO" | "DOING" | "DONE"
  title: string;
  children: ReactNode;
};

export function DroppableColumn({ id, title, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col gap-3 rounded-lg p-4 transition-colors ${
        isOver ? "bg-blue-50 ring-2 ring-blue-300" : "bg-gray-50"
      }`}
    >
      <h2 className="text-sm font-semibold text-gray-600">{title}</h2>
      {children}
    </div>
  );
}
```

**ポイント:**
- `isOver` でドラッグ中のビジュアルフィードバック（背景色変化）を提供

### Step 5: DraggableTaskCard 追加 (`src/components/task/draggable-task-card.tsx`)

`useDraggable` でタスクカードをドラッグ可能にする。更新処理中（`isUpdating`）の場合はドラッグを無効化する。

```tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@prisma/client";
import { TaskCard } from "./task-card";

type Props = {
  task: Task;
  isUpdating: boolean;
};

export function DraggableTaskCard({ task, isUpdating }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
      disabled: isUpdating,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isUpdating ? "not-allowed" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} />
    </div>
  );
}
```

**ポイント:**
- `disabled: isUpdating` で更新処理中のドラッグを防止（スペック: 多重更新防止）
- `isDragging` で半透明表示によるドラッグ中のフィードバック
- `@dnd-kit/utilities` は `@dnd-kit/core` の peer dependency なので追加不要。ただし `CSS.Transform` を使わず直接 `transform` を組み立てるため、`@dnd-kit/utilities` のインストールは不要

### Step 6: KanbanBoardClient 追加 (`src/components/task/kanban-board-client.tsx`)

D&D の中核コンポーネント。DndContext、楽観更新のステート管理、エラーモーダルを担う。

```tsx
"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Status, Task } from "@prisma/client";
import { DroppableColumn } from "./droppable-column";
import { DraggableTaskCard } from "./draggable-task-card";
import { TaskCard } from "./task-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COLUMNS: { id: Status; title: string }[] = [
  { id: "TODO", title: "TODO" },
  { id: "DOING", title: "DOING" },
  { id: "DONE", title: "DONE" },
];

type Props = {
  tasks: Task[];
};

export function KanbanBoardClient({ tasks: initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = useCallback(
    (event: { active: { data: { current?: { task: Task } } } }) => {
      const task = event.active.data.current?.task ?? null;
      setActiveTask(task);
    },
    [],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as number;
      const newStatus = over.id as Status;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // 同一列へのドロップ → 何もしない
      if (task.status === newStatus) return;

      // 楽観更新: UI を即時反映
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );
      setUpdatingTaskId(taskId);

      try {
        const res = await fetch(`/api/tasks/${taskId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          setShowErrorModal(true);
        }
      } catch {
        setShowErrorModal(true);
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [tasks],
  );

  const handleErrorModalOk = () => {
    window.location.reload();
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4">
          {COLUMNS.map((col) => (
            <DroppableColumn key={col.id} id={col.id} title={col.title}>
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                    isUpdating={updatingTaskId === task.id}
                  />
                ))}
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {/* エラーモーダル */}
      <Dialog
        open={showErrorModal}
        onOpenChange={() => {}} // 閉じない
        dismissible={false}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>エラー</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            更新に失敗しました。最新の状態を取得するため、一覧を再読み込みします。
          </p>
          <div className="flex justify-end pt-2">
            <Button onClick={handleErrorModalOk}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**ポイント:**
- `PointerSensor` + `activationConstraint: { distance: 8 }` でクリック（タスク詳細ダイアログ表示）とドラッグを区別。8px 以上動かさないとドラッグ開始しない
- `DragOverlay` でドラッグ中にカードの複製を表示（元の位置は半透明）
- `updatingTaskId` で更新中のタスクを追跡し、そのカードのドラッグを無効化
- エラーモーダルは `dismissible={false}` + `showCloseButton={false}` で枠外クリック・閉じるボタンを無効化
- `onOpenChange={() => {}}` で ESC キーなどでの閉じを防止

### Step 7: KanbanColumn の整理 (`src/components/task/kanban-column.tsx`)

`KanbanBoardClient` が `DroppableColumn` を直接使うため、`KanbanColumn` は使用箇所がなくなる。ただし、`KanbanBoardSkeleton` や `KanbanBoardErrorBoundary` で使われている可能性があるため確認の上、不要であれば削除する。使われている場合はそのまま残す。

## DB スキーマ変更

なし。既存の `tasks.status` と `tasks.updatedAt` を使用する。

## 検証方法

1. `bun run dev` でアプリ起動
2. タスクカードをドラッグして別列にドロップ → 即時に移動すること
3. 同一列内にドロップ → 何も起きないこと
4. 更新処理中にドラッグ → ドラッグできないこと（cursor: not-allowed）
5. API を失敗させた場合 → エラーモーダルが表示されること
6. エラーモーダルの枠外クリック → モーダルが閉じないこと
7. エラーモーダルの「OK」押下 → 画面が再読み込みされること
8. `bun run check` で lint エラーがないこと

## 注意点

- `@dnd-kit/core` の追加は依存追加のため承認必要
- `TaskCard` は `TaskDetailDialog` を内包しているため、ドラッグ開始とクリック（ダイアログ表示）の競合に注意。`PointerSensor` の `activationConstraint: { distance: 8 }` で解決する想定だが、動作確認が必要
- Base UI の `Dialog` で `dismissible` prop が期待通り動作するか確認が必要（008 の計画でも同様の注意点あり）。動作しない場合は `onOpenChange` のコールバックで制御する
- `@dnd-kit/utilities` は不要（`CSS.Transform.toString` を使わず直接スタイルを組み立てるため）
