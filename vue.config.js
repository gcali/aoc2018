if (process.env.NODE_ENV === "production") {
    module.exports = {
        baseUrl: '/aoc2018',
        configureWebpack: {
            devtool: 'source-map'
        }
    }
}
else {
    module.exports = {
        configureWebpack: {
            devtool: 'source-map'
        }
    }
}