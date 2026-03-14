## 目的（何が嬉しい？）
- タスク詳細モーダルの「編集」ボタン押下で、テキストで表示している値がフォームになる

## 画面/操作（ユーザーが何をする？）
- タスク詳細モーダルの「編集」ボタン押下でテキストが入力フォームに変更
- 「キャンセル」ボタン押下で元のテキストに変更
- 「更新」ボタン押下で元のテキストに変更
- 「更新」ボタン押下では保存は行わず、編集モードを終了してテキスト表示に戻る（変更は破棄する）
- 「x」ボタンまたは、「モーダル枠外」で詳細モーダル非表示

## 受け入れ条件（Given/When/Then で 3〜5 本）
### 正常系

#### 編集フォームの表示
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
When 「編集」ボタンを押下する
Then タイトルに「test1」が初期値でテキストフォームに表示していること
And 期限に「2026/06/25」が初期値でカレンダーフォームに表示していること
And 優先度に「高」が初期値でプルダウンフォームに表示していること
And ステータスに「TODO」が初期値でプルダウンフォームに表示していること
And 登録日が「2026/03/12」でテキスト表示していること
And 「キャンセル」ボタンが表示していること
And 「更新」ボタンが表示していること

#### 変更せずに「キャンセル」ボタンの押下
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
And 「編集」ボタンを押下する
When 「キャンセル」ボタンを押下する
Then titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」でテキスト表示すること

#### 値を変更して「キャンセル」ボタンの押下
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
And 「編集」ボタンを押下する
When titleを「test1update」,dueDateを「2026-06-26」,priorityを「LOW」,statusを「DONE」に変更する
And 「キャンセル」ボタンを押下する
Then titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」でテキスト表示すること

#### 「更新」ボタンの押下
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
And 「編集」ボタンを押下する
When 「更新」ボタンを押下する
Then titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」でテキスト表示すること

#### 値を変更して、タスク詳細モーダルを非表示する
Given titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」のタスクデータを用意する
And 一覧画面を開く
And タスクカードを押下する
And 「編集」ボタンを押下する
When titleを「test1update」,dueDateを「2026-06-26」,priorityを「LOW」,statusを「DONE」に変更する
And 「x」ボタンまたは、「モーダル枠外」を押下する
And 再度、同じタスクカードを押下する
Then titleが「test1」,dueDateが「2026-06-25」,priorityが「HIGH」,statusが「TODO」,createdAtが「2026-03-12」でテキスト表示すること

## データ（更新されるテーブル/モデル、整合性ルール）
- tasks(参照)
