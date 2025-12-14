# Bluesky 2025年振り返りツール

## 概要

Blueskyの公開APIから指定ユーザーの2025年の投稿を取得し、月ごとの興味関心・活動を分析するためのデータを出力するCLIツール。

## 目的

- 人気投稿（いいね数等）ではなく「何に興味を持っていたか」という個人の振り返りを重視
- 分析結果はMarkdownで出力し、LLM（Claude等）との対話で深掘りできる形式にする

## 技術要件

- Node.js (TypeScript)
- 外部ライブラリは最小限（fetch APIのみ）
- LLMによる分析は行わない（データ取得・整形のみ）

## 出力形式

以下の形式でMarkdownを標準出力に出力：
```
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

## API仕様

- エンドポイント: `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed`
- パラメータ:
  - `actor`: ハンドル or DID
  - `limit`: 最大100
  - `cursor`: ページネーション用

## 使い方
```bash
# ハンドルを引数で指定
npx ts-node src/index.ts <handle>

# 例
npx ts-node src/index.ts someone.bsky.social > output.md

# @付きでもOK
npx ts-node src/index.ts @someone.bsky.social > output.md
```

## エラーハンドリング

- 引数がない場合: 使い方を表示して終了
- ユーザーが見つからない場合: エラーメッセージを表示
- API取得失敗: リトライせずエラーメッセージを表示

## ディレクトリ構成
```
/
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
```

## コーディング規約

- TypeScript strict mode
- エラーハンドリングは簡潔に（console.errorで出力、終了コード1）
- コメントは日本語OK
