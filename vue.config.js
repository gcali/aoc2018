if (process.env.NODE_ENV === "production") {
    module.exports = {
        baseUrl: '/aoc'
    }
}
else {
    module.exports = {
        configureWebpack: {
            devtool: 'source-map'
        }
    }
}
