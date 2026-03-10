(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();var ve=Object.defineProperty,we=(n,t,e)=>t in n?ve(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e,v=(n,t,e)=>we(n,typeof t!="symbol"?t+"":t,e),gt=53,ke=new TextDecoder,Ut=new WeakMap,Lt=new WeakMap,xe=class{constructor(n){v(this,"buf"),v(this,"bit_pos"),this.buf=n,this.bit_pos=0}write_bit(n){const t=this.bit_pos>>>3,e=this.bit_pos&7;n&&(this.buf[t]|=1<<e),this.bit_pos++}write_bitsUnsigned(n,t){if(t!==0){if(typeof n=="number"){if(t<=32){if((this.bit_pos&7)===0&&(t&7)===0){let s=n>>>0,i=this.bit_pos>>>3;for(let r=0;r<t;r+=8)this.buf[i++]=s&255,s>>>=8;this.bit_pos+=t;return}let o=n>>>0;for(let s=0;s<t;s++)this.write_bit(o&1),o>>>=1;return}this.write_bitsBigint(BigInt(n),t);return}this.write_bitsBigint(n,t)}}write_bitsBigint(n,t){if(t===0)return;if((this.bit_pos&7)===0&&(t&7)===0){let s=n,i=this.bit_pos>>>3;for(let r=0;r<t;r+=8)this.buf[i++]=Number(s&0xffn),s>>=8n;this.bit_pos+=t;return}let o=n;for(let s=0;s<t;s++)this.write_bit((o&1n)===0n?0:1),o>>=1n}},Ie=class{constructor(n){v(this,"buf"),v(this,"bit_pos"),this.buf=n,this.bit_pos=0}read_bit(){const n=this.bit_pos>>>3,t=this.bit_pos&7,e=this.buf[n]>>>t&1;return this.bit_pos++,e}read_bitsUnsigned(n){if(n===0)return 0;if(n<=32){if((this.bit_pos&7)===0&&(n&7)===0){let o=0,s=0,i=this.bit_pos>>>3;for(let r=0;r<n;r+=8)o|=this.buf[i++]<<s,s+=8;return this.bit_pos+=n,o>>>0}let e=0;for(let o=0;o<n;o++)this.read_bit()&&(e|=1<<o);return e>>>0}if(n<=gt){let t=0,e=1;for(let o=0;o<n;o++)this.read_bit()&&(t+=e),e*=2;return t}return this.read_bitsBigint(n)}read_bitsBigint(n){if(n===0)return 0n;if((this.bit_pos&7)===0&&(n&7)===0){let s=0n,i=0n,r=this.bit_pos>>>3;for(let u=0;u<n;u+=8)s|=BigInt(this.buf[r++])<<i,i+=8n;return this.bit_pos+=n,s}let e=0n,o=1n;for(let s=0;s<n;s++)this.read_bit()&&(e+=o),o<<=1n;return e}};function G(n,t){if(!Number.isInteger(n))throw new TypeError(`${t} must be an integer`)}function P(n){if(G(n,"size"),n<0)throw new RangeError("size must be >= 0")}function Ht(n,t){if(t!==n)throw new RangeError(`vector size mismatch: expected ${n}, got ${t}`)}function U(n,t){switch(n.$){case"UInt":case"Int":return P(n.size),n.size;case"Nat":{if(typeof t=="bigint"){if(t<0n)throw new RangeError("Nat must be >= 0");if(t>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Nat too large to size");return Number(t)+1}if(G(t,"Nat"),t<0)throw new RangeError("Nat must be >= 0");return t+1}case"Tuple":{const e=n.fields,o=ot(t,"Tuple");let s=0;for(let i=0;i<e.length;i++)s+=U(e[i],o[i]);return s}case"Vector":{P(n.size);const e=ot(t,"Vector");Ht(n.size,e.length);let o=0;for(let s=0;s<n.size;s++)o+=U(n.type,e[s]);return o}case"Struct":{let e=0;const o=Nt(n.fields);for(let s=0;s<o.length;s++){const i=o[s],r=Wt(t,i);e+=U(n.fields[i],r)}return e}case"List":{let e=1;return Gt(t,o=>{e+=1,e+=U(n.type,o)}),e}case"Map":{let e=1;return Xt(t,(o,s)=>{e+=1,e+=U(n.key,o),e+=U(n.value,s)}),e}case"Union":{const e=St(n),o=Dt(t),s=n.variants[o];if(!s)throw new RangeError(`Unknown union variant: ${o}`);const i=Jt(t,s);return e.tag_bits+U(s,i)}case"String":return 1+$e(t)*9}}function L(n,t,e){switch(t.$){case"UInt":{if(P(t.size),t.size===0){if(e===0||e===0n)return;throw new RangeError("UInt out of range")}if(typeof e=="bigint"){if(e<0n)throw new RangeError("UInt must be >= 0");const s=1n<<BigInt(t.size);if(e>=s)throw new RangeError("UInt out of range");n.write_bitsUnsigned(e,t.size);return}if(G(e,"UInt"),e<0)throw new RangeError("UInt must be >= 0");if(t.size>gt)throw new RangeError("UInt too large for number; use bigint");const o=2**t.size;if(e>=o)throw new RangeError("UInt out of range");n.write_bitsUnsigned(e,t.size);return}case"Int":{if(P(t.size),t.size===0){if(e===0||e===0n)return;throw new RangeError("Int out of range")}if(typeof e=="bigint"){const r=BigInt(t.size),u=-(1n<<r-1n),c=(1n<<r-1n)-1n;if(e<u||e>c)throw new RangeError("Int out of range");let _=e;e<0n&&(_=(1n<<r)+e),n.write_bitsUnsigned(_,t.size);return}if(G(e,"Int"),t.size>gt)throw new RangeError("Int too large for number; use bigint");const o=-(2**(t.size-1)),s=2**(t.size-1)-1;if(e<o||e>s)throw new RangeError("Int out of range");let i=e;e<0&&(i=2**t.size+e),n.write_bitsUnsigned(i,t.size);return}case"Nat":{if(typeof e=="bigint"){if(e<0n)throw new RangeError("Nat must be >= 0");let o=e;for(;o>0n;)n.write_bit(1),o-=1n;n.write_bit(0);return}if(G(e,"Nat"),e<0)throw new RangeError("Nat must be >= 0");for(let o=0;o<e;o++)n.write_bit(1);n.write_bit(0);return}case"Tuple":{const o=t.fields,s=ot(e,"Tuple");for(let i=0;i<o.length;i++)L(n,o[i],s[i]);return}case"Vector":{P(t.size);const o=ot(e,"Vector");Ht(t.size,o.length);for(let s=0;s<t.size;s++)L(n,t.type,o[s]);return}case"Struct":{const o=Nt(t.fields);for(let s=0;s<o.length;s++){const i=o[s];L(n,t.fields[i],Wt(e,i))}return}case"List":{Gt(e,o=>{n.write_bit(1),L(n,t.type,o)}),n.write_bit(0);return}case"Map":{Xt(e,(o,s)=>{n.write_bit(1),L(n,t.key,o),L(n,t.value,s)}),n.write_bit(0);return}case"Union":{const o=St(t),s=Dt(e),i=o.index_by_tag.get(s);if(i===void 0)throw new RangeError(`Unknown union variant: ${s}`);o.tag_bits>0&&n.write_bitsUnsigned(i,o.tag_bits);const r=t.variants[s],u=Jt(e,r);L(n,r,u);return}case"String":{Se(n,e);return}}}function C(n,t){switch(t.$){case"UInt":return P(t.size),n.read_bitsUnsigned(t.size);case"Int":{if(P(t.size),t.size===0)return 0;const e=n.read_bitsUnsigned(t.size);if(typeof e=="bigint"){const s=1n<<BigInt(t.size-1);return e&s?e-(1n<<BigInt(t.size)):e}const o=2**(t.size-1);return e>=o?e-2**t.size:e}case"Nat":{let e=0,o=null;for(;n.read_bit();)o!==null?o+=1n:e===Number.MAX_SAFE_INTEGER?o=BigInt(e)+1n:e++;return o??e}case"Tuple":{const e=new Array(t.fields.length);for(let o=0;o<t.fields.length;o++)e[o]=C(n,t.fields[o]);return e}case"Vector":{const e=new Array(t.size);for(let o=0;o<t.size;o++)e[o]=C(n,t.type);return e}case"Struct":{const e={},o=Nt(t.fields);for(let s=0;s<o.length;s++){const i=o[s];e[i]=C(n,t.fields[i])}return e}case"List":{const e=[];for(;n.read_bit();)e.push(C(n,t.type));return e}case"Map":{const e=new Map;for(;n.read_bit();){const o=C(n,t.key),s=C(n,t.value);e.set(o,s)}return e}case"Union":{const e=St(t);let o=0;e.tag_bits>0&&(o=n.read_bitsUnsigned(e.tag_bits));let s;if(typeof o=="bigint"){if(o>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Union tag index too large");s=Number(o)}else s=o;if(s<0||s>=e.keys.length)throw new RangeError("Union tag index out of range");const i=e.keys[s],r=t.variants[i],u=C(n,r);return r.$==="Struct"&&u&&typeof u=="object"?(u.$=i,u):{$:i,value:u}}case"String":return Ne(n)}}function ot(n,t){if(!Array.isArray(n))throw new TypeError(`${t} value must be an Array`);return n}function Wt(n,t){if(n&&typeof n=="object")return n[t];throw new TypeError("Struct value must be an object")}function St(n){const t=Ut.get(n);if(t)return t;const e=Object.keys(n.variants).sort();if(e.length===0)throw new RangeError("Union must have at least one variant");const o=new Map;for(let r=0;r<e.length;r++)o.set(e[r],r);const s=e.length<=1?0:Math.ceil(Math.log2(e.length)),i={keys:e,index_by_tag:o,tag_bits:s};return Ut.set(n,i),i}function Nt(n){const t=Lt.get(n);if(t)return t;const e=Object.keys(n);return Lt.set(n,e),e}function Dt(n){if(!n||typeof n!="object")throw new TypeError("Union value must be an object with a $ tag");const t=n.$;if(typeof t!="string")throw new TypeError("Union value must have a string $ tag");return t}function Jt(n,t){return t.$!=="Struct"&&n&&typeof n=="object"&&Object.prototype.hasOwnProperty.call(n,"value")?n.value:n}function Gt(n,t){if(!Array.isArray(n))throw new TypeError("List value must be an Array");for(let e=0;e<n.length;e++)t(n[e])}function Xt(n,t){if(n!=null){if(n instanceof Map){for(const[e,o]of n)t(e,o);return}if(typeof n=="object"){for(const e of Object.keys(n))t(e,n[e]);return}throw new TypeError("Map value must be a Map or object")}}function $e(n){if(typeof n!="string")throw new TypeError("String value must be a string");let t=0;for(let e=0;e<n.length;e++){const o=n.charCodeAt(e);if(o<128)t+=1;else if(o<2048)t+=2;else if(o>=55296&&o<=56319){const s=e+1<n.length?n.charCodeAt(e+1):0;s>=56320&&s<=57343?(e++,t+=4):t+=3}else o>=56320&&o<=57343,t+=3}return t}function Se(n,t){if(typeof t!="string")throw new TypeError("String value must be a string");for(let e=0;e<t.length;e++){let o=t.charCodeAt(e);if(o<128){n.write_bit(1),n.write_bitsUnsigned(o,8);continue}if(o<2048){n.write_bit(1),n.write_bitsUnsigned(192|o>>>6,8),n.write_bit(1),n.write_bitsUnsigned(128|o&63,8);continue}if(o>=55296&&o<=56319){const s=e+1<t.length?t.charCodeAt(e+1):0;if(s>=56320&&s<=57343){e++;const i=(o-55296<<10)+(s-56320)+65536;n.write_bit(1),n.write_bitsUnsigned(240|i>>>18,8),n.write_bit(1),n.write_bitsUnsigned(128|i>>>12&63,8),n.write_bit(1),n.write_bitsUnsigned(128|i>>>6&63,8),n.write_bit(1),n.write_bitsUnsigned(128|i&63,8);continue}o=65533}else o>=56320&&o<=57343&&(o=65533);n.write_bit(1),n.write_bitsUnsigned(224|o>>>12,8),n.write_bit(1),n.write_bitsUnsigned(128|o>>>6&63,8),n.write_bit(1),n.write_bitsUnsigned(128|o&63,8)}n.write_bit(0)}function Ne(n){let t=new Uint8Array(16),e=0;for(;n.read_bit();){const o=n.read_bitsUnsigned(8);if(e===t.length){const s=new Uint8Array(t.length*2);s.set(t),t=s}t[e++]=o}return ke.decode(t.subarray(0,e))}function Yt(n,t){const e=U(n,t),o=new Uint8Array(e+7>>>3),s=new xe(o);return L(s,n,t),o}function Zt(n,t){const e=new Ie(t);return C(e,n)}var J=53,Ct={$:"List",type:{$:"UInt",size:8}},Qt={$:"Union",variants:{get_time:{$:"Struct",fields:{}},info_time:{$:"Struct",fields:{time:{$:"UInt",size:J}}},post:{$:"Struct",fields:{room:{$:"String"},time:{$:"UInt",size:J},name:{$:"String"},payload:Ct}},info_post:{$:"Struct",fields:{room:{$:"String"},index:{$:"UInt",size:32},server_time:{$:"UInt",size:J},client_time:{$:"UInt",size:J},name:{$:"String"},payload:Ct}},load:{$:"Struct",fields:{room:{$:"String"},from:{$:"UInt",size:32}}},watch:{$:"Struct",fields:{room:{$:"String"}}},unwatch:{$:"Struct",fields:{room:{$:"String"}}},get_latest_post_index:{$:"Struct",fields:{room:{$:"String"}}},info_latest_post_index:{$:"Struct",fields:{room:{$:"String"},latest_index:{$:"Int",size:32},server_time:{$:"UInt",size:J}}}}};function Ft(n){const t=new Array(n.length);for(let e=0;e<n.length;e++)t[e]=n[e];return t}function Bt(n){const t=new Uint8Array(n.length);for(let e=0;e<n.length;e++)t[e]=n[e]&255;return t}function Re(n){switch(n.$){case"post":return{$:"post",room:n.room,time:n.time,name:n.name,payload:Ft(n.payload)};case"info_post":return{$:"info_post",room:n.room,index:n.index,server_time:n.server_time,client_time:n.client_time,name:n.name,payload:Ft(n.payload)};default:return n}}function Te(n){switch(n.$){case"post":return{$:"post",room:n.room,time:n.time,name:n.name,payload:Bt(n.payload)};case"info_post":return{$:"info_post",room:n.room,index:n.index,server_time:n.server_time,client_time:n.client_time,name:n.name,payload:Bt(n.payload)};default:return n}}function B(n){return Yt(Qt,Re(n))}function Me(n){const t=Zt(Qt,n);return Te(t)}var Rt="wss://net.studiovibi.com";function Ee(n){let t=n;try{const e=new URL(n);e.protocol==="http:"?e.protocol="ws:":e.protocol==="https:"&&(e.protocol="wss:"),t=e.toString()}catch{t=n}if(typeof window<"u"&&window.location.protocol==="https:"&&t.startsWith("ws://")){const e=`wss://${t.slice(5)}`;return console.warn(`[VibiNet] Upgrading insecure WebSocket URL "${t}" to "${e}" because the page is HTTPS.`),e}return t}function pt(){return Math.floor(Date.now())}function Ae(){return Rt}function te(){const n="_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",t=new Uint8Array(8);if(typeof crypto<"u"&&typeof crypto.getRandomValues=="function")crypto.getRandomValues(t);else for(let s=0;s<8;s++)t[s]=Math.floor(Math.random()*256);let o="";for(let s=0;s<8;s++)o+=n[t[s]%64];return o}function je(n){const t={clock_offset:1/0,lowest_ping:1/0,request_sent_at:0,last_ping:1/0},e=new Map,o=new Set,s=[];let i=!1;const r=[];let u=null,c=null,_=0,w=!1,m=null;const I=[],E=Ee(n??Ae());function x(){if(!isFinite(t.clock_offset))throw new Error("server_time() called before initial sync");return Math.floor(pt()+t.clock_offset)}function p(){u!==null&&(clearInterval(u),u=null)}function y(){c!==null&&(clearTimeout(c),c=null)}function T(){const R=Math.min(8e3,500*Math.pow(2,_)),k=Math.floor(Math.random()*250);return R+k}function O(){if(!(!m||m.readyState!==WebSocket.OPEN))for(;I.length>0;){if(!m||m.readyState!==WebSocket.OPEN)return;const f=I[0];try{m.send(f),I.shift()}catch{D();return}}}function Z(){!m||m.readyState!==WebSocket.OPEN||(t.request_sent_at=pt(),m.send(B({$:"get_time"})))}function Q(f){if(!m||m.readyState!==WebSocket.OPEN)return!1;try{return m.send(f),!0}catch{return!1}}function ft(f){Q(f)||D()}function be(f){I.push(f),D()}function zt(f,S,R){const k=e.get(f);if(k){if(k.packer!==S)throw new Error(`Packed schema already registered for room: ${f}`);R&&(k.handler=R);return}e.set(f,{handler:R,packer:S})}function ye(){if(w||c!==null)return;const f=T();c=setTimeout(()=>{c=null,_+=1,D()},f)}function D(){if(w||m&&(m.readyState===WebSocket.OPEN||m.readyState===WebSocket.CONNECTING))return;y();const f=new WebSocket(E);m=f,f.binaryType="arraybuffer",f.addEventListener("open",()=>{if(m===f){_=0,console.log("[WS] Connected"),Z(),p();for(const S of o.values())f.send(B({$:"watch",room:S}));O(),u=setInterval(Z,2e3)}}),f.addEventListener("message",S=>{const R=S.data instanceof ArrayBuffer?new Uint8Array(S.data):new Uint8Array(S.data),k=Me(R);switch(k.$){case"info_time":{const M=pt(),z=M-t.request_sent_at;if(t.last_ping=z,z<t.lowest_ping){const mt=Math.floor((t.request_sent_at+M)/2);t.clock_offset=k.time-mt,t.lowest_ping=z}if(!i){i=!0;for(const mt of r)mt();r.length=0}break}case"info_post":{const M=e.get(k.room);if(M&&M.handler){const z=Zt(M.packer,k.payload);M.handler({$:"info_post",room:k.room,index:k.index,server_time:k.server_time,client_time:k.client_time,name:k.name,data:z})}break}case"info_latest_post_index":{for(const M of s)M({room:k.room,latest_index:k.latest_index,server_time:k.server_time});break}}}),f.addEventListener("close",S=>{m===f&&(p(),m=null,!w&&(console.warn(`[WS] Disconnected (code=${S.code}); reconnecting...`),ye()))}),f.addEventListener("error",()=>{})}return D(),{on_sync:f=>{if(i){f();return}r.push(f)},watch:(f,S,R)=>{zt(f,S,R),o.add(f),ft(B({$:"watch",room:f}))},load:(f,S,R,k)=>{zt(f,R,k),ft(B({$:"load",room:f,from:S}))},get_latest_post_index:f=>{ft(B({$:"get_latest_post_index",room:f}))},on_latest_post_index:f=>{s.push(f)},post:(f,S,R)=>{const k=te(),M=Yt(R,S),z=B({$:"post",room:f,time:x(),name:k,payload:M});return I.length>0&&O(),Q(z)||be(z),k},server_time:x,ping:()=>t.last_ping,close:()=>{if(w=!0,y(),p(),m&&m.readyState===WebSocket.OPEN)for(const f of o.values())try{m.send(B({$:"unwatch",room:f}))}catch{break}m&&m.close(),m=null},debug_dump:()=>({ws_url:E,ws_ready_state:m?m.readyState:WebSocket.CLOSED,is_synced:i,reconnect_attempt:_,reconnect_scheduled:c!==null,pending_post_count:I.length,watched_rooms:Array.from(o.values()),room_watchers:Array.from(e.keys()),room_watcher_count:e.size,latest_post_index_listener_count:s.length,sync_listener_count:r.length,time_sync:{clock_offset:t.clock_offset,lowest_ping:t.lowest_ping,request_sent_at:t.request_sent_at,last_ping:t.last_ping}})}}var bt=class{constructor(t){v(this,"room"),v(this,"init"),v(this,"on_tick"),v(this,"on_post"),v(this,"packer"),v(this,"smooth"),v(this,"tick_rate"),v(this,"tolerance"),v(this,"client_api"),v(this,"remote_posts"),v(this,"local_posts"),v(this,"timeline"),v(this,"cache_enabled"),v(this,"snapshot_stride"),v(this,"snapshot_count"),v(this,"snapshots"),v(this,"snapshot_start_tick"),v(this,"initial_time_value"),v(this,"initial_tick_value"),v(this,"no_pending_posts_before_ms"),v(this,"max_contiguous_remote_index"),v(this,"cache_drop_guard_hits"),v(this,"latest_index_poll_interval_id"),v(this,"max_remote_index");const e=(c,_)=>c,o=t.smooth??e,s=t.cache??!0,i=t.snapshot_stride??8,r=t.snapshot_count??256,u=t.client??je(t.server);this.room=t.room,this.init=t.initial,this.on_tick=t.on_tick,this.on_post=t.on_post,this.packer=t.packer,this.smooth=o,this.tick_rate=t.tick_rate,this.tolerance=t.tolerance,this.client_api=u,this.remote_posts=new Map,this.local_posts=new Map,this.timeline=new Map,this.cache_enabled=s,this.snapshot_stride=Math.max(1,Math.floor(i)),this.snapshot_count=Math.max(1,Math.floor(r)),this.snapshots=new Map,this.snapshot_start_tick=null,this.initial_time_value=null,this.initial_tick_value=null,this.no_pending_posts_before_ms=null,this.max_contiguous_remote_index=-1,this.cache_drop_guard_hits=0,this.latest_index_poll_interval_id=null,this.max_remote_index=-1,this.client_api.on_latest_post_index&&this.client_api.on_latest_post_index(c=>{this.on_latest_post_index_info(c)}),this.client_api.on_sync(()=>{console.log(`[VIBI] synced; loading+watching room=${this.room}`);const c=_=>{_.name&&this.remove_local_post(_.name),this.add_remote_post(_)};this.client_api.load(this.room,0,this.packer,c),this.client_api.watch(this.room,this.packer,c),this.request_latest_post_index(),this.latest_index_poll_interval_id!==null&&clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=setInterval(()=>{this.request_latest_post_index()},2e3)})}official_time(t){return t.client_time<=t.server_time-this.tolerance?t.server_time-this.tolerance:t.client_time}official_tick(t){return this.time_to_tick(this.official_time(t))}get_bucket(t){let e=this.timeline.get(t);return e||(e={remote:[],local:[]},this.timeline.set(t,e)),e}insert_remote_post(t,e){const o=this.get_bucket(e);o.remote.push(t),o.remote.sort((s,i)=>s.index-i.index)}invalidate_from_tick(t){if(!this.cache_enabled)return;const e=this.snapshot_start_tick;if(e!==null&&t<e||e===null||this.snapshots.size===0)return;const o=this.snapshot_stride,s=e+(this.snapshots.size-1)*o;if(!(t>s)){if(t<=e){this.snapshots.clear();return}for(let i=s;i>=t;i-=o)this.snapshots.delete(i)}}advance_state(t,e,o){let s=t;for(let i=e+1;i<=o;i++)s=this.apply_tick(s,i);return s}prune_before_tick(t){if(!this.cache_enabled)return;const e=this.safe_prune_tick();e!==null&&t>e&&(this.cache_drop_guard_hits+=1,t=e);for(const o of this.timeline.keys())o<t&&this.timeline.delete(o);for(const[o,s]of this.remote_posts.entries())this.official_tick(s)<t&&this.remote_posts.delete(o);for(const[o,s]of this.local_posts.entries())this.official_tick(s)<t&&this.local_posts.delete(o)}tick_ms(){return 1e3/this.tick_rate}cache_window_ticks(){return this.snapshot_stride*Math.max(0,this.snapshot_count-1)}safe_prune_tick(){return this.no_pending_posts_before_ms===null?null:this.time_to_tick(this.no_pending_posts_before_ms)}safe_compute_tick(t){if(!this.cache_enabled)return t;const e=this.safe_prune_tick();if(e===null)return t;const o=e+this.cache_window_ticks();return Math.min(t,o)}advance_no_pending_posts_before_ms(t){const e=Math.max(0,Math.floor(t));(this.no_pending_posts_before_ms===null||e>this.no_pending_posts_before_ms)&&(this.no_pending_posts_before_ms=e)}advance_contiguous_remote_frontier(){for(;;){const t=this.max_contiguous_remote_index+1,e=this.remote_posts.get(t);if(!e)break;this.max_contiguous_remote_index=t,this.advance_no_pending_posts_before_ms(this.official_time(e))}}on_latest_post_index_info(t){if(t.room!==this.room||t.latest_index>this.max_contiguous_remote_index)return;const e=this.tick_ms(),o=t.server_time-this.tolerance-e;this.advance_no_pending_posts_before_ms(o)}request_latest_post_index(){if(this.client_api.get_latest_post_index)try{this.client_api.get_latest_post_index(this.room)}catch{}}ensure_snapshots(t,e){if(!this.cache_enabled)return;this.snapshot_start_tick===null&&(this.snapshot_start_tick=e);let o=this.snapshot_start_tick;if(o===null||t<o)return;const s=this.snapshot_stride,i=o+Math.floor((t-o)/s)*s;let r,u;if(this.snapshots.size===0)r=this.init,u=o-1;else{const w=o+(this.snapshots.size-1)*s;r=this.snapshots.get(w),u=w}let c=u+s;for(this.snapshots.size===0&&(c=o);c<=i;c+=s)r=this.advance_state(r,u,c),this.snapshots.set(c,r),u=c;const _=this.snapshots.size;if(_>this.snapshot_count){const w=_-this.snapshot_count,m=o+w*s;for(let I=o;I<m;I+=s)this.snapshots.delete(I);o=m,this.snapshot_start_tick=o}this.prune_before_tick(o)}add_remote_post(t){const e=this.official_tick(t);if(t.index===0&&this.initial_time_value===null){const s=this.official_time(t);this.initial_time_value=s,this.initial_tick_value=this.time_to_tick(s)}if(this.remote_posts.has(t.index))return;this.cache_enabled&&this.snapshot_start_tick!==null&&e<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.remote_posts.set(t.index,t),t.index>this.max_remote_index&&(this.max_remote_index=t.index),this.advance_contiguous_remote_frontier(),this.insert_remote_post(t,e),this.invalidate_from_tick(e)}add_local_post(t,e){this.local_posts.has(t)&&this.remove_local_post(t);const o=this.official_tick(e);this.cache_enabled&&this.snapshot_start_tick!==null&&o<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.local_posts.set(t,e),this.get_bucket(o).local.push(e),this.invalidate_from_tick(o)}remove_local_post(t){const e=this.local_posts.get(t);if(!e)return;this.local_posts.delete(t);const o=this.official_tick(e),s=this.timeline.get(o);if(s){const i=s.local.indexOf(e);if(i!==-1)s.local.splice(i,1);else{const r=s.local.findIndex(u=>u.name===t);r!==-1&&s.local.splice(r,1)}s.remote.length===0&&s.local.length===0&&this.timeline.delete(o)}this.invalidate_from_tick(o)}apply_tick(t,e){let o=this.on_tick(t);const s=this.timeline.get(e);if(s){for(const i of s.remote)o=this.on_post(i.data,o);for(const i of s.local)o=this.on_post(i.data,o)}return o}compute_state_at_uncached(t,e){let o=this.init;for(let s=t;s<=e;s++)o=this.apply_tick(o,s);return o}post_to_debug_dump(t){return{room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,official_time:this.official_time(t),official_tick:this.official_tick(t),data:t.data}}timeline_tick_bounds(){let t=null,e=null;for(const o of this.timeline.keys())(t===null||o<t)&&(t=o),(e===null||o>e)&&(e=o);return{min:t,max:e}}snapshot_tick_bounds(){let t=null,e=null;for(const o of this.snapshots.keys())(t===null||o<t)&&(t=o),(e===null||o>e)&&(e=o);return{min:t,max:e}}time_to_tick(t){return Math.floor(t*this.tick_rate/1e3)}server_time(){return this.client_api.server_time()}server_tick(){return this.time_to_tick(this.server_time())}post_count(){return this.max_remote_index+1}compute_render_state(){const t=this.server_tick(),e=1e3/this.tick_rate,o=Math.ceil(this.tolerance/e),s=this.client_api.ping(),i=isFinite(s)?Math.ceil(s/2/e):0,r=Math.max(o,i+1),u=Math.max(0,t-r),c=this.compute_state_at(u),_=this.compute_state_at(t);return this.smooth(c,_)}initial_time(){if(this.initial_time_value!==null)return this.initial_time_value;const t=this.remote_posts.get(0);if(!t)return null;const e=this.official_time(t);return this.initial_time_value=e,this.initial_tick_value=this.time_to_tick(e),e}initial_tick(){if(this.initial_tick_value!==null)return this.initial_tick_value;const t=this.initial_time();return t===null?null:(this.initial_tick_value=this.time_to_tick(t),this.initial_tick_value)}compute_state_at(t){t=this.safe_compute_tick(t);const e=this.initial_tick();if(e===null)return this.init;if(t<e)return this.init;if(!this.cache_enabled)return this.compute_state_at_uncached(e,t);this.ensure_snapshots(t,e);const o=this.snapshot_start_tick;if(o===null||this.snapshots.size===0)return this.init;if(t<o)return this.snapshots.get(o)??this.init;const s=this.snapshot_stride,i=o+(this.snapshots.size-1)*s,r=Math.floor((i-o)/s),u=Math.floor((t-o)/s),c=Math.min(u,r),_=o+c*s,w=this.snapshots.get(_)??this.init;return this.advance_state(w,_,t)}debug_dump(){const t=Array.from(this.remote_posts.values()).sort((p,y)=>p.index-y.index).map(p=>this.post_to_debug_dump(p)),e=Array.from(this.local_posts.values()).sort((p,y)=>{const T=this.official_tick(p),O=this.official_tick(y);if(T!==O)return T-O;const Z=p.name??"",Q=y.name??"";return Z.localeCompare(Q)}).map(p=>this.post_to_debug_dump(p)),o=Array.from(this.timeline.entries()).sort((p,y)=>p[0]-y[0]).map(([p,y])=>({tick:p,remote_count:y.remote.length,local_count:y.local.length,remote_posts:y.remote.map(T=>this.post_to_debug_dump(T)),local_posts:y.local.map(T=>this.post_to_debug_dump(T))})),s=Array.from(this.snapshots.entries()).sort((p,y)=>p[0]-y[0]).map(([p,y])=>({tick:p,state:y})),i=this.initial_time(),r=this.initial_tick(),u=this.timeline_tick_bounds(),c=this.snapshot_tick_bounds(),_=r!==null&&u.min!==null&&u.min>r;let w=null,m=null;try{w=this.server_time(),m=this.server_tick()}catch{w=null,m=null}let I=null,E=null;for(const p of this.remote_posts.keys())(I===null||p<I)&&(I=p),(E===null||p>E)&&(E=p);const x=typeof this.client_api.debug_dump=="function"?this.client_api.debug_dump():null;return{room:this.room,tick_rate:this.tick_rate,tolerance:this.tolerance,cache_enabled:this.cache_enabled,snapshot_stride:this.snapshot_stride,snapshot_count:this.snapshot_count,snapshot_start_tick:this.snapshot_start_tick,no_pending_posts_before_ms:this.no_pending_posts_before_ms,max_contiguous_remote_index:this.max_contiguous_remote_index,initial_time:i,initial_tick:r,max_remote_index:this.max_remote_index,post_count:this.post_count(),server_time:w,server_tick:m,ping:this.ping(),history_truncated:_,cache_drop_guard_hits:this.cache_drop_guard_hits,counts:{remote_posts:this.remote_posts.size,local_posts:this.local_posts.size,timeline_ticks:this.timeline.size,snapshots:this.snapshots.size},ranges:{timeline_min_tick:u.min,timeline_max_tick:u.max,snapshot_min_tick:c.min,snapshot_max_tick:c.max,min_remote_index:I,max_remote_index:E},remote_posts:t,local_posts:e,timeline:o,snapshots:s,client_debug:x}}debug_recompute(t){const e=this.initial_tick(),o=this.timeline_tick_bounds(),s=e!==null&&o.min!==null&&o.min>e;let i=t;if(i===void 0)try{i=this.server_tick()}catch{i=void 0}i===void 0&&(i=e??0);const r=this.snapshots.size;this.snapshots.clear(),this.snapshot_start_tick=null;const u=[];if(s&&u.push("Local history before timeline_min_tick was pruned; full room replay may be impossible without reloading posts."),e===null||i<e)return u.push("No replayable post range available at target tick."),{target_tick:i,initial_tick:e,cache_invalidated:!0,invalidated_snapshot_count:r,history_truncated:s,state:this.init,notes:u};const c=this.compute_state_at_uncached(e,i);return{target_tick:i,initial_tick:e,cache_invalidated:!0,invalidated_snapshot_count:r,history_truncated:s,state:c,notes:u}}post(t){const e=this.client_api.post(this.room,t,this.packer),o=this.server_time(),s={room:this.room,index:-1,server_time:o,client_time:o,name:e,data:t};this.add_local_post(e,s)}compute_current_state(){return this.compute_state_at(this.server_tick())}on_sync(t){this.client_api.on_sync(t)}ping(){return this.client_api.ping()}close(){this.latest_index_poll_interval_id!==null&&(clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=null),this.client_api.close()}static gen_name(){return te()}};v(bt,"game",bt);var Oe=bt;const Pt=220,ht=["#f25f5c","#247ba0","#70c1b3","#f7b267","#8e6c88","#5c80bc","#9bc53d","#f18f01"],ze=24,tt=[101,207,311,419,523,631,733,839,947,1051,1153,1259,1361,1471,1579,1681,1789,1891,1993,2099,2203,2309,2411,2521,2621,2729,2833,2939,3041,3149,3253,3359,3461,3571,3677,3779,3881,3989,4091,4201,4303,4409,4513,4621,4723,4831,4933,5039,5147,5251],ee=[[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[1,4],[4,7],[2,5],[5,8],[3,6],[6,9],[1,5],[5,9],[2,4],[2,6],[4,8],[6,8],[3,5],[5,7]];function g(n){return`room-${n}`}function ct(n,t){return`corridor:${n}:${t}`}function Ue(n,t){return n<t?[n,t]:[t,n]}function $(n){return JSON.parse(JSON.stringify(n))}function Le(n){return n.trim().replace(/\s+/g," ").slice(0,24)}function Ce(n){return n.trim().replace(/\s+/g,"-").slice(0,36).toLowerCase()}function Fe(n){return JSON.stringify(n)}function Be(){return{phase:"lobby",masterName:null,roster:{},publicState:null,fullState:null,actionRequests:[],consumedActionIds:[],message:null,clockTick:0,nextJoinOrder:0}}function Pe(n){return{...n,clockTick:n.clockTick+1}}function Ve(){return tt.length}function qe(){const n=tt[Math.floor(Math.random()*tt.length)]??tt[0];return Xe(n)}function Ke(n,t){let e;try{e=JSON.parse(n)}catch{return t}switch(e.$){case"join_room":return We(t,e);case"heartbeat":return De(t,e);case"claim_master":return Je(t,e);case"publish_state":return Ge(t,e);case"submit_move":return Vt(t,{id:e.requestId,type:"move",actorName:e.actorName,corridorId:e.corridorId},e.name,e.sessionId);case"select_kill_target":return Vt(t,{id:e.requestId,type:"kill",actorName:e.actorName,targetName:e.targetName},e.name,e.sessionId);default:return t}}function He(n,t,e){const o=new Set(e.consumedActionIds),s=Tt(e),i=Object.values(e.roster).sort((c,_)=>c.joinedAt-_.joinedAt).map(c=>{const _=e.fullState?.players[c.name],w=e.masterName===c.name,m=_?.seat??c.seat,I=_?.role??(w?"master":m==="spectator"?"spectator":"player");return{name:c.name,color:_?.color??c.color,joinedAt:_?.joinedAt??c.joinedAt,connected:yt(e,c),seat:m,isMaster:w,role:I,alive:_?.alive??!1}}),r=i.find(c=>c.name===t)??null,u=e.actionRequests.filter(c=>!o.has(c.id));return{room:n,selfName:t,phase:e.phase,masterName:e.masterName,controllerName:s,players:i,publicState:e.publicState,fullState:e.fullState,canClaimMaster:e.phase==="lobby"&&!e.masterName&&r?.seat!=="spectator",canBecomeMaster:!1,swapMode:"none",swapVotes:[],eligibleNames:[],message:e.message,pendingActions:u}}function We(n,t){const e=$(n),o=e.roster[t.name];if(o)return o.activeSessionId=t.sessionId,o.lastSeenTick=e.clockTick,e.message=null,e;const s=e.nextJoinOrder+1,i={name:t.name,color:ht[e.nextJoinOrder%ht.length]??ht[0],joinedAt:s,seat:e.phase==="lobby"?"participant":"spectator",activeSessionId:t.sessionId,lastSeenTick:e.clockTick};return e.nextJoinOrder+=1,e.roster[i.name]=i,e.message=e.phase==="lobby"?null:"Partida em andamento. Novo ingresso como espectador.",e}function De(n,t){if(!lt(n,t.name,t.sessionId))return n;const e=$(n),o=e.roster[t.name];return o?(o.lastSeenTick=e.clockTick,e):n}function Je(n,t){if(n.phase!=="lobby"||n.masterName||!lt(n,t.name,t.sessionId))return n;const e=$(n);return e.masterName=t.name,e.message=`${t.name} virou mestre.`,e}function Ge(n,t){if(Tt(n)!==t.name||!lt(n,t.name,t.sessionId))return n;const e=$(n);e.fullState=$(t.fullState),e.publicState=$(t.publicState),e.phase=t.fullState.phase,e.masterName=t.fullState.masterName??e.masterName,e.message=null;const o=new Set(e.consumedActionIds);for(const s of t.consumedActionIds)o.add(s);e.consumedActionIds=[...o].slice(-256),e.actionRequests=e.actionRequests.filter(s=>!o.has(s.id)),e.phase==="lobby"&&(e.actionRequests=[],e.consumedActionIds=[]);for(const s of Object.values(e.fullState.players)){const i=e.roster[s.name]??{name:s.name,color:s.color,joinedAt:s.joinedAt,seat:s.seat,activeSessionId:null,lastSeenTick:-99999};i.color=s.color,i.joinedAt=s.joinedAt,i.seat=s.seat,e.roster[s.name]=i}return e}function Vt(n,t,e,o){if(n.phase!=="running"||!lt(n,e,o)||e!==t.actorName&&Tt(n)!==e||n.actionRequests.some(i=>i.id===t.id)||n.consumedActionIds.includes(t.id))return n;const s=$(n);return s.actionRequests.push(t),s}function lt(n,t,e){return n.roster[t]?.activeSessionId===e}function yt(n,t){return t.activeSessionId?n.clockTick-t.lastSeenTick<=ze:!1}function Tt(n){if(n.masterName){const e=n.roster[n.masterName];if(e&&yt(n,e))return n.masterName}return Object.values(n.roster).filter(e=>e.seat==="participant"&&yt(n,e)).sort((e,o)=>e.joinedAt-o.joinedAt)[0]?.name??null}function Xe(n){const t=Ze(n),e=Mt().rooms,o={},s=Object.keys(e).sort(),i=new Set,r=[],u=Ye(),c=g(1+Math.floor(t()*s.length));for(i.add(c),r.push(...u.get(c)??[]);i.size<s.length&&r.length>0;){const x=Math.floor(t()*r.length),[p,y]=r.splice(x,1)[0]??[];if(!p||!y||i.has(y))continue;i.add(y);const T=it(e[p],e[y]);o[T.id]=T;for(const O of u.get(y)??[])i.has(O[1])||r.push(O)}const _=qt(ee.map(([x,p])=>[g(x),g(p)]),t),w=3+Math.floor(t()*5);for(const[x,p]of _){if(Object.keys(o).length>=s.length-1+w)break;const y=it(e[x],e[p]);o[y.id]=y}const m=1+Math.floor(t()*3),I=qt(s.map(x=>[x,x]),t);for(let x=0;x<m;x+=1){const p=I[x]?.[0];p&&(e[p].type="shop")}const E=Math.floor(t()*2);for(let x=0;x<E;x+=1){const p=I[m+x]?.[0];if(!p)continue;const y=ct(p,p);o[y]={id:y,fromRoomId:p,toRoomId:p,angleFrom:0,angleTo:0}}return{rooms:e,corridors:o}}function Ye(){const n=new Map;for(const[t,e]of ee){const o=g(t),s=g(e);n.set(o,[...n.get(o)??[],[o,s]]),n.set(s,[...n.get(s)??[],[s,o]])}return n}function qt(n,t){const e=[...n];for(let o=e.length-1;o>0;o-=1){const s=Math.floor(t()*(o+1)),i=e[o];e[o]=e[s],e[s]=i}return e}function Ze(n){let t=n>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function st(n,t){const e=Math.atan2(t.y-n.y,t.x-n.x);return Math.round((e*180/Math.PI+360)%360)}function ne(n,t,e,o="normal"){return{id:n,x:t,y:e,type:o}}function Mt(){const n={},t={};for(let o=0;o<3;o+=1)for(let s=0;s<3;s+=1){const i=o*3+s+1,r=g(i);n[r]=ne(r,180+s*Pt,160+o*Pt)}const e=[[g(1),g(2)],[g(2),g(3)],[g(4),g(5)],[g(5),g(6)],[g(7),g(8)],[g(8),g(9)],[g(1),g(4)],[g(4),g(7)],[g(2),g(5)],[g(5),g(8)],[g(3),g(6)],[g(6),g(9)],[g(1),g(5)],[g(5),g(9)]];for(const[o,s]of e){const i=it(n[o],n[s]);t[i.id]=i}return{rooms:n,corridors:t}}function Qe(n,t,e){const{rooms:o,corridors:s}=Mt(),i={};for(const r of t)i[r.name]={name:r.name,color:r.color,joinedAt:r.joinedAt,seat:r.seat,role:r.isMaster?"master":r.seat==="spectator"?"spectator":"player",alive:!1,locationRoomId:null,hasFullInfo:r.isMaster||r.seat==="spectator"};return{phase:"lobby",masterName:e,foxName:null,foxCandidateName:null,round:0,currentTurnName:null,players:i,rooms:o,corridors:s,henOrder:[],pendingKillTargets:[]}}function Et(n,t,e){const o=$(n);o.masterName=e;for(const s of t){const i=o.players[s.name],r=s.isMaster?"master":s.seat==="spectator"?"spectator":i?.role&&i.role!=="spectator"?i.role:"player";o.players[s.name]={name:s.name,color:s.color,joinedAt:s.joinedAt,seat:s.seat,role:r,alive:i?.alive??!1,locationRoomId:i?.locationRoomId??null,hasFullInfo:s.isMaster||s.seat==="spectator"||i?.hasFullInfo===!0}}for(const s of Object.keys(o.players))t.find(i=>i.name===s)||(o.players[s].seat="participant");if(e)for(const s of Object.values(o.players))s.name===e&&(s.role="master",s.hasFullInfo=!0,s.alive=!1,s.locationRoomId=null);return o}function it(n,t){const e=st(n,t),o=st(t,n);return{id:ct(n.id,t.id),fromRoomId:n.id,toRoomId:t.id,angleFrom:e,angleTo:o}}function tn(n,t,e){const o=$(n),[s,i]=Ue(t,e),r=ct(s,i);if(o.corridors[r])return delete o.corridors[r],o;const u=o.rooms[t],c=o.rooms[e];return!u||!c?n:(o.corridors[r]=it(u,c),o)}function en(n){const t=$(n),e=Object.keys(t.rooms).map(s=>Number(s.split("-")[1]??0)),o=g((Math.max(0,...e)||0)+1);return t.rooms[o]=ne(o,320,320,"normal"),t}function nn(n,t){const e=$(n);delete e.rooms[t];for(const o of Object.keys(e.corridors)){const s=e.corridors[o];(s.fromRoomId===t||s.toRoomId===t)&&delete e.corridors[o]}for(const o of Object.values(e.players))o.locationRoomId===t&&(o.locationRoomId=null);return e}function on(n,t,e,o){const s=$(n),i=s.rooms[t];if(!i)return n;i.x=e,i.y=o;for(const r of Object.values(s.corridors))if(r.fromRoomId===t||r.toRoomId===t){const u=s.rooms[r.fromRoomId],c=s.rooms[r.toRoomId];r.angleFrom=st(u,c),r.angleTo=st(c,u)}return s}function sn(n,t){const e=$(n),o=e.rooms[t];return o?(o.type=o.type==="normal"?"shop":"normal",e):n}function rn(n,t){const e=$(n),o=ct(t,t);return e.corridors[o]?(delete e.corridors[o],e):(e.corridors[o]={id:o,fromRoomId:t,toRoomId:t,angleFrom:0,angleTo:0},e)}function an(n){const t=$(n),e=Object.values(t.players).filter(s=>s.seat==="participant"&&s.role!=="master").sort((s,i)=>s.joinedAt-i.joinedAt);if(e.length===0)return t.foxCandidateName=null,t;const o=Math.floor(Math.random()*e.length);return t.foxCandidateName=e[o]?.name??null,t}function cn(n,t){const e=$(n);return e.foxCandidateName=t,e}function ln(n,t){const e=Et(n,t,n.masterName),o=t.filter(c=>c.seat==="participant"&&!c.isMaster&&c.connected).sort((c,_)=>c.joinedAt-_.joinedAt);if(o.length<2||o.length>8)return null;const s=e.foxCandidateName&&o.find(c=>c.name===e.foxCandidateName)?e.foxCandidateName:o[Math.floor(Math.random()*o.length)]?.name??null;if(!s)return null;const i=Object.keys(e.rooms);if(i.length===0)return null;const r=[...i].sort(()=>Math.random()-.5),u=o.filter(c=>c.name!==s).map(c=>c.name);o.forEach((c,_)=>{const w=e.players[c.name];w.alive=!0,w.locationRoomId=r[_%r.length]??i[0]??null,w.role=c.name===s?"fox":"hen",w.hasFullInfo=!1});for(const c of Object.values(e.players))c.role==="spectator"&&(c.alive=!1,c.hasFullInfo=!0,c.locationRoomId=null),c.role==="master"&&(c.hasFullInfo=!0,c.alive=!1,c.locationRoomId=null);return e.phase="running",e.round=1,e.foxName=s,e.pendingKillTargets=[],e.henOrder=u,e.currentTurnName=u[0]??s,e}function un(n,t){const e=Et(n,t,n.masterName);e.phase="lobby",e.foxName=null,e.foxCandidateName=null,e.round=0,e.currentTurnName=null,e.pendingKillTargets=[],e.henOrder=[];for(const o of Object.values(e.players))o.role!=="master"&&o.seat==="participant"?(o.role="player",o.alive=!1,o.locationRoomId=null,o.hasFullInfo=!1):o.seat==="spectator"&&(o.role="spectator",o.alive=!1,o.locationRoomId=null,o.hasFullInfo=!0);return e}function dn(n,t){const e={},o=Object.values(n.players).filter(s=>s.role==="hen"||s.role==="fox").sort((s,i)=>s.joinedAt-i.joinedAt).map(s=>s.name);for(const s of o){const i=n.players[s],r=i.locationRoomId,u=r?n.rooms[r]:null,c=r?Object.values(n.players).filter(_=>_.locationRoomId===r&&_.alive).map(_=>{const w=t.find(m=>m.name===_.name);return{name:_.name,color:_.color,role:_.role,alive:_.alive,connected:w?.connected??!1}}):[];e[s]={name:s,roomId:r,roomType:u?.type??null,playersHere:c,exits:r?_n(n,r):[],alive:i.alive,connected:t.find(_=>_.name===s)?.connected??!1,canAct:n.currentTurnName===s}}return{phase:n.phase,round:n.round,currentTurnName:n.currentTurnName,screens:e,watchOrder:o,pendingKillTargets:[...n.pendingKillTargets]}}function _n(n,t){return Object.values(n.corridors).flatMap(e=>e.fromRoomId===t&&e.toRoomId===t?[{corridorId:e.id,angle:e.angleFrom,leadsToSelf:!0}]:e.fromRoomId===t?[{corridorId:e.id,angle:e.angleFrom,leadsToSelf:!1}]:e.toRoomId===t?[{corridorId:e.id,angle:e.angleTo,leadsToSelf:!1}]:[]).sort((e,o)=>e.angle-o.angle)}function oe(n,t,e){if(n.phase!=="running"||n.currentTurnName!==t||n.pendingKillTargets.length>0)return n;const o=$(n),s=o.players[t];if(!s||!s.alive)return n;if(e===null)return et(o);const i=o.corridors[e];if(!i||!s.locationRoomId)return n;if(i.fromRoomId===s.locationRoomId&&i.toRoomId===s.locationRoomId)s.locationRoomId=i.toRoomId;else if(i.fromRoomId===s.locationRoomId)s.locationRoomId=i.toRoomId;else if(i.toRoomId===s.locationRoomId)s.locationRoomId=i.fromRoomId;else return n;if(s.role==="fox"){const r=fn(o,s.locationRoomId);return r.length===0?et(o):r.length===1?ie(o,r[0]??""):(o.pendingKillTargets=r,o)}return et(o)}function se(n,t,e){if(n.phase!=="running"||n.currentTurnName!==t||n.pendingKillTargets.length===0||!n.pendingKillTargets.includes(e))return n;const o=$(n);return ie(o,e)}function ie(n,t){const e=n.players[t];return e?(e.alive=!1,e.hasFullInfo=!0,n.pendingKillTargets=[],Object.values(n.players).some(s=>s.role==="hen"&&s.alive)?et(n):(n.phase="game_over",n.currentTurnName=null,n)):n}function fn(n,t){return t?Object.values(n.players).filter(e=>e.role==="hen"&&e.alive&&e.locationRoomId===t).map(e=>e.name):[]}function et(n){const e=[...n.henOrder.filter(i=>n.players[i]?.alive),...n.foxName&&n.players[n.foxName]?.alive?[n.foxName]:[]];if(e.length===0)return n.phase="game_over",n.currentTurnName=null,n;const o=n.currentTurnName?e.indexOf(n.currentTurnName):-1,s=o+1;return o===-1||s>=e.length?(n.round=Math.max(1,n.round)+(o===-1?0:1),n.currentTurnName=e[0]??null):n.currentTurnName=e[s]??null,n.pendingKillTargets=[],n}const re="vibi-maze-name",ae="vibi-maze-room",ce="vibi-maze-session",rt=900,at=660,mn=200,pn=2500,hn={$:"String"},vt=new URLSearchParams(window.location.search),l={roomInput:vt.get("room")??window.localStorage.getItem(ae)??"galinheiro-1",nameInput:vt.get("name")??window.localStorage.getItem(re)??"",followTurn:!0,watchName:null,sideRailOpen:!0,revealFullMap:!1,selectedRoomId:null,connectSourceRoomId:null,dragRoomId:null,toast:""};let j=null,X="idle",wt=null,kt=null,V=In(),K=null,H=null,xt=null,a=null,It="",d=null,$t="",nt="";const le=document.querySelector("#app");if(!le)throw new Error("Elemento #app não encontrado.");const q=le;q.addEventListener("submit",n=>{const t=n.target;t instanceof HTMLFormElement&&t.dataset.form==="join"&&(n.preventDefault(),gn())});q.addEventListener("input",n=>{const t=n.target;t instanceof HTMLInputElement&&(t.name==="room"&&(l.roomInput=t.value),t.name==="name"&&(l.nameInput=t.value))});q.addEventListener("change",n=>{const t=n.target;if(t instanceof HTMLElement){if(t instanceof HTMLSelectElement&&t.dataset.action==="fox-select"){if(!d)return;d=cn(d,t.value),N(),b()}t instanceof HTMLInputElement&&t.dataset.action==="follow-toggle"&&(l.followTurn=t.checked,l.followTurn&&(l.watchName=a?.publicState?.currentTurnName??a?.selfName??null),b())}});q.addEventListener("click",async n=>{const t=n.target;if(!(t instanceof HTMLElement))return;const e=t.closest("[data-action]");if(!e)return;const o=e.dataset.action;if(o)switch(o){case"claim-master":if(!a)return;W({$:"claim_master",name:a.selfName,sessionId:V});break;case"copy-link":await Dn();break;case"toggle-rail":l.sideRailOpen=!l.sideRailOpen,b();break;case"watch-screen":l.watchName=e.dataset.name??a?.selfName??null,l.followTurn=!1,b();break;case"self-screen":l.watchName=a?.selfName??null,l.followTurn=!1,b();break;case"reveal-full-map":l.revealFullMap=!0,b();break;case"vote-swap-master":case"become-master":case"abandon-match":A("Troca de mestre nao existe nesta branch.");break;case"editor-add-room":if(!d)return;d=en(d),N(),b();break;case"editor-default":if(!d)return;{const s=Mt();d={...d,rooms:s.rooms,corridors:s.corridors}}N(),b();break;case"random-map":if(!d)return;{const s=qe();d={...d,rooms:s.rooms,corridors:s.corridors}}A(`Mapa aleatorio aplicado. Biblioteca: ${Ve()} mapas.`),N(),b();break;case"editor-connect":l.connectSourceRoomId=l.selectedRoomId,b();break;case"editor-cycle-type":if(!d||!l.selectedRoomId)return;d=sn(d,l.selectedRoomId),N(),b();break;case"editor-remove-room":if(!d||!l.selectedRoomId)return;d=nn(d,l.selectedRoomId),l.selectedRoomId=null,l.connectSourceRoomId=null,N(),b();break;case"editor-loop":if(!d||!l.selectedRoomId)return;d=rn(d,l.selectedRoomId),N(),b();break;case"shuffle-fox":if(!d)return;d=an(d),N(),b();break;case"start-game":if(!d||!a)return;{const s=ln(d,a.players);if(!s){A("Precisa de pelo menos 2 jogadores conectados para iniciar.");return}d=s,l.revealFullMap=!1}N(),b();break;case"back-to-lobby":if(!d||!a)return;d=un(d,a.players),l.revealFullMap=!1,N(),b();break;case"submit-pass":Kt(null);break;case"submit-move":Kt(e.dataset.corridorId??null);break;case"kill-target":vn(e.dataset.targetName??"");break}});window.addEventListener("keydown",n=>{n.key==="Escape"&&a&&(l.watchName=a.selfName,l.followTurn=!1,b())});b();function gn(){const n=Ce(l.roomInput),t=Le(l.nameInput);if(!n||!t){A("Informe room e nome.");return}l.roomInput=n,l.nameInput=t,window.localStorage.setItem(ae,n),window.localStorage.setItem(re,t),wt=n,kt=t,V=_e(),xn(),a=null,It="",xt=null,d=null,$t="",nt="",X="connecting";const e={room:n,initial:Be(),on_tick:Pe,on_post:Ke,packer:hn,tick_rate:6,tolerance:300},o=Ot();o!==Rt&&(e.server=o),j=new Oe.game(e),j.on_sync(()=>{X="connected",W({$:"join_room",name:t,sessionId:V}),kn(),ue(),b()}),b()}function ue(){if(!j||!wt||!kt)return;xt=j.compute_render_state();const n=He(wt,kt,xt);if(n.fullState){const e=JSON.stringify(n.fullState);e!==nt&&!l.dragRoomId&&(nt=e,(!d||n.controllerName!==n.selfName)&&(d=$(n.fullState)))}else nt="";a=n,bn();const t=JSON.stringify(a);t!==It&&(It=t,b())}function bn(){if(!a)return;if(Y()){const t=d??a.fullState??Qe(a.room,a.players,a.masterName);d=Et(t,a.players,a.masterName),yn()||N()}const n=ut();n&&n.seat==="spectator"&&a.phase!=="lobby"&&(l.revealFullMap=!0),l.followTurn?l.watchName=a.publicState?.currentTurnName??a.selfName:l.watchName||(l.watchName=a.selfName)}function yn(){if(!a||!d)return!1;const n=a.pendingActions;if(n.length===0)return!1;let t=d;const e=[];for(const o of n)t=o.type==="move"?oe(t,o.actorName,o.corridorId):se(t,o.actorName,o.targetName),e.push(o.id);return d=t,N(e),b(),!0}function N(n=[]){if(!a||!d||!Y())return;const t=dn(d,a.players),e=$(d),o=JSON.stringify({fullState:e,publicState:t,consumedActionIds:n});o!==$t&&($t=o,W({$:"publish_state",name:a.selfName,sessionId:V,fullState:e,publicState:t,consumedActionIds:n}))}function Kt(n){if(!a)return;const t=At();if(t){if(Y()){if(!d)return;d=oe(d,t,n),N(),b();return}W({$:"submit_move",name:a.selfName,sessionId:V,actorName:t,requestId:fe(),corridorId:n})}}function vn(n){if(!a||!n)return;const t=At();if(t){if(Y()){if(!d)return;d=se(d,t,n),N(),b();return}W({$:"select_kill_target",name:a.selfName,sessionId:V,actorName:t,requestId:fe(),targetName:n})}}function At(){return a?.publicState?.currentTurnName?wn()?a.selfName:de()?a.publicState.currentTurnName:null:null}function wn(){return a?.publicState?.currentTurnName?a.publicState.currentTurnName===a.selfName:!1}function de(){if(!Y()||!a?.publicState?.currentTurnName)return!1;const n=a;return n.players.find(e=>e.name===n.publicState?.currentTurnName)?.connected===!1}function W(n){if(!j){A("Sem conexao com o VibiNet.");return}j.post(Fe(n))}function kn(){K!==null&&window.clearInterval(K),H!==null&&window.clearInterval(H),K=window.setInterval(()=>{ue()},mn),H=window.setInterval(()=>{a&&W({$:"heartbeat",name:a.selfName,sessionId:V})},pn)}function xn(){K!==null&&(window.clearInterval(K),K=null),H!==null&&(window.clearInterval(H),H=null),j?.close(),j=null,X="closed"}function In(){const n=window.sessionStorage.getItem(ce);return n||_e()}function _e(){const n=typeof crypto.randomUUID=="function"?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;return window.sessionStorage.setItem(ce,n),n}function fe(){return`req-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function b(){if(!a){q.innerHTML=$n();return}q.innerHTML=`
    <main class="app-shell">
      ${Pn()}
      <section class="main-column">
        ${Sn()}
        ${Nn()}
        ${Rn()}
      </section>
      <aside class="right-column">
        ${Cn()}
        ${Fn()}
        ${Bn()}
      </aside>
      ${Vn()}
    </main>
  `,Kn()}function $n(){return`
    <main class="join-shell">
      <section class="join-card">
        <p class="eyebrow">Room + Nome</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Entre em uma sala, escolha um mestre e monte o labirinto antes da raposa sair caçando.
        </p>
        <form data-form="join" class="join-form">
          <label class="field">
            <span>Room</span>
            <input name="room" value="${h(l.roomInput)}" maxlength="36" />
          </label>
          <label class="field">
            <span>Nome</span>
            <input name="name" value="${h(l.nameInput)}" maxlength="24" />
          </label>
          <button class="btn btn-primary" type="submit">
            ${X==="connecting"?"Conectando...":"Entrar"}
          </button>
        </form>
        <p class="helper">
          Servidor VibiNet: <code>${h(Ot())}</code>
        </p>
        ${l.toast?`<p class="toast">${h(l.toast)}</p>`:""}
      </section>
    </main>
  `}function Sn(){if(!a)return"";const t=ut()?.role??"player";return`
    <header class="header-card">
      <div>
        <p class="eyebrow">Open Info / UI Oculta</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Room <code>${h(a.room)}</code> • voce é
          <strong>${h(dt(t))}</strong>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" data-action="copy-link" type="button">Copiar link</button>
        ${a.canClaimMaster?'<button class="btn btn-primary" data-action="claim-master" type="button">Virar mestre</button>':""}
      </div>
    </header>
  `}function Nn(){if(!a)return"";const n=a,t=n.publicState?.currentTurnName?n.players.find(e=>e.name===n.publicState?.currentTurnName):null;return`
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${h(ge(n.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">VEZ</p>
        <strong style="${t?`color:${t.color}`:""}">
          ${h(t?.name??"Aguardando")}
        </strong>
      </div>
      <label class="follow-toggle">
        <input data-action="follow-toggle" type="checkbox" ${l.followTurn?"checked":""} />
        acompanhar a vez automaticamente
      </label>
    </section>
  `}function Rn(){return a?a.phase==="lobby"?`
      <section class="phase-grid">
        <div class="panel spacious">
          ${he()?En():Tn()}
        </div>
        <div class="panel">
          ${Mn()}
        </div>
      </section>
    `:`
    <section class="phase-grid running">
      <div class="panel spacious">
        ${Hn()?An():On()}
      </div>
      <div class="panel">
        ${Ln()}
      </div>
    </section>
  `:""}function Tn(){const n=pe()&&!F();return`
    <div class="empty-panel">
      <h2>${n?"Pronto para partida rapida":"Aguardando mestre"}</h2>
      <p>
        ${n?"Ninguem virou mestre. Como primeiro jogador conectado, voce pode sortear um mapa salvo e iniciar com 2 ou mais pessoas.":"Quando alguem assumir o papel de mestre, essa pessoa vai editar o labirinto e escolher quem sera a raposa."}
      </p>
    </div>
  `}function Mn(){if(!a)return"";const n=pe(),t=a.players.filter(e=>!e.isMaster&&e.seat==="participant").sort((e,o)=>e.joinedAt-o.joinedAt).map(e=>`<option value="${h(e.name)}">${h(e.name)}</option>`).join("");return`
    <section class="stack">
      <h2 class="section-title">Sala</h2>
      <p class="metric"><strong>Jogadores ativos:</strong> ${a.players.filter(e=>e.seat==="participant").length}</p>
      <p class="metric"><strong>Mestre:</strong> ${h(a.masterName??"ninguem")}</p>
      <p class="metric"><strong>Controller:</strong> ${h(a.controllerName??"aguardando jogadores")}</p>
      ${n?`
            <label class="field">
              <span>Raposa</span>
              <select data-action="fox-select">
                <option value="">Escolher depois</option>
                ${t}
              </select>
            </label>
            <div class="button-row">
              <button class="btn btn-secondary" data-action="random-map" type="button">Mapa aleatorio</button>
              <button class="btn btn-secondary" data-action="shuffle-fox" type="button">Sortear raposa</button>
              <button class="btn btn-primary" data-action="start-game" type="button">Play</button>
            </div>
            ${F()?'<p class="helper">Como mestre, voce tambem pode editar o labirinto manualmente.</p>':'<p class="helper">Sem mestre explicito, o primeiro jogador conectado controla apenas o sorteio e o inicio.</p>'}
          `:`
            <p class="helper">Voce continua esperando no lobby enquanto o controller atual prepara a partida.</p>
          `}
    </section>
  `}function En(){if(!d||!a)return"";const n=l.selectedRoomId?d.rooms[l.selectedRoomId]:null,t=F()?"Editor do mestre":"Editor do controller",e=F()?"Arraste salas, conecte pares e monte o labirinto antes do inicio.":"Sem mestre explicito, o controller atual pode editar o labirinto antes do inicio.";return`
    <section class="editor-shell">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${t}</h2>
          <p class="helper">${e}</p>
        </div>
        <div class="button-row tight">
          <button class="btn btn-secondary" data-action="editor-add-room" type="button">Nova sala</button>
          <button class="btn btn-secondary" data-action="editor-default" type="button">Mapa 3x3</button>
          <button class="btn btn-secondary" data-action="random-map" type="button">Mapa aleatorio</button>
        </div>
      </div>
      <svg class="editor-map" data-editor-svg viewBox="0 0 ${rt} ${at}">
        ${me(d)}
      </svg>
      <div class="editor-toolbar">
        <div class="metric-block">
          <strong>Sala selecionada</strong>
          <span>${h(n?.id??"nenhuma")}</span>
        </div>
        <div class="metric-block">
          <strong>Tipo</strong>
          <span>${h(n?.type??"-")}</span>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary" data-action="editor-connect" type="button" ${n?"":"disabled"}>
            ${l.connectSourceRoomId?"Clique em outra sala":"Conectar"}
          </button>
          <button class="btn btn-secondary" data-action="editor-cycle-type" type="button" ${n?"":"disabled"}>
            Alternar tipo
          </button>
          <button class="btn btn-secondary" data-action="editor-loop" type="button" ${n?"":"disabled"}>
            Loop
          </button>
          <button class="btn btn-danger" data-action="editor-remove-room" type="button" ${n?"":"disabled"}>
            Remover
          </button>
        </div>
      </div>
    </section>
  `}function An(){if(!d)return'<div class="empty-panel"><h2>Sem mapa completo</h2></div>';const n=F();return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${F()?"Mapa mestre":"Visao completa"}</h2>
          <p class="helper">
            ${F()?"Voce enxerga tudo o tempo todo.":"Agora voce pode assistir a partida inteira."}
          </p>
        </div>
        ${n?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${rt} ${at}">
        ${me(d)}
      </svg>
      ${jn()}
    </section>
  `}function jn(){return a?`
    <div class="legend-grid">
      ${a.players.map(n=>`
          <div class="legend-chip">
            <span class="legend-color" style="background:${n.color}"></span>
            <strong>${h(n.name)}</strong>
            <span>${h(dt(n.role))}</span>
          </div>
        `).join("")}
    </div>
  `:""}function On(){if(!a?.publicState)return'<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';const n=l.watchName??a.selfName,t=a.publicState.screens[n]??null,e=a.fullState?.players[a.selfName],o=!!(e&&!e.alive&&e.seat==="participant"&&!l.revealFullMap);if(!t)return`
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${o?'<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
      </div>
    `;const i=At()===n,r=i&&a.publicState.pendingKillTargets.length===0,u=i&&a.publicState.pendingKillTargets.length>0;return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${h(t.name)}</h2>
          <p class="helper">
            ${h(t.roomType?`Sala ${_t(t.roomType)}`:"Sem posicao visivel")}
          </p>
        </div>
        ${o?'<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
      </div>
      ${Un(t,r)}
      ${u?zn(a.publicState.pendingKillTargets):`
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${r?"":"disabled"}>Passar</button>
            </div>
          `}
    </section>
  `}function zn(n){return`
    <div class="kill-picker">
      <strong>Raposa escolhe quem cai:</strong>
      <div class="button-row">
        ${n.map(t=>`
            <button class="btn btn-danger" data-action="kill-target" data-target-name="${h(t)}" type="button">
              ${h(t)}
            </button>
          `).join("")}
      </div>
    </div>
  `}function Un(n,t){const e=Wn(n.exits);return`
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${h(n.roomType?_t(n.roomType):"Sem sala")}</div>
        ${e.map((o,s)=>`
            <button
              class="exit-btn"
              style="left:${o.left}%;top:${o.top}%;"
              data-action="submit-move"
              data-corridor-id="${h(o.corridorId)}"
              type="button"
              ${t?"":"disabled"}
            >
              <span class="exit-arrow" style="transform:rotate(${o.angle}deg)">➜</span>
              <small>${o.angle}°</small>
            </button>
          `).join("")}
        <div class="stickman-row">
          ${n.playersHere.map(o=>qn(o.name,o.color)).join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${n.playersHere.length||0}</p>
        <p><strong>Saidas:</strong> ${n.exits.map(o=>`${o.angle}°`).join(", ")||"nenhuma"}</p>
      </div>
    </section>
  `}function Ln(){if(!a)return"";const n=l.watchName??a.selfName,t=a.publicState?.currentTurnName??"Aguardando",e=ut(),o=de();return`
    <section class="stack">
      <h2 class="section-title">Partida</h2>
      <p class="metric"><strong>Rodada:</strong> ${a.publicState?.round??0}</p>
      <p class="metric"><strong>Na tela:</strong> ${h(n)}</p>
      <p class="metric"><strong>Turno atual:</strong> ${h(t)}</p>
      <p class="metric"><strong>Status:</strong> ${h(ge(a.phase))}</p>
      ${o?`<p class="notice">Jogador atual caiu. O mestre pode agir por <strong>${h(t)}</strong>.</p>`:""}
      ${e&&e.role==="spectator"?'<p class="helper">Voce entrou depois do inicio e esta vendo a partida como espectador total.</p>':""}
      ${l.toast?`<p class="toast">${h(l.toast)}</p>`:""}
    </section>
  `}function Cn(){if(!a)return"";const n=a;return`
    <section class="panel stack">
      <h2 class="section-title">Jogadores</h2>
      <ul class="roster">
        ${n.players.map(t=>`
              <li class="roster-item ${t.name===n.selfName?"is-self":""}">
                <span class="legend-color" style="background:${t.color}"></span>
                <div>
                  <strong>${h(t.name)}</strong>
                  <div class="helper">${h(dt(t.role))} • ${t.connected?"online":"offline"}</div>
                </div>
                <span class="tag">${t.alive?"vivo":t.seat==="spectator"?"spec":"fora"}</span>
              </li>
            `).join("")}
      </ul>
    </section>
  `}function Fn(){return a?`
    <section class="panel stack">
      <h2 class="section-title">Visoes</h2>
      <p class="helper">A barra da esquerda mostra as telas limitadas de cada jogador ativo.</p>
      <div class="button-row">
        <button class="btn btn-secondary" data-action="toggle-rail" type="button">
          ${l.sideRailOpen?"Fechar telas":"Abrir telas"}
        </button>
        <button class="btn btn-secondary" data-action="self-screen" type="button">
          Voltar para minha tela
        </button>
      </div>
      <p class="helper">Pressione <code>Esc</code> para voltar imediatamente para a propria tela.</p>
    </section>
  `:""}function Bn(){return a?`
    <section class="panel stack">
      <h2 class="section-title">Conexao</h2>
      <p class="metric"><strong>Servidor:</strong> ${h(Ot())}</p>
      <p class="metric"><strong>Estado:</strong> ${h(X)}</p>
      <p class="metric"><strong>Ping:</strong> ${Math.round(j?.ping?.()??0)} ms</p>
      ${a.message?`<p class="notice">${h(a.message)}</p>`:""}
    </section>
  `:""}function Pn(){if(!a?.publicState)return`<aside class="side-rail ${l.sideRailOpen?"":"collapsed"}"></aside>`;const n=a,t=n.publicState,e=[n.selfName,...t.watchOrder.filter(o=>o!==n.selfName)];return`
    <aside class="side-rail ${l.sideRailOpen?"":"collapsed"}">
      <div class="side-rail-header">
        <strong>Telas</strong>
        <button class="ghost-btn" data-action="toggle-rail" type="button">${l.sideRailOpen?"←":"→"}</button>
      </div>
      ${e.map(o=>{const s=t.screens[o],i=n.players.find(r=>r.name===o);return`
            <button
              class="screen-card ${l.watchName===o?"active":""}"
              data-action="watch-screen"
              data-name="${h(o)}"
              type="button"
            >
              <div class="screen-card-header">
                <span class="legend-color" style="background:${i?.color??"#000"}"></span>
                <strong>${h(o)}</strong>
              </div>
              <div class="screen-card-body">
                <span>${h(dt(i?.role??"player"))}</span>
                <span>${h(s?.roomType?_t(s.roomType):"sem sala")}</span>
                <span>${h(s?`${s.exits.length} saidas`:"-")}</span>
              </div>
            </button>
          `}).join("")}
    </aside>
  `}function Vn(){return""}function me(n,t){const e=new Map;for(const o of Object.values(n.players))o.locationRoomId&&(e.has(o.locationRoomId)||e.set(o.locationRoomId,[]),e.get(o.locationRoomId)?.push({name:o.name,color:o.color,role:o.role}));return`
    ${Object.values(n.corridors).map(o=>{const s=n.rooms[o.fromRoomId],i=n.rooms[o.toRoomId];return!s||!i?"":s.id===i.id?`
            <path
              class="corridor-loop"
              d="M ${s.x} ${s.y-44} C ${s.x+48} ${s.y-120}, ${s.x-48} ${s.y-120}, ${s.x} ${s.y-44}"
            />
          `:`
          <line
            class="corridor-line"
            x1="${s.x}"
            y1="${s.y}"
            x2="${i.x}"
            y2="${i.y}"
          />
        `}).join("")}
    ${Object.values(n.rooms).map(o=>{const s=l.selectedRoomId===o.id,i=l.connectSourceRoomId===o.id,r=e.get(o.id)??[];return`
          <g
            data-room-node="${h(o.id)}"
            class="room-node ${s?"selected":""} ${i?"armed":""}"
            transform="translate(${o.x}, ${o.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${o.type}" />
            <text class="room-title" text-anchor="middle" y="4">${h(o.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${h(_t(o.type))}</text>
            ${r.map((u,c)=>`
                <circle cx="${-18+c*18}" cy="-12" r="6" fill="${u.color}" />
              `).join("")}
          </g>
        `}).join("")}
  `}function qn(n,t){return`
    <div class="stickman">
      <svg viewBox="0 0 64 84" class="stickman-svg" aria-hidden="true">
        <circle cx="32" cy="14" r="10" fill="${t}" />
        <line x1="32" y1="24" x2="32" y2="52" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="16" y1="36" x2="48" y2="36" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="18" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="46" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
      </svg>
      <span>${h(n)}</span>
    </div>
  `}function Kn(){const n=q.querySelector("[data-editor-svg]");if(!n||!he()||a?.phase!=="lobby"||!d)return;const t=e=>{const o=n.getBoundingClientRect(),s=(e.clientX-o.left)/o.width*rt,i=(e.clientY-o.top)/o.height*at;return{x:Math.max(60,Math.min(rt-60,s)),y:Math.max(60,Math.min(at-60,i))}};n.onpointerdown=e=>{const o=e.target;if(!(o instanceof SVGElement))return;const i=o.closest("[data-room-node]")?.dataset.roomNode;if(i){if(l.connectSourceRoomId&&l.connectSourceRoomId!==i&&d){d=tn(d,l.connectSourceRoomId,i),l.connectSourceRoomId=null,N(),b();return}if(l.connectSourceRoomId===i){l.connectSourceRoomId=null,b();return}l.selectedRoomId=i,l.dragRoomId=i,b(),n.setPointerCapture(e.pointerId)}},n.onpointermove=e=>{if(!l.dragRoomId||l.connectSourceRoomId||!d)return;const o=t(e);d=on(d,l.dragRoomId,o.x,o.y),b()},n.onpointerup=()=>{l.dragRoomId&&(l.dragRoomId=null,N(),b())}}function Hn(){if(!a)return!1;if(F())return!0;const n=a.fullState?.players[a.selfName];return ut()?.seat==="spectator"&&a.phase!=="lobby"?!0:!!(n&&!n.alive&&l.revealFullMap)}function ut(){return a?.players.find(n=>n.name===a?.selfName)??null}function F(){return!!(a&&a.masterName===a.selfName)}function jt(){return!!(a&&a.controllerName===a.selfName)}function Y(){return jt()}function pe(){return!!(a&&a.phase==="lobby"&&jt())}function he(){return!!(a&&a.phase==="lobby"&&jt())}function dt(n){switch(n){case"master":return"mestre";case"fox":return"raposa";case"hen":return"galinha";case"spectator":return"espectador";default:return"jogador"}}function ge(n){switch(n){case"lobby":return"lobby";case"running":return"partida em andamento";case"paused_master_disconnect":return"pausado";case"game_over":return"fim da partida";default:return n}}function _t(n){return n==="shop"?"loja":"normal"}function Wn(n){const t=[...n].sort((s,i)=>s.angle-i.angle);let e=-999,o=0;return t.map(s=>{Math.abs(s.angle-e)<18?o+=1:o=0,e=s.angle;const i=s.angle*Math.PI/180,r=40+o*8,u=28+o*6,c=50+Math.cos(i)*r,_=50+Math.sin(i)*u;return{corridorId:s.corridorId,angle:s.angle,left:c,top:_}})}function Ot(){const n=vt.get("server")??void 0;return n||Rt}async function Dn(){if(!a)return;const n=new URL(window.location.href);n.searchParams.set("room",a.room);const t=n.toString();try{await navigator.clipboard.writeText(t),A("Link da room copiado.")}catch{A(t)}}function A(n){l.toast=n,b(),window.clearTimeout(A.timer),A.timer=window.setTimeout(()=>{l.toast="",b()},2600)}function h(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
