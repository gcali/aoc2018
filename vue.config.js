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

module.exports = {
    ...module.exports,
    css: {
        loaderOptions: {
            sass: {
                data: `
                @import "@/style/variables.scss";
                @import "@/style/media.scss";
                `
            }
        }
    }
}
