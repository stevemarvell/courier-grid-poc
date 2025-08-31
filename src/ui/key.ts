// /src/ui/key.ts
export function renderKey(container: HTMLElement) {
  container.innerHTML = `
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base">#</span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key ep"></span>Estimated Position</div>
    <div><span class="key ap"></span>Actual Position</div>
  `
}
