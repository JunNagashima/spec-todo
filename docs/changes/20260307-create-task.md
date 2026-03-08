# タスク作成機能 (spec/001-create-task.md)

## 目的

TODO アプリの初期実装。タスク作成モーダルから、タスク名・期限・優先順位を入力して DB に登録できる。

## 変更点

### インフラ / 設定

- Next.js 16 App Router プロジェクトを Bun で初期化
- Biome をリント/フォーマッターとして設定
- Docker Compose で PostgreSQL 16 を起動 (ポート 5432, TZ=Asia/Tokyo)
- Prisma v6 + PostgreSQL でスキーマ管理

### DB スキーマ

- `tasks` テーブルを新規作成
  - `Priority` enum: `HIGH`, `MIDDLE`, `LOW`
  - `Status` enum: `TODO`, `DOING`, `DONE`
  - `dueDate`: `@db.Date` (PostgreSQL date 型)
  - `createdAt` / `updatedAt`: `@db.Timestamptz`

### 追加ファイル

| ファイル | 内容 |
|---|---|
| `docker-compose.yml` | PostgreSQL 16 コンテナ定義 |
| `prisma/schema.prisma` | Task モデル定義 |
| `src/lib/prisma.ts` | Prisma Client シングルトン |
| `src/lib/date.ts` | JST 日付ユーティリティ (`getTodayJST`, `isDateTodayOrLater`) |
| `src/schemas/task.ts` | Zod バリデーションスキーマ (client/server 共有) |
| `src/actions/task.ts` | Server Action `createTask` |
| `src/components/task/create-task-dialog.tsx` | モーダル開閉制御 |
| `src/components/task/create-task-form.tsx` | フォーム + バリデーション |

### 修正ファイル

- `src/app/layout.tsx`: `<Toaster duration={5000} />` 追加、lang を `ja` に変更
- `src/app/page.tsx`: `<CreateTaskDialog />` を配置

## 受け入れ条件

- [x] 「タスクを登録する」ボタン押下でモーダルが開く
- [x] x ボタン / 枠外クリックでモーダルが閉じる
- [x] 登録処理中はスピナー + ボタン非活性
- [x] 登録成功時: モーダル閉じ + 「登録完了しました」トースト (5 秒)
- [x] タスク名未入力でフォーカスアウト → エラーメッセージ + 登録ボタン非活性
- [x] 期限未入力でフォーカスアウト → エラーメッセージ + 登録ボタン非活性
- [x] 優先順位未選択でフォーカスアウト → エラーメッセージ + 登録ボタン非活性
- [x] 登録失敗時: 「登録に失敗しました」トースト (5 秒)、モーダルは閉じない

## 動作確認手順

```bash
# 1. DB 起動
docker compose up -d

# 2. スキーマ適用
bunx --bun prisma db push

# 3. dev server 起動
./node_modules/.bin/next dev

# 4. ブラウザで http://localhost:3000 を開く
# 5. 「タスクを登録する」ボタンを押してモーダルを確認
# 6. 各フィールドを入力して登録
# 7. bunx --bun prisma studio でレコードを確認
```

## 技術的注意点

- **JST 日付**: `Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" })` でサーバー TZ に非依存
- **Select + onBlur**: Base UI の `SelectTrigger` に `onBlur` を渡して対応
- **shadcn/ui Dialog**: Base UI v1 ベース。`asChild` の代わりに `render` prop を使用
- **Zod v4**: `z.enum()` の `required_error` は廃止。第2引数に文字列で指定
- **Prisma v6**: Node.js v20.19+ 不要。v7 との互換性に注意
