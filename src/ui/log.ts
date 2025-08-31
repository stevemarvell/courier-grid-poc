// /src/ui/log.ts
export function renderLog(container: HTMLElement) {
  container.innerHTML = `
    <div class="log-label">Log</div>
    <div class="log-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `
}

export function pushLog(container: HTMLElement, line: string) {
  const box = container.querySelector('.log-box') as HTMLDivElement | null
  if (!box) return
  const row = document.createElement('div')
  row.textContent = line
  box.appendChild(row)
  box.scrollTop = box.scrollHeight
}
