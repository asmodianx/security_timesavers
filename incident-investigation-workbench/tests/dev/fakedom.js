'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
module.exports=function(root){
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const listeners=new WeakMap();const reg={},allEls=[];
class El{get id(){return this._id||''} set id(v){this._id=v;if(v)reg[v]=this} constructor(tag,attrs={}){this.tagName=tag.toUpperCase();this.children=[];this._text='';this.value=attrs.value||'';this.type=attrs.type||'';this.id=attrs.id||'';this.className=attrs.class||'';this.dataset={};for(const k in attrs)if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-(\w)/g,(_,c)=>c.toUpperCase())]=attrs[k];this.checked=false;this.disabled='disabled' in attrs;this.files=[];this.style={};this.hidden='hidden' in attrs;this.open=false;this.attrs={};this.colSpan=1;this._opts=attrs._opts||[];
 const self=this;this.classList={add:c=>{const s=new Set(self.className.split(/\s+/).filter(Boolean));s.add(c);self.className=[...s].join(' ')},remove:c=>{self.className=self.className.split(/\s+/).filter(x=>x&&x!==c).join(' ')},toggle:(c,on)=>{on===undefined?(self.classList.contains(c)?self.classList.remove(c):self.classList.add(c)):(on?self.classList.add(c):self.classList.remove(c))},contains:c=>self.className.split(/\s+/).includes(c)};
 if(this.tagName==='SELECT'&&this._opts.length){for(const o of this._opts){const e=new El('option');e.value=o;e.textContent=o;this.children.push(e)}this.value=this._opts[0];}
}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('')} set textContent(v){this._text=String(v);this.children=[]}
 append(...n){for(const x of n)this.children.push(typeof x==='string'?new Text(x):x)} replaceChildren(...n){this.children=[];this._text='';this.append(...n)}
 remove(){} setAttribute(k,v){this.attrs[k]=v} addEventListener(t,f){if(!listeners.has(this))listeners.set(this,{});(listeners.get(this)[t]=listeners.get(this)[t]||[]).push(f)}
 async fire(t,e={}){const l=(listeners.get(this)||{})[t]||[];for(const f of l)await f(e)} click(){return this.fire('click')}
 get selectedOptions(){return this.children.filter(o=>o.value===this.value)} set selectedIndex(i){if(this.children[i])this.value=this.children[i].value} get options(){return this.children}
 get srcObject(){return null} set srcObject(v){} getContext(){return{drawImage(){}}}
 all(){return [this,...this.children.flatMap(c=>c.all?c.all():[])]}
}
class Text{constructor(t){this.textContent=t}all(){return[]}}
const re=/<(input|select|textarea|button|div|pre|span|section|p|nav|article|video|canvas|footer|label|main|datalist)\b([^>]*)>/g;let m;
while((m=re.exec(html))){const attrs={};m[2].replace(/([\w-]+)(?:="([^"]*)")?/g,(_,k,v)=>{attrs[k]=v===undefined?'':v});
 if(m[1]==='select'){const end=html.indexOf('</select>',m.index);const inner=html.slice(m.index,end);attrs._opts=[...inner.matchAll(/<option(?: value="([^"]*)")?( selected)?>([^<]*)/g)].map(x=>x[1]!==undefined?x[1]:x[3]);const sel=[...inner.matchAll(/<option(?: value="([^"]*)")? selected>([^<]*)/g)][0];attrs._sel=sel?(sel[1]??sel[2]):null}
 if(m[1]==='input'&&!attrs.type)attrs.type='text';
 const e=new El(m[1],attrs);if(attrs._sel)e.value=attrs._sel;allEls.push(e);}
const document={getElementById:id=>reg[id]||null,createElement:t=>new El(t),createTextNode:t=>new Text(t),activeElement:null,body:new El('body'),
 querySelectorAll(sel){if(sel==='.panel')return allEls.filter(e=>e.classList.contains('panel'));if(sel==='.tab')return allEls.filter(e=>e.classList.contains('tab'));if(sel==='[data-go]')return allEls.filter(e=>e.dataset.go);if(sel==='[data-util]')return allEls.filter(e=>e.dataset.util);if(sel==='#tMap .mapField')return reg.tMap.all().filter(e=>e.className&&e.className.includes('mapField'));throw Error('qsa '+sel)}};
const store={};const downloads=[];
const g={document,window:null,console,setTimeout,clearTimeout,crypto:require('crypto').webcrypto,TextEncoder,TextDecoder,Blob,File,Uint8Array,Node:El,
 URL:{createObjectURL:b=>{downloads.push(b);return 'blob:x'},revokeObjectURL(){}},localStorage:{setItem:(k,v)=>store[k]=String(v),getItem:k=>k in store?store[k]:null,removeItem:k=>delete store[k]},
 confirm:()=>true,alert(){},scrollTo(){},navigator:{},addEventListener(){},print(){},btoa,atob,structuredClone};
g.window=g;g.globalThis=g;
g.localStorage=new Proxy(g.localStorage,{ownKeys:()=>Object.keys(store),getOwnPropertyDescriptor:(t,k)=>k in store?{enumerable:true,configurable:true,value:store[k]}:undefined});
document.createElement=t=>{const e=new El(t);if(t==='a'){e.click=()=>{downloads.push({name:e.download})}}return e};
vm.createContext(g);
return {g,reg,downloads,run(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),g,{filename:file})},El};
};
