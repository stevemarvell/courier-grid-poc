import { runSimulation } from './sim'
import { render } from './renderer'
import type { SimConfig } from './types'

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const sidebar = document.getElementById('sidebar-key') as HTMLDivElement;
const topBar = document.getElementById('top-bar') as HTMLDivElement;
const bottomBar = document.getElementById('bottom-bar') as HTMLDivElement;

const cfg: SimConfig = {
  width: 50,
  height: 40,
  baseCount: 1,
  droneCount: 4,
  casualtyCount: 1
};

function fitCanvasToGrid(canvas: HTMLCanvasElement, cfg: SimConfig) {
  const dpr = window.devicePixelRatio || 1;
  const cssH = 800;
  const cssW = Math.round(cssH * (cfg.width / cfg.height));
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}

window.onload = async () => {
  topBar.textContent = 'MASAR Demo';
  bottomBar.textContent = `© Steve Marvell ${new Date().getFullYear()}`;

  sidebar.innerHTML = `
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base"></span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key est"></span>Estimated Position</div>
    <div><span class="key cas"></span>Actual Casualty</div>
  `;

  const result = await runSimulation(cfg, {
    beforeSimStart: ({ cfg }) => fitCanvasToGrid(canvas, cfg)
  });
  render(canvas, result);
};
