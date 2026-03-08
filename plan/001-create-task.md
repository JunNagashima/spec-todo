# 実装計画: spec/001-create-task.md (タスク作成機能)

## Context

グリーンフィールドの TODO アプリにおける最初の機能実装。プロジェクト初期セットアップ（Next.js 16, Prisma, Docker 等）から、タスク作成モーダル・バリデーション・Server Action による DB 登録までを一括で構築する。

---

## ディレクトリ構成 (新規作成分)

```
spec-todo/
├── docker-compose.yml
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Toaster 追加
│   │   └── page.tsx            # タスク作成ボタン配置
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 生成
│   │   └── task/
│   │       ├── create-task-dialog.tsx  # モーダル開閉制御 ("use client")
│   │       └── create-task-form.tsx    # フォーム + バリデーション ("use client")
│   ├── lib/
│   │   ├── prisma.ts           # Prisma Client シングルトン
│   │   └── date.ts             # JST 日付ユーティリティ
│   ├── schemas/
│   │   └── task.ts             # Zod スキーマ (client/server 共有)
│   └── actions/
│       └── task.ts             # Server Action (createTask)
```

---

## 実装ステップ

### Step 1: プロジェクト初期セットアップ

```bash
bunx create-next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*" --use-bun
bun add -d @biomejs/biome && bunx biome init
bunx shadcn@latest init
bunx shadcn@latest add dialog button input select sonner
bun add react-hook-form zod @hookform/resolvers
bun add -d prisma && bun add @prisma/client && bunx prisma init
bun add date-fns date-fns-tz
```

- ESLint/Prettier は削除し Biome に統一

### Step 2: Docker + Prisma スキーマ

**`docker-compose.yml`** - PostgreSQL 16, TZ=Asia/Tokyo, ポート 5432

**`prisma/schema.prisma`** - tasks テーブル定義:
- `Priority` enum: `HIGH`, `MIDDLE`, `LOW`
- `Status` enum: `TODO`, `DOING`, `DONE`
- `dueDate`: `DateTime @db.Date` (PostgreSQL date 型)
- `createdAt`: `DateTime @default(now()) @db.Timestamptz`
- `updatedAt`: `DateTime @updatedAt @db.Timestamptz`
- テーブル名: `@@map("tasks")`

**`src/lib/prisma.ts`** - Prisma Client シングルトン (開発時ホットリロード対策)

確認: `docker compose up -d` → `bunx prisma db push` → `bunx prisma studio`

### Step 3: 共有バリデーション

**`src/lib/date.ts`**
- `getTodayJST()`: JST の今日を `YYYY-MM-DD` で返す (`Intl.DateTimeFormat` or `date-fns-tz`)
- `isDateTodayOrLater(dateStr)`: JST 今日以降判定

**`src/schemas/task.ts`** - Zod スキーマ:
- `title`: `z.string().min(1, "タスク名を入力してください。").max(30, ...)`
- `dueDate`: `z.string().min(1, "期限を入力してください。").refine(isDateTodayOrLater, ...)`
- `priority`: `z.enum(["HIGH", "MIDDLE", "LOW"], { required_error: "優先順位を入力してください。" })`

### Step 4: Server Action

**`src/actions/task.ts`**
- `"use server"` ディレクティブ
- Zod でサーバー側再バリデーション
- `prisma.task.create()` で DB 挿入 (status は `"TODO"` 固定)
- 戻り値: `{ success: true } | { success: false; error: string }`
- 成功時 `revalidatePath("/")` で再検証
- DB エラー時は `{ success: false, error: "登録に失敗しました" }` を返す

### Step 5: UI 層

**`src/app/layout.tsx`** - `<Toaster duration={5000} />` を配置

**`src/app/page.tsx`** - Server Component。`<CreateTaskDialog />` を配置

**`src/components/task/create-task-dialog.tsx`** ("use client")
- shadcn `Dialog` で `open` state 管理
- `DialogTrigger` に「タスクを登録する」ボタン
- x ボタン・枠外クリックで閉じる (shadcn Dialog デフォルト動作)
- フォーム送信成功時に `setOpen(false)`

**`src/components/task/create-task-form.tsx`** ("use client")
- `useForm` + `zodResolver(createTaskSchema)` + `mode: "onBlur"`
- タスク名: `<Input type="text" />`
- 期限: `<Input type="date" />` (min 属性で今日以降も HTML レベルで制約)
- 優先順位: `<Select>` を `Controller` でラップ (`onBlur` を `SelectTrigger` に渡す)
- 登録ボタン: デフォルト非活性。全項目が有効 (`isValid`) になるまで `disabled`。`isSubmitting` 中もスピナー + `disabled`
- 成功時: `toast.success("登録完了しました")` + `onSuccess` コールバック
- 失敗時: `toast.error("登録に失敗しました")`、モーダルは閉じない

### Step 6: ドキュメント

**`docs/changes/20260307-create-task.md`** - 作業ログ (CLAUDE.md の規約通り)

---

## 実装上の注意点

1. **JST 日付**: サーバー TZ に依存せず `Asia/Tokyo` で「今日」を算出すること
2. **Select + onBlur**: Radix ベースの Select は `SelectTrigger` に `onBlur` を渡して対応
3. **トースト 5 秒**: sonner のデフォルトは 4 秒なので `duration={5000}` を明示設定
4. **dueDate 保存**: `"YYYY-MM-DD"` → `new Date("YYYY-MM-DD")` で Prisma に渡す (PostgreSQL date 型は TZ 情報なし)

---

## 検証方法

### 正常系
| 操作 | 期待結果 |
|------|---------|
| 「タスクを登録する」ボタン押下 | モーダルが開く |
| x ボタン / 枠外クリック | モーダルが閉じる |
| タスク名「勉強する」、期限「2026-03-31」、優先順位「HIGH」で登録 | スピナー表示 → ボタン非活性 → モーダル閉じ → 「登録完了しました」トースト → 5 秒後消滅 |
| Prisma Studio で確認 | レコードが正しく保存されている |

### 異常系 (バリデーション)
| 操作 | 期待結果 |
|------|---------|
| タスク名を空のままフォーカスアウト | 「タスク名を入力してください。」表示、登録ボタン非活性 |
| 期限を空のままフォーカスアウト | 「期限を入力してください。」表示、登録ボタン非活性 |
| 優先順位を未選択のままフォーカスアウト | 「優先順位を入力してください。」表示、登録ボタン非活性 |

### 異常系 (API 失敗)
| 操作 | 期待結果 |
|------|---------|
| PostgreSQL 停止状態で登録 | 「登録に失敗しました」トースト → 5 秒後消滅、モーダルは閉じない |
