import mitt, { Emitter } from 'mitt'

interface IOptions {
    emitter: Emitter<any> | null
    eventArray: string[]
}

const defaultOptions = {
    emitter: null,
    eventArray: []
} as IOptions

export const ChimeraJSIntegrator = {

    // Install required for Vue Plugin
    install: (Vue, options) => {
        
        // Saving input parameters
        ChimeraJSIntegrator.Vue = Vue
        ChimeraJSIntegrator.options = {...defaultOptions, ...options}
    }
}