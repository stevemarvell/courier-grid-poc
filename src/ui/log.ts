// /src/ui/log.ts
export function renderLog(container: HTMLElement) {
  container.innerHTML = `
    <div class="log-header">
      <div class="log-label">Log</div>
      <button type="button" class="btn-icon" id="log-clear" title="Clear log" aria-label="Clear log">Clear</button>
    </div>
    <div class="log-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `
  const btn = container.querySelector('#log-clear') as HTMLButtonElement | null
  if (btn) btn.onclick = () => clearLog(container)
}

export function pushLog(container: HTMLElement, line: string) {
  const box = container.querySelector('.log-box') as HTMLDivElement | null
  if (!box) return
  const row = document.createElement('div')
  row.textContent = line
  box.appendChild(row)
  box.scrollTop = box.scrollHeight
}

export function clearLog(container: HTMLElement) {
  const box = container.querySelector('.log-box') as HTMLDivElement | null
  if (box) box.innerHTML = ''
}
