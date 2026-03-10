# CLAUDE.md (プロジェクトメモリ)

## 目的

このリポジトリは「少しリッチな TODO アプリ」を、スペック駆動開発（SDD）で開発する。

## 技術スタック

- Next.js 16 App Router
- Tailwind CSS
- shadcn/ui
- 実行環境: Bun
- リント/フォーマット: Biome
- Docker で postgresql + prisma

## 設計方針

- Server Components を優先
- API 呼び出しは Server Actions を基本とする
  - 例外: 外部公開 API や特殊要件がある場合は Route Handler を使用（その場合は理由を docs に残す）

## スコープ

### MVP でやる（例）

- タスク CRUD
- ステータス切替（TODO/DOING/DONE）
- 期限（date or datetime はスペックで明記）
- 優先度（LOW/MID/HIGH）
- 検索（部分一致など仕様で明記）
- フィルタ/ソート

### MVP でやらない

- 認証/ユーザー管理
- 共有
- 通知/リマインド

## 承認ゲート（承認が必要なタイミング）

- 1 枚スペック #N が確定するまで実装に入らない
- 「実装計画 → 実装」へ進む前に承認を取る
- DB スキーマ変更 / 依存追加 / 大きなリファクタ は承認必須

## 作業ログ（docs）

- 実装完了後、`docs/changes/YYYYMMDD-<feature>.md` を追加
- 記載内容：目的 / 変更点 / 受け入れ条件 / 動作確認手順

