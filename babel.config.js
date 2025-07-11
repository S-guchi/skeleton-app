module.exports = function (api) {
    api.cache(true);
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        // プロダクションビルドでconsole文を削除
        ...(isProduction ? ["transform-remove-console"] : []),
      ],
    };
  };
