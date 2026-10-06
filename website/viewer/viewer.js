// Self-hosted, pinned SuperSplat runtime. Imported only after an explicit load.
const channel = '3dgs-scene-viewer-v1';
let handle = null, objectUrl = null, aborter = null, generation = 0;
function report(type, extra={}) {
  if (parent !== window) parent.postMessage({channel,type,...extra},location.origin);
}
function show(message, state='loading') {
  document.getElementById('message').hidden = false;
  document.getElementById('message').dataset.state = state;
  document.getElementById('message-copy').textContent = message;
  document.body.dataset.state = state;
  report(state === 'error' ? 'error' : 'loading', {message});
}
function validUrl(value) {
  const url = new URL(value,location.href);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Only public HTTP(S) model/settings links are supported.');
  if (location.protocol === 'https:' && url.protocol !== 'https:') throw new Error('Use an HTTPS model link.');
  return url.href;
}
function dispose() {
  generation++;
  aborter?.abort();
  aborter = null;
  handle?.destroy();
  handle = null;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
}
async function load(data) {
  dispose();
  const revision = generation;
  const current = () => revision === generation;
  aborter = new AbortController();
  const signal = aborter.signal;
  try {
    show('Checking the model…');
    let url, filename;
    if (data.file instanceof File) {
      filename = data.file.name;
      if (!/\.(ply|sog)$/i.test(filename)) throw new Error('Choose a Gaussian PLY or bundled SOG.');
      if (/\.ply$/i.test(filename) && !/\.compressed\.ply$/i.test(filename)) {
        const header = await data.file.slice(0,32768).text();
        if (!header.startsWith('ply') || !['scale_0','rot_0','opacity','f_dc_0'].every(field => header.split('end_header')[0].includes(field))) throw new Error('This is not a Gaussian PLY. Export the trained model with scale, rotation, opacity and color properties, not an XYZ-only point cloud.');
      }
      if (!current()) return;
      objectUrl = URL.createObjectURL(data.file);
      url = objectUrl;
    } else {
      url = validUrl(data.url);
      filename = decodeURIComponent(new URL(url).pathname.split('/').pop());
      if (!/\.(ply|sog)$/i.test(filename)) throw new Error('The model URL must identify a .ply or .sog file.');
    }
    let settings = {background:{color:[0.025,0.035,0.045]}, camera:{fov:60}, animTracks:[]};
    if (data.settings) {
      const response = await fetch(validUrl(data.settings),{signal});
      if (!response.ok) throw new Error('Settings request failed: HTTP ' + response.status);
      settings = await response.json();
    }
    const response = await fetch(url,{signal});
    if (!response.ok) throw new Error('Model request failed: HTTP ' + response.status);
    if (!current()) return;
    show('Loading the Gaussian renderer…');
    const {createViewer} = await import('./engine.js');
    if (!current()) return;
    const viewer = await createViewer({container:document.getElementById('viewer'),settings,contentUrl:url,contentFilename:filename,contents:Promise.resolve(response),renderer:'webgl',ui:true,noanim:true,nofx:true,lang:'en'});
    if (!current()) { viewer.destroy(); return; }
    handle = viewer;
    const fail = (error) => { if (current()) show('Could not render this model: ' + String(error?.message || error), 'error'); };
    viewer.app.assets.on('add', asset => asset.on('error', fail));
    const loaded = () => {
      if (!current() || !viewer.state.loaded) return;
      document.getElementById('message').hidden = true;
      document.body.dataset.state = 'loaded';
      report('loaded');
    };
    viewer.events.on('loaded:changed', loaded);
    viewer.events.on('progress:changed', progress => { if(current()) { show('Loading Gaussian data: ' + progress + '%'); report('progress',{progress}); } });
    loaded();
  } catch (error) {
    if (current() && error.name !== 'AbortError') show('Unable to load the scene. ' + error.message + ' Check PLY attributes, model URL/CORS and browser WebGL support.', 'error');
  }
}
window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== location.origin || event.data?.channel !== channel) return;
  if (event.data.type === 'load') load(event.data);
  if (event.data.type === 'reset' && handle?.state.loaded) handle.resetCamera();
});
window.addEventListener('unhandledrejection', event => { if(handle && document.body.dataset.state !== 'loaded') show('Scene loading failed. ' + String(event.reason?.message || event.reason), 'error'); });
window.addEventListener('pagehide', dispose);
report('ready');
