# タスク更新機能

## 目的

タスク詳細モーダルの編集フォームで入力した値を「更新」ボタン押下により DB に永続化する。

## 変更点

- `src/schemas/task.ts`: `updateTaskSchema` / `UpdateTaskInput` を追加（title / dueDate / priority / status のバリデーション）
- `src/actions/task.ts`: `updateTask(id, data)` Server Action を追加。`prisma.task.update` で更新後 `revalidatePath("/")` を呼ぶ
- `src/components/task/task-detail-dialog.tsx`: 編集フォームを `TaskEditForm` コンポーネントに分離し、`react-hook-form` + `zodResolver` でバリデーション・送信処理を実装

## 受け入れ条件

- 更新中はインジケーター表示・更新ボタン非活性
- 成功時:「更新完了しました」トースト（5秒）→ モーダルを閉じる → 一覧を再取得
- 失敗時:「更新に失敗しました」トースト（5秒）→ モーダルは閉じない・入力は保持
- バリデーション: 空タイトル / 31文字超 / 過去日付 でエラー表示

## 動作確認手順

1. `bun run dev` で開発サーバー起動
2. タスクカード押下 → 詳細モーダル表示
3. 「編集」ボタン押下 → フォームモードに切替
4. 各フィールドを変更し「更新」押下
5. 成功・失敗・バリデーション各ケースを確認
