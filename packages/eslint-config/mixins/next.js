module.exports = {
    plugins: ["react", "react-hooks", "jsx-a11y"],
    extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:react/jsx-runtime",
    ],
    settings: {
        react : {
            version : "19"
        }
    }
}