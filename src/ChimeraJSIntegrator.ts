import mitt, { Emitter } from 'mitt'
import { App, Plugin } from 'vue'

interface IOptions {
  emitter: Emitter<any>
  eventArray: string[]
}

const defaultOptions = {
  emitter: mitt<any>(),
  eventArray: []
} as IOptions

// export const ChimeraJSIntegrator: Plugin = {

//   // Install required for Vue Plugin
//   install: (Vue: App, options: IOptions) => {
      
//     // Saving input parameters
//     // ChimeraJSIntegrator.options = {...defaultOptions, ...options}
//     console.log(Vue, options)
    
//   }
// }

export default class ChimeraJSIntegrator {
  options: IOptions

  static install: (Vue: App, options: IOptions) => void

  constructor() {
    this.options = defaultOptions
  }

  install(Vue: App, options: IOptions) {

    this.options = {...defaultOptions, ...options}
    console.log(this.options)
  }
}
