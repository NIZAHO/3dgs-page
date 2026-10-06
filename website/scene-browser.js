// Only authorized, manually configured examples are published. Local File objects
// cross a same-origin iframe boundary; their bytes are never sent to a server.
const $ = (id) => document.getElementById(id);
const channel = '3dgs-scene-viewer-v1';
let frame = null, pending = null, timer = null;
let scenes = [];
function status(message, state = 'empty') {
  $('scene-status').textContent = message;
  $('scene-status').dataset.state = state;
  $('reset-scene').disabled = state !== 'loaded';
}
export function publicUrl(value, base = document.baseURI) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('A model URL is required.');
  const url = new URL(value, base);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Only HTTP(S) URLs without embedded credentials are allowed.');
  if (location.protocol === 'https:' && url.protocol !== 'https:') throw new Error('An HTTPS model link is required.');
  return url.href;
}
function validateScene(value, ids) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !/^[a-z0-9_-]+$/i.test(value.id)) throw new Error('Each example needs a unique simple id.');
  if (ids.has(value.id)) throw new Error('Duplicate example id: ' + value.id);
  ids.add(value.id);
  if (typeof value.name !== 'string' || !value.name.trim()) throw new Error('Each example needs a name.');
  const url = publicUrl(value.url);
  if (!/\.(ply|sog)$/i.test(new URL(url).pathname)) throw new Error('Example URLs must end in .ply or .sog.');
  return {id:value.id, name:value.name, url, description:typeof value.description === 'string' ? value.description : '', settings:value.settings ? publicUrl(value.settings) : null};
}
async function readExamples() {
  try {
    const response = await fetch(new URL('./examples/scenes.json', document.baseURI), {cache:'no-cache'});
    if (!response.ok) throw new Error('Example list could not be loaded (HTTP ' + response.status + ').');
    const data = await response.json();
    if (data.version !== 1 || !Array.isArray(data.scenes)) throw new Error('Invalid example-list format.');
    const ids = new Set();
    scenes = data.scenes.filter(s => s.enabled !== false).map(s => validateScene(s, ids));
    $('scene-select').replaceChildren();
    if (!scenes.length) {
      $('scene-select').add(new Option('No public examples yet', ''));
      $('scene-empty-copy').textContent = 'Open a local Gaussian PLY now, or add your first published example.';
    } else {
      for (const scene of scenes) $('scene-select').add(new Option(scene.name, scene.id));
      $('scene-select').disabled = false;
      $('load-example').disabled = false;
      $('scene-description').textContent = scenes[0].description || 'Select Load example to download and render this scene.';
    }
  } catch (error) {
    $('scene-select').replaceChildren(new Option('Example list unavailable', ''));
    status(error.message + ' Local PLY preview is still available.', 'error');
  }
}
function unload() {
  clearTimeout(timer);
  frame?.remove(); // Unmount the entire renderer/context, including in-flight loads.
  frame = null;
  pending = null;
  $('scene-empty').hidden = false;
  $('close-scene').disabled = true;
  status('No model loaded.');
}
function open(payload, description = '') {
  unload();
  pending = payload;
  frame = document.createElement('iframe');
  frame.title = 'Interactive Gaussian scene: ' + payload.name;
  frame.setAttribute('allow', 'fullscreen; xr-spatial-tracking');
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-pointer-lock allow-downloads');
  frame.allowFullscreen = true;
  frame.src = new URL('./viewer/index.html', document.baseURI).href;
  $('scene-frame-slot').replaceChildren(frame);
  $('scene-empty').hidden = true;
  $('close-scene').disabled = false;
  $('scene-description').textContent = description;
  status('Preparing viewer for ' + payload.name + '…', 'loading');
  timer = setTimeout(() => {
    if ($('scene-status').dataset.state === 'loading') status('Still loading. Large models may take longer; check the model link or use Unload to stop.', 'loading');
  }, 120000);
}
window.addEventListener('message', (event) => {
  if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.channel !== channel) return;
  const {type, message, progress} = event.data;
  if (type === 'ready' && pending) {
    frame.contentWindow.postMessage({channel, type:'load', ...pending}, location.origin);
    pending = null;
  } else if (type === 'loading') status(message || 'Loading Gaussian data…', 'loading');
  else if (type === 'progress') status('Loading Gaussian data: ' + Math.max(0, Math.min(100, Math.round(progress))) + '%', 'loading');
  else if (type === 'loaded') { clearTimeout(timer); status('Scene loaded · orbit, pan and zoom inside the viewer.', 'loaded'); }
  else if (type === 'error') { clearTimeout(timer); status(message || 'The scene could not be loaded.', 'error'); }
});
$('scene-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const scene = scenes.find(s => s.id === $('scene-select').value);
  if (scene) open({name:scene.name, url:scene.url, settings:scene.settings}, scene.description);
});
$('scene-select').addEventListener('change', () => {
  const scene = scenes.find(s => s.id === $('scene-select').value);
  if (scene) $('scene-description').textContent = scene.description || 'Click Load example to switch scenes.';
});
$('open-local').addEventListener('click', () => $('local-model').click());
$('local-model').addEventListener('change', () => {
  const file = $('local-model').files?.[0];
  if (!file) return;
  if (!/\.(ply|sog)$/i.test(file.name)) { status('Choose a Gaussian .ply or bundled .sog file.', 'error'); return; }
  if (file.size > 300 * 1024 * 1024 && !confirm('This model exceeds 300 MiB and may use much more GPU memory. Open it?')) { $('local-model').value=''; return; }
  open({name:file.name, file}, 'Local preview only · ' + (file.size / 1048576).toFixed(2) + ' MiB · not uploaded or published.');
  $('local-model').value = '';
});
$('model-url-form').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const url = publicUrl($('model-url').value);
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop());
    if (!/\.(ply|sog)$/i.test(name)) throw new Error('Use a direct .ply or .sog model URL.');
    open({url, name}, 'Preview of the supplied model URL; this does not add it to the published example list.');
  } catch (error) { status(error.message, 'error'); }
});
$('reset-scene').addEventListener('click', () => frame?.contentWindow.postMessage({channel,type:'reset'},location.origin));
$('close-scene').addEventListener('click', unload);
$('fullscreen-scene').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($('scene-viewport').requestFullscreen) await $('scene-viewport').requestFullscreen();
    else status('Fullscreen is not supported by this browser. The embedded viewer remains available.', $('scene-status').dataset.state);
  } catch (error) { status('Fullscreen request declined: ' + error.message, $('scene-status').dataset.state); }
});
window.addEventListener('pagehide', unload);
readExamples();
