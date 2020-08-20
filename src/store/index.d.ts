import { VuexModule } from 'vuex-module-decorators'

export interface Modules {
  [key: string]: VuexModule;
}