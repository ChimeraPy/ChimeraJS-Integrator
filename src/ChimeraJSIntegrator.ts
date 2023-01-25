import mitt, { Emitter } from 'mitt'
import { App, Plugin } from 'vue'

interface IOptions {
  emitter: Emitter<any> | null
  eventArray: string[]
}

// const defaultOptions = {
//   emitter: mitt(),
//   eventArray: []
// } as IOptions

// export const ChimeraJSIntegrator: Plugin = {

//   // Install required for Vue Plugin
//   install: (Vue: App, options: IOptions) => {
      
//     // Saving input parameters
//     // ChimeraJSIntegrator.options = {...defaultOptions, ...options}
//     console.log(Vue, options)
    
//   }
// }

export default class ChimeraJSIntegrator {

  static install: (Vue: App, options: IOptions) => void

  install(Vue: App, options: IOptions) {
    console.log(options)
  }
}
