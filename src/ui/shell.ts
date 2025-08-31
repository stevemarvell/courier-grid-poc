// /src/ui/shell.ts
export interface Ui {
  canvas: HTMLCanvasElement
  key: HTMLDivElement
  controls: HTMLDivElement
  log: HTMLDivElement
  transcript: HTMLDivElement
  setTopBar(text: string): void
  setBottomBar(text: string): void
}

export function initShell(): Ui {
  const canvas = get('main-canvas') as HTMLCanvasElement
  const top = get('top-bar') as HTMLDivElement
  const bottom = get('bottom-bar') as HTMLDivElement

  const sidebar = get('sidebar') as HTMLDivElement
  const key = ensure(sidebar, 'sidebar-key')
  const controls = ensure(sidebar, 'sidebar-controls')
  const log = ensure(sidebar, 'sidebar-log')
  const transcript = ensure(sidebar, 'sidebar-transcript')

  // Enforce order: Key → Controls → Log → Transcript
  sidebar.append(key, controls, log, transcript)

  return {
    canvas,
    key,
    controls,
    log,
    transcript,
    setTopBar: (t) => { top.textContent = t },
    setBottomBar: (t) => { bottom.textContent = t }
  }
}

function get(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing DOM element: ${id}`)
  return el
}

function ensure(parent: HTMLElement, id: string): HTMLDivElement {
  let el = document.getElementById(id) as HTMLDivElement | null
  if (!el) {
    el = document.createElement('div')
    el.id = id
    parent.appendChild(el)
  }
  return el
}
