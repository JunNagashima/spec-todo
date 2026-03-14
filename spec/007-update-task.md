## 目的（何が嬉しい？）
- タスク詳細モーダルで、フォームで値を変更し更新ボタン押下で値が更新される

## 画面/操作（ユーザーが何をする？）
- タスク詳細モーダルの入力フォームに入力した値を「更新」ボタン押下で更新できる

## 入力（項目・型・必須・制約）

- タスク名
  - string
  - 必須
  - 30 文字以内
- 期限
  - date
  - 必須
  - 今日以降の日付
- 優先順位
  - HIGH | MIDDLE | LOW
  - 必須
- ステータス
  - TODO | DOING | DONE
  - 必須

## 受け入れ条件（Given/When/Then で 3〜5 本）
### 正常系

#### タスク更新成功
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
And 「編集」ボタンを押下する
When titleを「test1update」,dueDateを「2026-06-26」,priorityを「LOW」,statusを「DONE」に変更する
And 「更新」ボタンを押下する
Then インジケーターが表示する
And 更新処理中は更新ボタン非活性（再押下不可）
And 更新API を実行する
And API が 200 を返す
And インジケーターが非表示になる
And 「更新完了しました」のトーストが表示される
And トースト表示 5 秒後に非表示になる
And タスク詳細モーダルが閉じる
And タスク一覧を取得し直す

### 異常系

#### タスク更新失敗
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
And 「編集」ボタンを押下する
When titleを「test1update」,dueDateを「2026-06-26」,priorityを「LOW」,statusを「DONE」に変更する
And 「更新」ボタンを押下する
Then インジケーターが表示する
And 更新処理中は更新ボタン非活性（再押下不可）
And 更新API を実行する
And API が 200 などの成功以外のステータスコードを返す
And インジケーターが非表示になる
And 「更新に失敗しました」のトーストが表示される
And 詳細モーダルは閉じない
And 入力は保持される
And トースト表示 5 秒後に非表示になる

## データ（更新されるテーブル/モデル、整合性ルール）
- tasks(参照)
