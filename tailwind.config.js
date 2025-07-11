/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // うさこアプリ専用カラーパレット
                usako: {
                    primary: '#FF90BB',      // メインカラー
                    secondary: '#FFC1DA',    // サブカラー
                    accent1: '#F8F8E1',      // サブカラー1 (クリーム)
                    accent2: '#8ACCD5',      // サブカラー2 (ターコイズ)
                    // 濃淡バリエーション
                    'primary-dark': '#E671A2',
                    'primary-light': '#FFB4CC',
                    'secondary-light': '#FFD6E5',
                    'accent1-dark': '#F0F0C8',
                    'accent2-dark': '#71B8C2',
                    'accent2-light': '#A3D7E0',
                }
            }
        },
    },
    plugins: [],
}
