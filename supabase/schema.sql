-- ========================================================
-- 公共倫理パーフェクトマスター.com : Supabase Schema
-- ========================================================

-- 1. プロファイル (ユーザー情報 & ゲーミフィケーション)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL DEFAULT '探求者',
  favorite_figure_id TEXT,
  ranking_visible BOOLEAN NOT NULL DEFAULT true,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 1,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unlocked_badges TEXT[] DEFAULT '{}',
  total_answered INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 既存プロジェクトにも好きな思想家の項目を追加する。
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favorite_figure_id TEXT;

-- RLS設定 (Profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 公開ランキングは leaderboard ビュー経由で必要な項目だけ公開する。
-- profiles テーブル本体は本人だけが読み取れるようにする。
CREATE POLICY "Users can view own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. 忘却曲線・学習進捗 (SRS Progress)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  repetition_count INTEGER NOT NULL DEFAULT 0,
  ease_factor NUMERIC(3,2) NOT NULL DEFAULT 2.50,
  interval_days INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, question_id)
);

-- RLS設定 (User Progress)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id);

-- 3. 問題マスタ (Questions Pool - 必要に応じてクラウド同期)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  context TEXT,
  options JSONB,
  correct_answer JSONB NOT NULL,
  explanation TEXT NOT NULL,
  common_test_hint TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS設定 (Questions: 誰でも読み取り可能)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (true);

-- 4. ランキング用ビュー / 集計関数
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  id,
  username,
  xp,
  level,
  streak_days,
  total_correct,
  ROUND((total_correct::NUMERIC / NULLIF(total_answered, 0)) * 100, 1) as accuracy,
  favorite_figure_id
FROM public.profiles
WHERE ranking_visible = true
ORDER BY xp DESC
LIMIT 100;

-- 公開するのは上記ビューの項目だけにし、profiles本体のRLSは維持する。
ALTER VIEW public.leaderboard SET (security_invoker = false);

-- 本人が自分のアカウントと関連データを削除できる退会用関数。
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
