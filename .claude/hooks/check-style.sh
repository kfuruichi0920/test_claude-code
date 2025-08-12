#!/bin/bash

# スタイルチェック用スクリプト
# HTMLファイル、CSSファイル、JavaScriptファイルの基本的なスタイルチェックを実行

echo "🎨 スタイルチェックを開始します..."

# 変更されたファイルを取得
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# 終了コード
EXIT_CODE=0

# HTMLファイルのチェック
check_html() {
    local file="$1"
    echo "📄 HTMLファイルをチェック中: $file"
    
    # インデントチェック（4スペース）
    if grep -q $'\t' "$file"; then
        echo "❌ エラー: $file にタブ文字が含まれています。4スペースを使用してください。"
        EXIT_CODE=1
    fi
    
    # 基本的なHTML構造チェック
    if ! grep -q "<!DOCTYPE html>" "$file"; then
        echo "⚠️  警告: $file にDOCTYPE宣言がありません。"
    fi
    
    if ! grep -q '<meta charset="UTF-8">' "$file"; then
        echo "⚠️  警告: $file に文字エンコーディング指定がありません。"
    fi
}

# CSSファイルのチェック
check_css() {
    local file="$1"
    echo "🎨 CSSファイルをチェック中: $file"
    
    # インデントチェック（4スペース）
    if grep -q $'\t' "$file"; then
        echo "❌ エラー: $file にタブ文字が含まれています。4スペースを使用してください。"
        EXIT_CODE=1
    fi
    
    # セミコロン忘れチェック（簡易版）
    if grep -E '^\s*[a-zA-Z-]+:\s*[^;]+$' "$file" | grep -v '{' | grep -v '}'; then
        echo "⚠️  警告: $file にセミコロンが不足している可能性があります。"
    fi
}

# JavaScriptファイルのチェック
check_js() {
    local file="$1"
    echo "⚙️  JavaScriptファイルをチェック中: $file"
    
    # インデントチェック（4スペース）
    if grep -q $'\t' "$file"; then
        echo "❌ エラー: $file にタブ文字が含まれています。4スペースを使用してください。"
        EXIT_CODE=1
    fi
    
    # セミコロンチェック（簡易版）
    if grep -E '^\s*(var|let|const|return).*[^;{]$' "$file"; then
        echo "⚠️  警告: $file にセミコロンが不足している可能性があります。"
    fi
    
    # console.logの警告
    if grep -q "console\.log" "$file"; then
        echo "⚠️  警告: $file にconsole.logが含まれています。本番環境では削除してください。"
    fi
}

# ファイルごとのチェック実行
if [ -z "$CHANGED_FILES" ]; then
    echo "📁 すべてのファイルをチェックします..."
    CHANGED_FILES=$(find . -name "*.html" -o -name "*.css" -o -name "*.js" | grep -v node_modules | grep -v .git)
fi

for file in $CHANGED_FILES; do
    if [ -f "$file" ]; then
        case "$file" in
            *.html)
                check_html "$file"
                ;;
            *.css)
                check_css "$file"
                ;;
            *.js)
                check_js "$file"
                ;;
        esac
    fi
done

# 結果の表示
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ スタイルチェックが完了しました。問題は見つかりませんでした。"
else
    echo "❌ スタイルチェックでエラーが見つかりました。"
fi

exit $EXIT_CODE