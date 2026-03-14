# 実装計画: spec/007-update-task.md（タスク更新機能）

## Context

spec/006-edit-task で編集フォームの UI は既に実装済み。しかし「更新」ボタンは `setIsEditing(false)` するだけで、実際の DB 更新は行われない。本タスクでは、編集フォームの値を Server Action 経由で DB に永続化し、成功/失敗時の UX（トースト、インジケーター、モーダル制御）を実装する。

---

## 変更ファイル一覧

| ファイル | 操作 | 概要 |
|---|---|---|
| `src/schemas/task.ts` | 修正 | `updateTaskSchema` / `UpdateTaskInput` 追加 |
| `src/actions/task.ts` | 修正 | `updateTask` Server Action 追加 |
| `src/components/task/task-detail-dialog.tsx` | 修正 | 編集フォームにバリデーション・送信処理を追加 |
| `docs/changes/20260314-update-task.md` | 新規作成 | 作業ログ |

---

## 実装詳細

### 1. `src/schemas/task.ts` に `updateTaskSchema` を追加

`createTaskSchema` に `status` フィールドを加えたスキーマを定義する。

```ts
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "タスク名を入力してください。")
    .max(30, "タスク名は30文字以内で入力してください。"),
  dueDate: z
    .string()
    .min(1, "期限を入力してください。")
    .refine(isDateTodayOrLater, "期限は今日以降の日付を入力してください。"),
  priority: z.enum(["HIGH", "MIDDLE", "LOW"], "優先順位を入力してください。"),
  status: z.enum(["TODO", "DOING", "DONE"], "ステータスを入力してください。"),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

---

### 2. `src/actions/task.ts` に `updateTask` を追加

`createTask` と同じパターンで実装する。

```ts
export async function updateTask(id: number, data: unknown) {
  const parsed = updateTaskSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "入力内容が正しくありません。" } as const;
  }

  const { title, dueDate, priority, status } = parsed.data;

  try {
    await prisma.task.update({
      where: { id },
      data: {
        title,
        dueDate: new Date(dueDate),
        priority: priority as Priority,
        status: status as Status,
      },
    });
    revalidatePath("/");
    return { success: true } as const;
  } catch {
    return { success: false, error: "更新に失敗しました" } as const;
  }
}
```

---

### 3. `src/components/task/task-detail-dialog.tsx` を改修

現状の編集フォームは `defaultValue` を使った非制御コンポーネント。`react-hook-form` + `zodResolver` で制御コンポーネントに書き換える。

**インラインで `TaskEditForm` コンポーネントを定義:**

- Props: `task: Task`, `onSuccess: () => void`, `onCancel: () => void`
- `useForm<UpdateTaskInput>` で初期化
  - `defaultValues`: task の現在値（`dueDate` は `toDateInputValue(task.dueDate)`）
  - `resolver`: `zodResolver(updateTaskSchema)`
  - `mode`: `"onBlur"`（create-task-form と同じ）
- `title`: `register("title")`（+ エラー表示）
- `dueDate`: `register("dueDate")`（native `<input type="date">`、+ エラー表示）
- `priority`: `Controller` で `Select` をラップ（+ エラー表示）
- `status`: `Controller` で `Select` をラップ（+ エラー表示）

**送信処理:**

- `onSubmit` で `updateTask(task.id, data)` を呼ぶ
- 送信中: `isSubmitting` で「更新」ボタンを `disabled` にし `Loader2` アイコン表示
- 成功時: `toast.success("更新完了しました", { duration: 5000 })` → `onSuccess()` コールバック
- 失敗時: `toast.error("更新に失敗しました", { duration: 5000 })` → モーダルは閉じない・入力は保持

**`TaskDetailDialog` 側の変更:**

- `isEditing = true` のとき `<TaskEditForm>` を描画
- `onSuccess`: `setIsEditing(false)` → `setOpen(false)` → `setTask(null)`
- `onCancel`: `setIsEditing(false)`

---

## 再利用するコンポーネント・パターン

| 用途 | 参照先 |
|---|---|
| `useForm` + `zodResolver` パターン | `src/components/task/create-task-form.tsx` |
| `Controller` で `Select` をラップ | `src/components/task/create-task-form.tsx` |
| `Loader2` アイコン + `isSubmitting` | `src/components/task/create-task-form.tsx` |
| `toast.success` / `toast.error` | `src/components/task/create-task-form.tsx` |
| `toDateInputValue()` | `src/components/task/task-detail-dialog.tsx`（既存） |
| `updateTaskSchema` / `UpdateTaskInput` | `src/schemas/task.ts`（本タスクで追加） |

---

## 変更しないもの

- Prisma スキーマ（DB 変更なし）
- 他コンポーネント

---

## 受け入れ条件の確認方法

1. `bun run dev` で開発サーバー起動
2. タスクカード押下 → 詳細モーダル表示
3. 「編集」ボタン押下 → フォームモードに切替
4. 各フィールドを変更し「更新」押下
5. 確認項目:
   - 更新中にローディングインジケーター表示・更新ボタンが非活性
   - 成功時:「更新完了しました」トースト → 5秒後に消える → モーダルが閉じる
   - 成功時: カンバンボードが再取得される（`revalidatePath`）
   - 失敗時:「更新に失敗しました」トースト → 5秒後に消える → モーダルは閉じない・入力は保持
   - バリデーション: 空タイトル、31文字以上、過去日付 → エラー表示
6. `bunx biome check src/` でリント確認
