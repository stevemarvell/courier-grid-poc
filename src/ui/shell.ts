// /src/ui/shell.ts
export interface Ui {
  canvas: HTMLCanvasElement
  key: HTMLDivElement
  config: HTMLDivElement
  setTopBar(text: string): void
  setBottomBar(text: string): void
}

export function initShell(): Ui {
  const canvas = get('main-canvas') as HTMLCanvasElement
  const key = get('sidebar-key') as HTMLDivElement
  const config = get('sidebar-config') as HTMLDivElement
  const top = get('top-bar') as HTMLDivElement
  const bottom = get('bottom-bar') as HTMLDivElement

  return {
    canvas,
    key,
    config,
    setTopBar: (t) => { top.textContent = t },
    setBottomBar: (t) => { bottom.textContent = t }
  }
}

function get(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing DOM element: ${id}`)
  return el
}
