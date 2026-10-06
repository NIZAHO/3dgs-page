import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {js, css} from '@playcanvas/supersplat-viewer';
const root=process.cwd();
const source=resolve(root,'website'), out=resolve(root,'_site');
if(typeof js!=='string'||!js.includes('createViewer')||typeof css!=='string') throw new Error('Unexpected SuperSplat bundle API');
const manifest=JSON.parse(await readFile(join(source,'examples/scenes.json'),'utf8'));
if(manifest.version!==1||!Array.isArray(manifest.scenes)) throw new Error('Invalid scene manifest');
const ids=new Set();
for(const scene of manifest.scenes){
  if(typeof scene.id!=='string'||!/^[a-z0-9_-]+$/i.test(scene.id)||ids.has(scene.id)) throw new Error('Invalid/duplicate scene id');
  ids.add(scene.id);
  if(scene.enabled===false) continue;
  if(typeof scene.name!=='string'||!scene.name.trim()||typeof scene.url!=='string'||!scene.url.trim()) throw new Error('Scene name and URL required');
  const url=new URL(scene.url,'https://nizaho.github.io/3dgs-page/');
  if(url.protocol!=='https:'||url.username||url.password||!(/\.(ply|sog)$/i.test(url.pathname))) throw new Error('Use HTTPS Gaussian PLY/SOG URLs');
  if(!/^[a-z]+:/i.test(scene.url)&&!scene.url.startsWith('//')){
    const local=resolve(source,scene.url.replace(/^\.\//,''));
    if(!local.startsWith(source+'/')) throw new Error('Example escapes the website directory');
    await readFile(local); // Fail the build rather than publishing a broken local example.
  }
}
await rm(out,{recursive:true,force:true});
await cp(source,out,{recursive:true,filter:path=>!path.endsWith('.md')&&!path.includes('/partials')});
await mkdir(join(out,'viewer'),{recursive:true});
await writeFile(join(out,'viewer/engine.js'),js);
await writeFile(join(out,'viewer/engine.css'),css);
const pkg=JSON.parse(await readFile('node_modules/@playcanvas/supersplat-viewer/package.json','utf8'));
await cp('node_modules/@playcanvas/supersplat-viewer/LICENSE',join(out,'viewer/LICENSE'));
await writeFile(join(out,'viewer/version.json'),JSON.stringify({package:pkg.name,version:pkg.version,source:'https://github.com/playcanvas/supersplat-viewer'},null,2)+'\n');
console.log('Built self-hosted SuperSplat',pkg.version,'and',manifest.scenes.filter(s=>s.enabled!==false).length,'manual examples');
