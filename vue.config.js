module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    proxy: 'http://localhost:3000'
  },
  pwa: {                     
    workboxOptions: {
      navigateFallback: 'index.html'
    }
  }
}