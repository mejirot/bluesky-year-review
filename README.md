# Bluesky 2025年振り返りツール

Blueskyの公開APIから指定ユーザーの2025年の投稿を取得し、月ごとの興味関心・活動を分析するためのデータを出力するCLIツール。

## 特徴

- 人気投稿（いいね数等）ではなく「何に興味を持っていたか」という個人の振り返りを重視
- 分析結果はMarkdownで出力し、LLM（Claude等）との対話で深掘りできる形式
- Bluesky公開APIを使用（認証不要）
- 外部ライブラリは最小限（fetch APIのみ使用）

## 必要要件

- Node.js (v20以上推奨)
- TypeScript

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/mejirot/bluesky-year-review.git
cd bluesky-year-review

# 依存関係のインストール
npm install
```

## 使い方

```bash
# ハンドルを引数で指定
npx ts-node src/index.ts <handle>

# 例
npx ts-node src/index.ts someone.bsky.social > output.md

# @付きでもOK
npx ts-node src/index.ts @someone.bsky.social > output.md
```

## 出力形式

以下の形式でMarkdownが標準出力に出力されます：

```markdown
# @username の2025年振り返りデータ

## 統計
- 総投稿数: X件
- 月別投稿数: 1月: X件, 2月: X件, ...

## 月別投稿一覧

### 1月 (X件)
- 2025-01-15: 投稿内容...
- 2025-01-10: 投稿内容...

### 2月 (X件)
...
```

## 機能

1. コマンドライン引数でBlueskyハンドルを受け取る
2. Bluesky公開API (`public.api.bsky.app`) から投稿を取得
3. 2025年の投稿のみをフィルタリング
4. リポスト（reason付き）は除外し、自分の投稿のみ抽出
5. リプライも除外（record.replyが存在するもの）
6. 月ごとにグルーピングして出力
7. ページネーション対応（cursor使用）で全件取得

## エラーハンドリング

- 引数がない場合: 使い方を表示して終了
- ユーザーが見つからない場合: エラーメッセージを表示
- API取得失敗: リトライせずエラーメッセージを表示

## プロジェクト構成

```
/
├── CLAUDE.md          # プロジェクト仕様（開発者向け）
├── README.md          # このファイル
├── package.json
├── tsconfig.json
└── src/
    └── index.ts       # メインプログラム
```

## ライセンス

MIT

## 技術仕様

詳細な技術仕様や開発ガイドラインについては [CLAUDE.md](./CLAUDE.md) を参照してください。
