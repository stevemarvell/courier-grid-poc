// /src/ui/transcript.ts
export function renderTranscript(container: HTMLElement) {
  container.innerHTML = `
    <div class="transcript-header">
      <div class="transcript-label">Radio</div>
      <button type="button" class="btn-icon" id="transcript-clear" title="Clear transcript" aria-label="Clear transcript">Clear</button>
    </div>
    <div class="transcript-box" role="log" aria-live="polite" aria-atomic="false"></div>
  `;
  const btn = container.querySelector('#transcript-clear') as HTMLButtonElement | null
  if (btn) btn.onclick = () => clearTranscript(container)
}

export function pushTranscript(container: HTMLElement, line: string) {
  const box = container.querySelector('.transcript-box') as HTMLDivElement | null
  if (!box) return
  const row = document.createElement('div')
  row.textContent = line
  box.appendChild(row)
  box.scrollTop = box.scrollHeight
}

export function clearTranscript(container: HTMLElement) {
  const box = container.querySelector('.transcript-box') as HTMLDivElement | null
  if (box) box.innerHTML = ''
}
