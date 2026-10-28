# 写真がなくてもOK！ChatGPTで作る日本風ステッカー販売ガイド（特典ページ）

> 設計の共通原則は `~/.claude/CLAUDE.md` に従う。要件は `docs/requirements.md`。

## プロジェクト設定

技術スタック: HTML5 / CSS3 / Vanilla JavaScript（ビルドなし）、GitHub Pages。backend・database・環境変数なし（`.env` 系は作らない）。

## 運用ルール

- note特典と同じ配色（アイボリー×ブラウン＋くすみピンク）の複製。複製元と既存特典は未変更
- 文章・プロンプト・リンクの単一の源は `js/content.js`。色・余白は `css/style.css` の `:root`
- プロンプト（①②③＋一覧画像用）は制作指示書の文面を変更しない。Etsyの規約・手数料・上限は公式で確認した範囲のみ記載し、確認できないものは「未確認」と明記する
- CTA: ファーストビュー直下（教科書5大特典の画像）と最後の2か所。最後は「悩み→つなぎ→LINE」。OGP画像は設定しない
- 作例画像はGeminiで生成したオリジナル（assets/images）。第三者の画像は使わない。文字・ロゴ・マークを入れない
- 本番公開（GitHub Pagesへの反映）はユーザーの確認を得てから

## 命名・品質

- ファイル kebab-case / 変数 camelCase / 関数100行・ファイル700行・複雑度10・行長120以下
- ローカル確認: `python3 -m http.server <port>` を1つだけ起動

## ドキュメント管理

許可: `docs/requirements.md` / `docs/SCOPE_PROGRESS.md` / `README.md` / `LICENSE.md`。他は要許諾。

## 品質ゲート

- 第一防壁: ローカル git hook（pre-commit: 秘密情報拒否＋JS構文）
- 最終防壁: GitHub Actions `verify`（JS構文・必須ファイル・index.htmlのリンク切れ）
- ブランチ: `main`＝公開 / `develop`＝編集
