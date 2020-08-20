const cache = {
    set(key: string, value: any, expire = 0) {
      if (expire !== 0) {
        expire = Math.round(new Date().getTime() / 1000) + expire
      }
  
      const source = JSON.stringify({
        __expire__: expire,
        value: value
      })
  
      try {
        localStorage.setItem(key, source)
      } catch (e) {
        if (e.code === 22) {
          localStorage.clear()
          localStorage.setItem(key, source)
        }
      }
    },
    get(key: string) {
      const sourceStr = localStorage.getItem(key)
      if (typeof sourceStr !== 'undefined' && sourceStr !== null) {
        const source = JSON.parse(sourceStr)
        if (source.__expire__ === 0 || source.__expire__ > Math.round(new Date().getTime() / 1000)) {
          return source.value
        } else {
          localStorage.removeItem(key)
        }
      }
      return null
    },
    delete(key: string) {
      localStorage.removeItem(key)
    }
  }
  export default cache
  