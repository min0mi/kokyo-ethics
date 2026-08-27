# 公共倫理パーフェクトマスター.com

大学入学共通テスト「公共、倫理」「倫理」対策に特化した、構造的知識定着Webアプリケーションです。

---

## 🌟 特徴・機能概要

1. **思想のつながりを構造的に暗記（ナレッジグラフ & 交叉生成エンジン）**
   - 人物、キーワード、定義、著書、エピソード、思想流派の相互連関を学習。
   - 同一カテゴリ・同時代の概念を交叉（Distractor）させることで、共通テストで最も間違えやすい良質な選択肢を自動生成。
2. **5つの多彩な演習モード**
   - ⚡ **スピード暗記特訓（mikan風）**: 1問3秒でサクサク回すテンポの良い4択演習。キーボード即答・連続コンボ対応。
   - 📖 **共テ実践・深堀り道場（過去問道場風）**: 選択肢ごとの判断ポイントと詳細解説。
   - 🔗 **線つなぎ・マッチング**: 人物とキーワード/著書をタップでペアリング。
   - ✍️ **キーワード記述マスター**: 語句のスペルや表記まで正確に入力。
   - 🧠 **分類想起トレーニング**: 「〇〇派の人物を3人答えよ」などのアクティブリコール＆自己採点。
3. **忘却曲線（SM-2 アルゴリズム）による復習キュー**
   - 回答結果や定着度に応じて次回出題日を動的にスケジューリング（1日後 → 3日後 → 7日後 → 14日後 → 30日後）。
4. **ゲーミフィケーション & モチベーション維持**
   - 連続学習日数（ストリーク 🔥）
   - レベル & 累計経験値 (XP ⚡)
   - 13種類以上のバッジコレクション 🏅
   - 全国ランキング 🏆
5. **Google AdSense 広告・収益化 & SEO 最適化**
   - レスポンシブ広告スロット、`ads.txt`、動的サイトマップ（`sitemap.xml`）、クローラー設定（`robots.txt`）。
   - 審査必須ページ（プライバシーポリシー、利用規約、お問い合わせ、運営情報）を完備。
6. **アカウントシステム**
   - アカウント登録なし（ゲストモード）でも即座にローカルストレージで全機能利用可能。
   - Supabase Auth連携によるクラウドデータ同期にも対応。

---

## 🚀 ローカルでの起動方法

```bash
# プロジェクトフォルダへ移動
cd kokyo-ethics-master

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 🌐 Vercel へのデプロイ手順

### Step 1: GitHub リポジトリの作成 & プッシュ
```bash
git init
git add .
git commit -m "Initial commit of kokyo-ethics-master"
# GitHub上で新しいリポジトリを作成後
git remote add origin https://github.com/あなたのユーザー名/kokyo-ethics-master.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel と連携
1. [Vercel](https://vercel.com/) にログイン。
2. 「Add New...」 -> 「Project」をクリック。
3. GitHubリポジトリ `kokyo-ethics-master` をインポート。
4. Framework Preset で `Next.js` が自動選択されていることを確認。
5. 「Deploy」をクリックするだけで、数分で世界中に高速配信（CDN）されます。

---

## 🗄️ Supabase のセットアップ手順（任意）

クラウド同期や本番DBを利用したい場合：
1. [Supabase](https://supabase.com/) で新規プロジェクトを作成。
2. 左メニューの **SQL Editor** を開き、プロジェクト内の `supabase/schema.sql` の内容を貼り付けて **Run** を実行。
3. **Project Settings** -> **API** から以下を取得：
   - `Project URL`
   - `anon / public API key`
4. Vercel の Environment Variables（または `.env.local`）に設定：
   - `NEXT_PUBLIC_SUPABASE_URL` = あなたのプロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = あなたのanonキー

---

## 💰 Google AdSense 審査 & 広告設定

1. [Google AdSense](https://adsense.google.com/) でサイトを登録。
2. 審査用コードまたはパブリッシャーID (`ca-pub-xxxxxxxxxxxxxxxx`) を取得。
3. Vercel の環境変数に以下を設定：
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID` = `ca-pub-xxxxxxxxxxxxxxxx`
4. `public/ads.txt` のパブリッシャーIDをご自身のIDに書き換えてコミット・プッシュ。
5. サイトの固定ページ（プライバシーポリシー・利用規約・お問い合わせ・サイトについて）が審査基準を満たしているため、スムーズに審査を通過できます。
