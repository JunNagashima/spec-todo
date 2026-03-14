# 実装計画: 008-delete-task-dialog（タスク削除確認ダイアログ）

## Context

タスク詳細モーダルに「削除」ボタンを追加し、押下時に確認ダイアログを表示する機能を実装する。スペック `spec/008-delete-task-dialog.md` に基づく。現時点では削除の Server Action も UI も存在しない。

## 変更対象ファイル

1. `src/actions/task.ts` — `deleteTask` Server Action 追加
2. `src/components/task/task-detail-dialog.tsx` — 削除ボタン・確認ダイアログ追加

## 実装ステップ

### Step 1: Server Action 追加 (`src/actions/task.ts`)

`deleteTask(id: number)` を追加。既存の `updateTask` パターンに倣う。

```ts
export async function deleteTask(id: number) {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/");
    return { success: true } as const;
  } catch {
    return { success: false, error: "削除に失敗しました" } as const;
  }
}
```

### Step 2: タスク詳細モーダルの変更 (`src/components/task/task-detail-dialog.tsx`)

#### 2-1. 状態追加

- `isConfirmingDelete` (boolean) — 確認ダイアログの表示制御
- `isDeleting` (boolean) — 削除処理中のローディング制御

#### 2-2. 削除ボタン追加

詳細表示（閲覧モード）のフッター部分に「削除」ボタンを追加。「編集」ボタンの横に配置。

```tsx
<div className="flex justify-end gap-2 pt-2">
  <Button variant="destructive" onClick={() => setIsConfirmingDelete(true)}>
    削除
  </Button>
  <Button variant="outline" onClick={() => setIsEditing(true)}>
    編集
  </Button>
</div>
```

#### 2-3. 確認ダイアログ追加

Base UI の `Dialog` を入れ子で使用。スペック要件:
- 枠外クリックで閉じない → `dismissible={false}` を Dialog Root に指定
- 閉じるボタンなし → `showCloseButton={false}` を DialogContent に指定
- 背面操作不可 → Dialog の Backdrop で実現（デフォルト動作）

```tsx
<Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete} dismissible={false}>
  <DialogContent showCloseButton={false}>
    <DialogHeader>
      <DialogTitle>タスクの削除</DialogTitle>
    </DialogHeader>
    <p className="text-sm">このタスクを削除しますか？この操作は元に戻せません。</p>
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" onClick={() => setIsConfirmingDelete(false)} disabled={isDeleting}>
        キャンセル
      </Button>
      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        削除する
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

#### 2-4. 削除ハンドラ

```ts
const handleDelete = async () => {
  setIsDeleting(true);
  const result = await deleteTask(taskId);
  setIsDeleting(false);
  if (result.success) {
    toast.success("削除しました", { duration: 5000 });
    setIsConfirmingDelete(false);
    setOpen(false);
    setTask(null);
  } else {
    toast.error("削除に失敗しました", { duration: 5000 });
  }
};
```

#### 2-5. handleOpenChange の調整

確認ダイアログ表示中に親ダイアログが閉じないよう制御。`isConfirmingDelete` が true のときは `handleOpenChange` で閉じを防止する。

```ts
const handleOpenChange = (value: boolean) => {
  if (isConfirmingDelete) return; // 確認ダイアログ表示中は親を閉じない
  setOpen(value);
  if (!value) {
    setTask(null);
    setIsEditing(false);
  }
};
```

#### 2-6. import 追加

`deleteTask` を `@/actions/task` から追加で import。

## 検証方法

1. `bun run dev` でアプリ起動
2. タスクカード押下 → 詳細モーダルに「削除」ボタンが表示されること
3. 「削除」ボタン押下 → 確認ダイアログが表示されること
4. 確認ダイアログの枠外クリック → ダイアログが閉じないこと
5. 「キャンセル」押下 → 確認ダイアログが閉じ、詳細モーダルが残ること
6. 「削除する」押下 → タスクが削除され、一覧から消えること
7. `bun run check` で lint エラーがないこと

## 注意点

- Base UI の `Dialog` の `dismissible` prop が期待通り動作するか確認が必要。もし `dismissible` prop が存在しない場合は、`onOpenChange` のコールバック内で制御する（`setIsConfirmingDelete` を呼ばない）
- DB スキーマ変更なし、依存追加なし
