# Architecture

## Phase 1: Browser Prototype
- 単一HTMLで動作する検証環境
- 座標ベースのLens
- Reading Window / Searchlight
- localStorageによる設定保存
- 文字認識なし

## Phase 2: macOS Overlay
候補技術はSwift + AppKit。透明ウィンドウ、常時最前面、クリック透過、グローバルショートカットを扱う。

## Phase 3以降
画面キャプチャ、OCR、行検出は独立モジュールとして追加し、座標ベース動作を常にフォールバックとして残す。
