// Bluesky 2025年振り返りツール

interface FeedPost {
  post: {
    uri: string;
    record: {
      text: string;
      createdAt: string;
      reply?: unknown;
    };
  };
  reason?: unknown;
}

interface FeedResponse {
  feed: FeedPost[];
  cursor?: string;
}

interface MonthlyPosts {
  [month: string]: {
    date: string;
    text: string;
  }[];
}

// コマンドライン引数を取得
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('使い方: npx ts-node src/index.ts <handle>');
  console.error('例: npx ts-node src/index.ts someone.bsky.social');
  process.exit(1);
}

let handle = args[0];
// @を除去
if (handle.startsWith('@')) {
  handle = handle.slice(1);
}

// 2025年の投稿のみをフィルタリング
function is2025Post(createdAt: string): boolean {
  return createdAt.startsWith('2025-');
}

// 月を取得 (例: "2025-01-15" -> "1月")
function getMonth(createdAt: string): string {
  const match = createdAt.match(/^2025-(\d{2})-/);
  if (!match) return '';
  const monthNum = parseInt(match[1], 10);
  return `${monthNum}月`;
}

// 月別に投稿をグルーピング
function groupByMonth(posts: { date: string; text: string }[]): MonthlyPosts {
  const grouped: MonthlyPosts = {};

  for (const post of posts) {
    const month = getMonth(post.date);
    if (!month) continue;

    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(post);
  }

  return grouped;
}

// Bluesky APIから投稿を取得
async function fetchAuthorFeed(actor: string, cursor?: string): Promise<FeedResponse> {
  const params = new URLSearchParams({
    actor,
    limit: '100',
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<FeedResponse>;
}

// 全ての2025年投稿を取得
async function fetchAll2025Posts(handle: string): Promise<{ date: string; text: string }[]> {
  const allPosts: { date: string; text: string }[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    try {
      const data = await fetchAuthorFeed(handle, cursor);

      for (const item of data.feed) {
        // リポストを除外
        if (item.reason) continue;

        // リプライを除外
        if (item.post.record.reply) continue;

        const createdAt = item.post.record.createdAt;

        // 2025年の投稿のみ
        if (is2025Post(createdAt)) {
          allPosts.push({
            date: createdAt.split('T')[0], // YYYY-MM-DD部分のみ
            text: item.post.record.text,
          });
        } else if (createdAt < '2025-01-01') {
          // 2025年より前の投稿に到達したら終了
          hasMore = false;
          break;
        }
      }

      // 次のページがあるか確認
      if (data.cursor && hasMore) {
        cursor = data.cursor;
      } else {
        hasMore = false;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`エラー: ${error.message}`);
      } else {
        console.error('不明なエラーが発生しました');
      }
      process.exit(1);
    }
  }

  return allPosts;
}

// Markdown出力
function outputMarkdown(handle: string, posts: { date: string; text: string }[]): void {
  console.log(`# @${handle} の2025年振り返りデータ\n`);

  // 統計
  console.log('## 統計');
  console.log(`- 総投稿数: ${posts.length}件`);

  // 月別投稿数
  const grouped = groupByMonth(posts);
  const monthKeys = Object.keys(grouped).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    return aNum - bNum;
  });

  const monthStats = monthKeys.map(month => `${month}: ${grouped[month].length}件`).join(', ');
  console.log(`- 月別投稿数: ${monthStats}\n`);

  // 月別投稿一覧
  console.log('## 月別投稿一覧\n');

  for (const month of monthKeys) {
    const monthPosts = grouped[month];
    console.log(`### ${month} (${monthPosts.length}件)`);

    // 日付順にソート（新しい順）
    monthPosts.sort((a, b) => b.date.localeCompare(a.date));

    for (const post of monthPosts) {
      console.log(`- ${post.date}: ${post.text}`);
    }
    console.log('');
  }
}

// メイン処理
async function main() {
  const posts = await fetchAll2025Posts(handle);
  outputMarkdown(handle, posts);
}

main();
