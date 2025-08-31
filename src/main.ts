// main.ts
import {runSimulation} from './sim'
import type {SimConfig} from './types'
import {render} from './renderer'

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const cfg: SimConfig = {
    width: 20,
    height: 30, // example non-square grid
    blobCount: 30
}

function fitCanvasToGrid(canvas: HTMLCanvasElement, cfg: SimConfig) {
    const dpr = window.devicePixelRatio || 1
    const cssW = 800 // choose your CSS width
    const cssH = Math.round(cssW * (cfg.height / cfg.width))
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
}

(async () => {
    const result = await runSimulation(cfg, {
        beforeSimStart: ({ state, cfg: cfg }) => {
            fitCanvasToGrid(canvas, cfg);
        },
        afterSimStart: ({state, cfg}) => {
            state.addRandomBlobs(cfg.blobCount)
        }
    });

    render(canvas, result)
})();


