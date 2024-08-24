const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "https://demo-boost-a.onrender.com/",
            changeOrigin: true,
        })
    )
}