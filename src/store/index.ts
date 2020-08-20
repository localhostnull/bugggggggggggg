import Vue from 'vue'
import Vuex from 'vuex'
import { Modules } from './index.d'
import getters from './getters'

Vue.use(Vuex)

const modulesFiles = require.context('./modules', true, /(?<!\.d)\.ts$/)

const modules = modulesFiles.keys().reduce((modules: Modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

const store = new Vuex.Store({
  modules,
  getters,
})

export default store
