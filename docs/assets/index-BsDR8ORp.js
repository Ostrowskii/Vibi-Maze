(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();var Ie=Object.defineProperty,$e=(e,t,n)=>t in e?Ie(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,w=(e,t,n)=>$e(e,typeof t!="symbol"?t+"":t,n),bt=53,Se=new TextDecoder,Lt=new WeakMap,Ct=new WeakMap,Ne=class{constructor(e){w(this,"buf"),w(this,"bit_pos"),this.buf=e,this.bit_pos=0}write_bit(e){const t=this.bit_pos>>>3,n=this.bit_pos&7;e&&(this.buf[t]|=1<<n),this.bit_pos++}write_bitsUnsigned(e,t){if(t!==0){if(typeof e=="number"){if(t<=32){if((this.bit_pos&7)===0&&(t&7)===0){let s=e>>>0,r=this.bit_pos>>>3;for(let i=0;i<t;i+=8)this.buf[r++]=s&255,s>>>=8;this.bit_pos+=t;return}let o=e>>>0;for(let s=0;s<t;s++)this.write_bit(o&1),o>>>=1;return}this.write_bitsBigint(BigInt(e),t);return}this.write_bitsBigint(e,t)}}write_bitsBigint(e,t){if(t===0)return;if((this.bit_pos&7)===0&&(t&7)===0){let s=e,r=this.bit_pos>>>3;for(let i=0;i<t;i+=8)this.buf[r++]=Number(s&0xffn),s>>=8n;this.bit_pos+=t;return}let o=e;for(let s=0;s<t;s++)this.write_bit((o&1n)===0n?0:1),o>>=1n}},Re=class{constructor(e){w(this,"buf"),w(this,"bit_pos"),this.buf=e,this.bit_pos=0}read_bit(){const e=this.bit_pos>>>3,t=this.bit_pos&7,n=this.buf[e]>>>t&1;return this.bit_pos++,n}read_bitsUnsigned(e){if(e===0)return 0;if(e<=32){if((this.bit_pos&7)===0&&(e&7)===0){let o=0,s=0,r=this.bit_pos>>>3;for(let i=0;i<e;i+=8)o|=this.buf[r++]<<s,s+=8;return this.bit_pos+=e,o>>>0}let n=0;for(let o=0;o<e;o++)this.read_bit()&&(n|=1<<o);return n>>>0}if(e<=bt){let t=0,n=1;for(let o=0;o<e;o++)this.read_bit()&&(t+=n),n*=2;return t}return this.read_bitsBigint(e)}read_bitsBigint(e){if(e===0)return 0n;if((this.bit_pos&7)===0&&(e&7)===0){let s=0n,r=0n,i=this.bit_pos>>>3;for(let u=0;u<e;u+=8)s|=BigInt(this.buf[i++])<<r,r+=8n;return this.bit_pos+=e,s}let n=0n,o=1n;for(let s=0;s<e;s++)this.read_bit()&&(n+=o),o<<=1n;return n}};function G(e,t){if(!Number.isInteger(e))throw new TypeError(`${t} must be an integer`)}function q(e){if(G(e,"size"),e<0)throw new RangeError("size must be >= 0")}function Wt(e,t){if(t!==e)throw new RangeError(`vector size mismatch: expected ${e}, got ${t}`)}function L(e,t){switch(e.$){case"UInt":case"Int":return q(e.size),e.size;case"Nat":{if(typeof t=="bigint"){if(t<0n)throw new RangeError("Nat must be >= 0");if(t>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Nat too large to size");return Number(t)+1}if(G(t,"Nat"),t<0)throw new RangeError("Nat must be >= 0");return t+1}case"Tuple":{const n=e.fields,o=at(t,"Tuple");let s=0;for(let r=0;r<n.length;r++)s+=L(n[r],o[r]);return s}case"Vector":{q(e.size);const n=at(t,"Vector");Wt(e.size,n.length);let o=0;for(let s=0;s<e.size;s++)o+=L(e.type,n[s]);return o}case"Struct":{let n=0;const o=Rt(e.fields);for(let s=0;s<o.length;s++){const r=o[s],i=Jt(t,r);n+=L(e.fields[r],i)}return n}case"List":{let n=1;return Yt(t,o=>{n+=1,n+=L(e.type,o)}),n}case"Map":{let n=1;return Zt(t,(o,s)=>{n+=1,n+=L(e.key,o),n+=L(e.value,s)}),n}case"Union":{const n=Nt(e),o=Gt(t),s=e.variants[o];if(!s)throw new RangeError(`Unknown union variant: ${o}`);const r=Xt(t,s);return n.tag_bits+L(s,r)}case"String":return 1+Te(t)*9}}function C(e,t,n){switch(t.$){case"UInt":{if(q(t.size),t.size===0){if(n===0||n===0n)return;throw new RangeError("UInt out of range")}if(typeof n=="bigint"){if(n<0n)throw new RangeError("UInt must be >= 0");const s=1n<<BigInt(t.size);if(n>=s)throw new RangeError("UInt out of range");e.write_bitsUnsigned(n,t.size);return}if(G(n,"UInt"),n<0)throw new RangeError("UInt must be >= 0");if(t.size>bt)throw new RangeError("UInt too large for number; use bigint");const o=2**t.size;if(n>=o)throw new RangeError("UInt out of range");e.write_bitsUnsigned(n,t.size);return}case"Int":{if(q(t.size),t.size===0){if(n===0||n===0n)return;throw new RangeError("Int out of range")}if(typeof n=="bigint"){const i=BigInt(t.size),u=-(1n<<i-1n),c=(1n<<i-1n)-1n;if(n<u||n>c)throw new RangeError("Int out of range");let _=n;n<0n&&(_=(1n<<i)+n),e.write_bitsUnsigned(_,t.size);return}if(G(n,"Int"),t.size>bt)throw new RangeError("Int too large for number; use bigint");const o=-(2**(t.size-1)),s=2**(t.size-1)-1;if(n<o||n>s)throw new RangeError("Int out of range");let r=n;n<0&&(r=2**t.size+n),e.write_bitsUnsigned(r,t.size);return}case"Nat":{if(typeof n=="bigint"){if(n<0n)throw new RangeError("Nat must be >= 0");let o=n;for(;o>0n;)e.write_bit(1),o-=1n;e.write_bit(0);return}if(G(n,"Nat"),n<0)throw new RangeError("Nat must be >= 0");for(let o=0;o<n;o++)e.write_bit(1);e.write_bit(0);return}case"Tuple":{const o=t.fields,s=at(n,"Tuple");for(let r=0;r<o.length;r++)C(e,o[r],s[r]);return}case"Vector":{q(t.size);const o=at(n,"Vector");Wt(t.size,o.length);for(let s=0;s<t.size;s++)C(e,t.type,o[s]);return}case"Struct":{const o=Rt(t.fields);for(let s=0;s<o.length;s++){const r=o[s];C(e,t.fields[r],Jt(n,r))}return}case"List":{Yt(n,o=>{e.write_bit(1),C(e,t.type,o)}),e.write_bit(0);return}case"Map":{Zt(n,(o,s)=>{e.write_bit(1),C(e,t.key,o),C(e,t.value,s)}),e.write_bit(0);return}case"Union":{const o=Nt(t),s=Gt(n),r=o.index_by_tag.get(s);if(r===void 0)throw new RangeError(`Unknown union variant: ${s}`);o.tag_bits>0&&e.write_bitsUnsigned(r,o.tag_bits);const i=t.variants[s],u=Xt(n,i);C(e,i,u);return}case"String":{Me(e,n);return}}}function F(e,t){switch(t.$){case"UInt":return q(t.size),e.read_bitsUnsigned(t.size);case"Int":{if(q(t.size),t.size===0)return 0;const n=e.read_bitsUnsigned(t.size);if(typeof n=="bigint"){const s=1n<<BigInt(t.size-1);return n&s?n-(1n<<BigInt(t.size)):n}const o=2**(t.size-1);return n>=o?n-2**t.size:n}case"Nat":{let n=0,o=null;for(;e.read_bit();)o!==null?o+=1n:n===Number.MAX_SAFE_INTEGER?o=BigInt(n)+1n:n++;return o??n}case"Tuple":{const n=new Array(t.fields.length);for(let o=0;o<t.fields.length;o++)n[o]=F(e,t.fields[o]);return n}case"Vector":{const n=new Array(t.size);for(let o=0;o<t.size;o++)n[o]=F(e,t.type);return n}case"Struct":{const n={},o=Rt(t.fields);for(let s=0;s<o.length;s++){const r=o[s];n[r]=F(e,t.fields[r])}return n}case"List":{const n=[];for(;e.read_bit();)n.push(F(e,t.type));return n}case"Map":{const n=new Map;for(;e.read_bit();){const o=F(e,t.key),s=F(e,t.value);n.set(o,s)}return n}case"Union":{const n=Nt(t);let o=0;n.tag_bits>0&&(o=e.read_bitsUnsigned(n.tag_bits));let s;if(typeof o=="bigint"){if(o>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Union tag index too large");s=Number(o)}else s=o;if(s<0||s>=n.keys.length)throw new RangeError("Union tag index out of range");const r=n.keys[s],i=t.variants[r],u=F(e,i);return i.$==="Struct"&&u&&typeof u=="object"?(u.$=r,u):{$:r,value:u}}case"String":return Ee(e)}}function at(e,t){if(!Array.isArray(e))throw new TypeError(`${t} value must be an Array`);return e}function Jt(e,t){if(e&&typeof e=="object")return e[t];throw new TypeError("Struct value must be an object")}function Nt(e){const t=Lt.get(e);if(t)return t;const n=Object.keys(e.variants).sort();if(n.length===0)throw new RangeError("Union must have at least one variant");const o=new Map;for(let i=0;i<n.length;i++)o.set(n[i],i);const s=n.length<=1?0:Math.ceil(Math.log2(n.length)),r={keys:n,index_by_tag:o,tag_bits:s};return Lt.set(e,r),r}function Rt(e){const t=Ct.get(e);if(t)return t;const n=Object.keys(e);return Ct.set(e,n),n}function Gt(e){if(!e||typeof e!="object")throw new TypeError("Union value must be an object with a $ tag");const t=e.$;if(typeof t!="string")throw new TypeError("Union value must have a string $ tag");return t}function Xt(e,t){return t.$!=="Struct"&&e&&typeof e=="object"&&Object.prototype.hasOwnProperty.call(e,"value")?e.value:e}function Yt(e,t){if(!Array.isArray(e))throw new TypeError("List value must be an Array");for(let n=0;n<e.length;n++)t(e[n])}function Zt(e,t){if(e!=null){if(e instanceof Map){for(const[n,o]of e)t(n,o);return}if(typeof e=="object"){for(const n of Object.keys(e))t(n,e[n]);return}throw new TypeError("Map value must be a Map or object")}}function Te(e){if(typeof e!="string")throw new TypeError("String value must be a string");let t=0;for(let n=0;n<e.length;n++){const o=e.charCodeAt(n);if(o<128)t+=1;else if(o<2048)t+=2;else if(o>=55296&&o<=56319){const s=n+1<e.length?e.charCodeAt(n+1):0;s>=56320&&s<=57343?(n++,t+=4):t+=3}else o>=56320&&o<=57343,t+=3}return t}function Me(e,t){if(typeof t!="string")throw new TypeError("String value must be a string");for(let n=0;n<t.length;n++){let o=t.charCodeAt(n);if(o<128){e.write_bit(1),e.write_bitsUnsigned(o,8);continue}if(o<2048){e.write_bit(1),e.write_bitsUnsigned(192|o>>>6,8),e.write_bit(1),e.write_bitsUnsigned(128|o&63,8);continue}if(o>=55296&&o<=56319){const s=n+1<t.length?t.charCodeAt(n+1):0;if(s>=56320&&s<=57343){n++;const r=(o-55296<<10)+(s-56320)+65536;e.write_bit(1),e.write_bitsUnsigned(240|r>>>18,8),e.write_bit(1),e.write_bitsUnsigned(128|r>>>12&63,8),e.write_bit(1),e.write_bitsUnsigned(128|r>>>6&63,8),e.write_bit(1),e.write_bitsUnsigned(128|r&63,8);continue}o=65533}else o>=56320&&o<=57343&&(o=65533);e.write_bit(1),e.write_bitsUnsigned(224|o>>>12,8),e.write_bit(1),e.write_bitsUnsigned(128|o>>>6&63,8),e.write_bit(1),e.write_bitsUnsigned(128|o&63,8)}e.write_bit(0)}function Ee(e){let t=new Uint8Array(16),n=0;for(;e.read_bit();){const o=e.read_bitsUnsigned(8);if(n===t.length){const s=new Uint8Array(t.length*2);s.set(t),t=s}t[n++]=o}return Se.decode(t.subarray(0,n))}function Qt(e,t){const n=L(e,t),o=new Uint8Array(n+7>>>3),s=new Ne(o);return C(s,e,t),o}function te(e,t){const n=new Re(t);return F(n,e)}var J=53,Ft={$:"List",type:{$:"UInt",size:8}},ee={$:"Union",variants:{get_time:{$:"Struct",fields:{}},info_time:{$:"Struct",fields:{time:{$:"UInt",size:J}}},post:{$:"Struct",fields:{room:{$:"String"},time:{$:"UInt",size:J},name:{$:"String"},payload:Ft}},info_post:{$:"Struct",fields:{room:{$:"String"},index:{$:"UInt",size:32},server_time:{$:"UInt",size:J},client_time:{$:"UInt",size:J},name:{$:"String"},payload:Ft}},load:{$:"Struct",fields:{room:{$:"String"},from:{$:"UInt",size:32}}},watch:{$:"Struct",fields:{room:{$:"String"}}},unwatch:{$:"Struct",fields:{room:{$:"String"}}},get_latest_post_index:{$:"Struct",fields:{room:{$:"String"}}},info_latest_post_index:{$:"Struct",fields:{room:{$:"String"},latest_index:{$:"Int",size:32},server_time:{$:"UInt",size:J}}}}};function Bt(e){const t=new Array(e.length);for(let n=0;n<e.length;n++)t[n]=e[n];return t}function Pt(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e[n]&255;return t}function Ae(e){switch(e.$){case"post":return{$:"post",room:e.room,time:e.time,name:e.name,payload:Bt(e.payload)};case"info_post":return{$:"info_post",room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,payload:Bt(e.payload)};default:return e}}function Oe(e){switch(e.$){case"post":return{$:"post",room:e.room,time:e.time,name:e.name,payload:Pt(e.payload)};case"info_post":return{$:"info_post",room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,payload:Pt(e.payload)};default:return e}}function P(e){return Qt(ee,Ae(e))}function je(e){const t=te(ee,e);return Oe(t)}var Tt="wss://net.studiovibi.com";function ze(e){let t=e;try{const n=new URL(e);n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),t=n.toString()}catch{t=e}if(typeof window<"u"&&window.location.protocol==="https:"&&t.startsWith("ws://")){const n=`wss://${t.slice(5)}`;return console.warn(`[VibiNet] Upgrading insecure WebSocket URL "${t}" to "${n}" because the page is HTTPS.`),n}return t}function ht(){return Math.floor(Date.now())}function Ue(){return Tt}function ne(){const e="_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",t=new Uint8Array(8);if(typeof crypto<"u"&&typeof crypto.getRandomValues=="function")crypto.getRandomValues(t);else for(let s=0;s<8;s++)t[s]=Math.floor(Math.random()*256);let o="";for(let s=0;s<8;s++)o+=e[t[s]%64];return o}function Le(e){const t={clock_offset:1/0,lowest_ping:1/0,request_sent_at:0,last_ping:1/0},n=new Map,o=new Set,s=[];let r=!1;const i=[];let u=null,c=null,_=0,b=!1,m=null;const $=[],A=ze(e??Ue());function x(){if(!isFinite(t.clock_offset))throw new Error("server_time() called before initial sync");return Math.floor(ht()+t.clock_offset)}function p(){u!==null&&(clearInterval(u),u=null)}function v(){c!==null&&(clearTimeout(c),c=null)}function M(){const R=Math.min(8e3,500*Math.pow(2,_)),k=Math.floor(Math.random()*250);return R+k}function z(){if(!(!m||m.readyState!==WebSocket.OPEN))for(;$.length>0;){if(!m||m.readyState!==WebSocket.OPEN)return;const f=$[0];try{m.send(f),$.shift()}catch{W();return}}}function et(){!m||m.readyState!==WebSocket.OPEN||(t.request_sent_at=ht(),m.send(P({$:"get_time"})))}function nt(f){if(!m||m.readyState!==WebSocket.OPEN)return!1;try{return m.send(f),!0}catch{return!1}}function mt(f){nt(f)||W()}function ke(f){$.push(f),W()}function Ut(f,S,R){const k=n.get(f);if(k){if(k.packer!==S)throw new Error(`Packed schema already registered for room: ${f}`);R&&(k.handler=R);return}n.set(f,{handler:R,packer:S})}function xe(){if(b||c!==null)return;const f=M();c=setTimeout(()=>{c=null,_+=1,W()},f)}function W(){if(b||m&&(m.readyState===WebSocket.OPEN||m.readyState===WebSocket.CONNECTING))return;v();const f=new WebSocket(A);m=f,f.binaryType="arraybuffer",f.addEventListener("open",()=>{if(m===f){_=0,console.log("[WS] Connected"),et(),p();for(const S of o.values())f.send(P({$:"watch",room:S}));z(),u=setInterval(et,2e3)}}),f.addEventListener("message",S=>{const R=S.data instanceof ArrayBuffer?new Uint8Array(S.data):new Uint8Array(S.data),k=je(R);switch(k.$){case"info_time":{const E=ht(),U=E-t.request_sent_at;if(t.last_ping=U,U<t.lowest_ping){const pt=Math.floor((t.request_sent_at+E)/2);t.clock_offset=k.time-pt,t.lowest_ping=U}if(!r){r=!0;for(const pt of i)pt();i.length=0}break}case"info_post":{const E=n.get(k.room);if(E&&E.handler){const U=te(E.packer,k.payload);E.handler({$:"info_post",room:k.room,index:k.index,server_time:k.server_time,client_time:k.client_time,name:k.name,data:U})}break}case"info_latest_post_index":{for(const E of s)E({room:k.room,latest_index:k.latest_index,server_time:k.server_time});break}}}),f.addEventListener("close",S=>{m===f&&(p(),m=null,!b&&(console.warn(`[WS] Disconnected (code=${S.code}); reconnecting...`),xe()))}),f.addEventListener("error",()=>{})}return W(),{on_sync:f=>{if(r){f();return}i.push(f)},watch:(f,S,R)=>{Ut(f,S,R),o.add(f),mt(P({$:"watch",room:f}))},load:(f,S,R,k)=>{Ut(f,R,k),mt(P({$:"load",room:f,from:S}))},get_latest_post_index:f=>{mt(P({$:"get_latest_post_index",room:f}))},on_latest_post_index:f=>{s.push(f)},post:(f,S,R)=>{const k=ne(),E=Qt(R,S),U=P({$:"post",room:f,time:x(),name:k,payload:E});return $.length>0&&z(),nt(U)||ke(U),k},server_time:x,ping:()=>t.last_ping,close:()=>{if(b=!0,v(),p(),m&&m.readyState===WebSocket.OPEN)for(const f of o.values())try{m.send(P({$:"unwatch",room:f}))}catch{break}m&&m.close(),m=null},debug_dump:()=>({ws_url:A,ws_ready_state:m?m.readyState:WebSocket.CLOSED,is_synced:r,reconnect_attempt:_,reconnect_scheduled:c!==null,pending_post_count:$.length,watched_rooms:Array.from(o.values()),room_watchers:Array.from(n.keys()),room_watcher_count:n.size,latest_post_index_listener_count:s.length,sync_listener_count:i.length,time_sync:{clock_offset:t.clock_offset,lowest_ping:t.lowest_ping,request_sent_at:t.request_sent_at,last_ping:t.last_ping}})}}var yt=class{constructor(t){w(this,"room"),w(this,"init"),w(this,"on_tick"),w(this,"on_post"),w(this,"packer"),w(this,"smooth"),w(this,"tick_rate"),w(this,"tolerance"),w(this,"client_api"),w(this,"remote_posts"),w(this,"local_posts"),w(this,"timeline"),w(this,"cache_enabled"),w(this,"snapshot_stride"),w(this,"snapshot_count"),w(this,"snapshots"),w(this,"snapshot_start_tick"),w(this,"initial_time_value"),w(this,"initial_tick_value"),w(this,"no_pending_posts_before_ms"),w(this,"max_contiguous_remote_index"),w(this,"cache_drop_guard_hits"),w(this,"latest_index_poll_interval_id"),w(this,"max_remote_index");const n=(c,_)=>c,o=t.smooth??n,s=t.cache??!0,r=t.snapshot_stride??8,i=t.snapshot_count??256,u=t.client??Le(t.server);this.room=t.room,this.init=t.initial,this.on_tick=t.on_tick,this.on_post=t.on_post,this.packer=t.packer,this.smooth=o,this.tick_rate=t.tick_rate,this.tolerance=t.tolerance,this.client_api=u,this.remote_posts=new Map,this.local_posts=new Map,this.timeline=new Map,this.cache_enabled=s,this.snapshot_stride=Math.max(1,Math.floor(r)),this.snapshot_count=Math.max(1,Math.floor(i)),this.snapshots=new Map,this.snapshot_start_tick=null,this.initial_time_value=null,this.initial_tick_value=null,this.no_pending_posts_before_ms=null,this.max_contiguous_remote_index=-1,this.cache_drop_guard_hits=0,this.latest_index_poll_interval_id=null,this.max_remote_index=-1,this.client_api.on_latest_post_index&&this.client_api.on_latest_post_index(c=>{this.on_latest_post_index_info(c)}),this.client_api.on_sync(()=>{console.log(`[VIBI] synced; loading+watching room=${this.room}`);const c=_=>{_.name&&this.remove_local_post(_.name),this.add_remote_post(_)};this.client_api.load(this.room,0,this.packer,c),this.client_api.watch(this.room,this.packer,c),this.request_latest_post_index(),this.latest_index_poll_interval_id!==null&&clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=setInterval(()=>{this.request_latest_post_index()},2e3)})}official_time(t){return t.client_time<=t.server_time-this.tolerance?t.server_time-this.tolerance:t.client_time}official_tick(t){return this.time_to_tick(this.official_time(t))}get_bucket(t){let n=this.timeline.get(t);return n||(n={remote:[],local:[]},this.timeline.set(t,n)),n}insert_remote_post(t,n){const o=this.get_bucket(n);o.remote.push(t),o.remote.sort((s,r)=>s.index-r.index)}invalidate_from_tick(t){if(!this.cache_enabled)return;const n=this.snapshot_start_tick;if(n!==null&&t<n||n===null||this.snapshots.size===0)return;const o=this.snapshot_stride,s=n+(this.snapshots.size-1)*o;if(!(t>s)){if(t<=n){this.snapshots.clear();return}for(let r=s;r>=t;r-=o)this.snapshots.delete(r)}}advance_state(t,n,o){let s=t;for(let r=n+1;r<=o;r++)s=this.apply_tick(s,r);return s}prune_before_tick(t){if(!this.cache_enabled)return;const n=this.safe_prune_tick();n!==null&&t>n&&(this.cache_drop_guard_hits+=1,t=n);for(const o of this.timeline.keys())o<t&&this.timeline.delete(o);for(const[o,s]of this.remote_posts.entries())this.official_tick(s)<t&&this.remote_posts.delete(o);for(const[o,s]of this.local_posts.entries())this.official_tick(s)<t&&this.local_posts.delete(o)}tick_ms(){return 1e3/this.tick_rate}cache_window_ticks(){return this.snapshot_stride*Math.max(0,this.snapshot_count-1)}safe_prune_tick(){return this.no_pending_posts_before_ms===null?null:this.time_to_tick(this.no_pending_posts_before_ms)}safe_compute_tick(t){if(!this.cache_enabled)return t;const n=this.safe_prune_tick();if(n===null)return t;const o=n+this.cache_window_ticks();return Math.min(t,o)}advance_no_pending_posts_before_ms(t){const n=Math.max(0,Math.floor(t));(this.no_pending_posts_before_ms===null||n>this.no_pending_posts_before_ms)&&(this.no_pending_posts_before_ms=n)}advance_contiguous_remote_frontier(){for(;;){const t=this.max_contiguous_remote_index+1,n=this.remote_posts.get(t);if(!n)break;this.max_contiguous_remote_index=t,this.advance_no_pending_posts_before_ms(this.official_time(n))}}on_latest_post_index_info(t){if(t.room!==this.room||t.latest_index>this.max_contiguous_remote_index)return;const n=this.tick_ms(),o=t.server_time-this.tolerance-n;this.advance_no_pending_posts_before_ms(o)}request_latest_post_index(){if(this.client_api.get_latest_post_index)try{this.client_api.get_latest_post_index(this.room)}catch{}}ensure_snapshots(t,n){if(!this.cache_enabled)return;this.snapshot_start_tick===null&&(this.snapshot_start_tick=n);let o=this.snapshot_start_tick;if(o===null||t<o)return;const s=this.snapshot_stride,r=o+Math.floor((t-o)/s)*s;let i,u;if(this.snapshots.size===0)i=this.init,u=o-1;else{const b=o+(this.snapshots.size-1)*s;i=this.snapshots.get(b),u=b}let c=u+s;for(this.snapshots.size===0&&(c=o);c<=r;c+=s)i=this.advance_state(i,u,c),this.snapshots.set(c,i),u=c;const _=this.snapshots.size;if(_>this.snapshot_count){const b=_-this.snapshot_count,m=o+b*s;for(let $=o;$<m;$+=s)this.snapshots.delete($);o=m,this.snapshot_start_tick=o}this.prune_before_tick(o)}add_remote_post(t){const n=this.official_tick(t);if(t.index===0&&this.initial_time_value===null){const s=this.official_time(t);this.initial_time_value=s,this.initial_tick_value=this.time_to_tick(s)}if(this.remote_posts.has(t.index))return;this.cache_enabled&&this.snapshot_start_tick!==null&&n<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.remote_posts.set(t.index,t),t.index>this.max_remote_index&&(this.max_remote_index=t.index),this.advance_contiguous_remote_frontier(),this.insert_remote_post(t,n),this.invalidate_from_tick(n)}add_local_post(t,n){this.local_posts.has(t)&&this.remove_local_post(t);const o=this.official_tick(n);this.cache_enabled&&this.snapshot_start_tick!==null&&o<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.local_posts.set(t,n),this.get_bucket(o).local.push(n),this.invalidate_from_tick(o)}remove_local_post(t){const n=this.local_posts.get(t);if(!n)return;this.local_posts.delete(t);const o=this.official_tick(n),s=this.timeline.get(o);if(s){const r=s.local.indexOf(n);if(r!==-1)s.local.splice(r,1);else{const i=s.local.findIndex(u=>u.name===t);i!==-1&&s.local.splice(i,1)}s.remote.length===0&&s.local.length===0&&this.timeline.delete(o)}this.invalidate_from_tick(o)}apply_tick(t,n){let o=this.on_tick(t);const s=this.timeline.get(n);if(s){for(const r of s.remote)o=this.on_post(r.data,o);for(const r of s.local)o=this.on_post(r.data,o)}return o}compute_state_at_uncached(t,n){let o=this.init;for(let s=t;s<=n;s++)o=this.apply_tick(o,s);return o}post_to_debug_dump(t){return{room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,official_time:this.official_time(t),official_tick:this.official_tick(t),data:t.data}}timeline_tick_bounds(){let t=null,n=null;for(const o of this.timeline.keys())(t===null||o<t)&&(t=o),(n===null||o>n)&&(n=o);return{min:t,max:n}}snapshot_tick_bounds(){let t=null,n=null;for(const o of this.snapshots.keys())(t===null||o<t)&&(t=o),(n===null||o>n)&&(n=o);return{min:t,max:n}}time_to_tick(t){return Math.floor(t*this.tick_rate/1e3)}server_time(){return this.client_api.server_time()}server_tick(){return this.time_to_tick(this.server_time())}post_count(){return this.max_remote_index+1}compute_render_state(){const t=this.server_tick(),n=1e3/this.tick_rate,o=Math.ceil(this.tolerance/n),s=this.client_api.ping(),r=isFinite(s)?Math.ceil(s/2/n):0,i=Math.max(o,r+1),u=Math.max(0,t-i),c=this.compute_state_at(u),_=this.compute_state_at(t);return this.smooth(c,_)}initial_time(){if(this.initial_time_value!==null)return this.initial_time_value;const t=this.remote_posts.get(0);if(!t)return null;const n=this.official_time(t);return this.initial_time_value=n,this.initial_tick_value=this.time_to_tick(n),n}initial_tick(){if(this.initial_tick_value!==null)return this.initial_tick_value;const t=this.initial_time();return t===null?null:(this.initial_tick_value=this.time_to_tick(t),this.initial_tick_value)}compute_state_at(t){t=this.safe_compute_tick(t);const n=this.initial_tick();if(n===null)return this.init;if(t<n)return this.init;if(!this.cache_enabled)return this.compute_state_at_uncached(n,t);this.ensure_snapshots(t,n);const o=this.snapshot_start_tick;if(o===null||this.snapshots.size===0)return this.init;if(t<o)return this.snapshots.get(o)??this.init;const s=this.snapshot_stride,r=o+(this.snapshots.size-1)*s,i=Math.floor((r-o)/s),u=Math.floor((t-o)/s),c=Math.min(u,i),_=o+c*s,b=this.snapshots.get(_)??this.init;return this.advance_state(b,_,t)}debug_dump(){const t=Array.from(this.remote_posts.values()).sort((p,v)=>p.index-v.index).map(p=>this.post_to_debug_dump(p)),n=Array.from(this.local_posts.values()).sort((p,v)=>{const M=this.official_tick(p),z=this.official_tick(v);if(M!==z)return M-z;const et=p.name??"",nt=v.name??"";return et.localeCompare(nt)}).map(p=>this.post_to_debug_dump(p)),o=Array.from(this.timeline.entries()).sort((p,v)=>p[0]-v[0]).map(([p,v])=>({tick:p,remote_count:v.remote.length,local_count:v.local.length,remote_posts:v.remote.map(M=>this.post_to_debug_dump(M)),local_posts:v.local.map(M=>this.post_to_debug_dump(M))})),s=Array.from(this.snapshots.entries()).sort((p,v)=>p[0]-v[0]).map(([p,v])=>({tick:p,state:v})),r=this.initial_time(),i=this.initial_tick(),u=this.timeline_tick_bounds(),c=this.snapshot_tick_bounds(),_=i!==null&&u.min!==null&&u.min>i;let b=null,m=null;try{b=this.server_time(),m=this.server_tick()}catch{b=null,m=null}let $=null,A=null;for(const p of this.remote_posts.keys())($===null||p<$)&&($=p),(A===null||p>A)&&(A=p);const x=typeof this.client_api.debug_dump=="function"?this.client_api.debug_dump():null;return{room:this.room,tick_rate:this.tick_rate,tolerance:this.tolerance,cache_enabled:this.cache_enabled,snapshot_stride:this.snapshot_stride,snapshot_count:this.snapshot_count,snapshot_start_tick:this.snapshot_start_tick,no_pending_posts_before_ms:this.no_pending_posts_before_ms,max_contiguous_remote_index:this.max_contiguous_remote_index,initial_time:r,initial_tick:i,max_remote_index:this.max_remote_index,post_count:this.post_count(),server_time:b,server_tick:m,ping:this.ping(),history_truncated:_,cache_drop_guard_hits:this.cache_drop_guard_hits,counts:{remote_posts:this.remote_posts.size,local_posts:this.local_posts.size,timeline_ticks:this.timeline.size,snapshots:this.snapshots.size},ranges:{timeline_min_tick:u.min,timeline_max_tick:u.max,snapshot_min_tick:c.min,snapshot_max_tick:c.max,min_remote_index:$,max_remote_index:A},remote_posts:t,local_posts:n,timeline:o,snapshots:s,client_debug:x}}debug_recompute(t){const n=this.initial_tick(),o=this.timeline_tick_bounds(),s=n!==null&&o.min!==null&&o.min>n;let r=t;if(r===void 0)try{r=this.server_tick()}catch{r=void 0}r===void 0&&(r=n??0);const i=this.snapshots.size;this.snapshots.clear(),this.snapshot_start_tick=null;const u=[];if(s&&u.push("Local history before timeline_min_tick was pruned; full room replay may be impossible without reloading posts."),n===null||r<n)return u.push("No replayable post range available at target tick."),{target_tick:r,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:i,history_truncated:s,state:this.init,notes:u};const c=this.compute_state_at_uncached(n,r);return{target_tick:r,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:i,history_truncated:s,state:c,notes:u}}post(t){const n=this.client_api.post(this.room,t,this.packer),o=this.server_time(),s={room:this.room,index:-1,server_time:o,client_time:o,name:n,data:t};this.add_local_post(n,s)}compute_current_state(){return this.compute_state_at(this.server_tick())}on_sync(t){this.client_api.on_sync(t)}ping(){return this.client_api.ping()}close(){this.latest_index_poll_interval_id!==null&&(clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=null),this.client_api.close()}static gen_name(){return ne()}};w(yt,"game",yt);var Ce=yt;const qt=220,gt=["#f25f5c","#247ba0","#70c1b3","#f7b267","#8e6c88","#5c80bc","#9bc53d","#f18f01"],Fe=24,st=[101,207,311,419,523,631,733,839,947,1051,1153,1259,1361,1471,1579,1681,1789,1891,1993,2099,2203,2309,2411,2521,2621,2729,2833,2939,3041,3149,3253,3359,3461,3571,3677,3779,3881,3989,4091,4201,4303,4409,4513,4621,4723,4831,4933,5039,5147,5251],oe=[[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[1,4],[4,7],[2,5],[5,8],[3,6],[6,9],[1,5],[5,9],[2,4],[2,6],[4,8],[6,8],[3,5],[5,7]];function g(e){return`room-${e}`}function dt(e,t){return`corridor:${e}:${t}`}function Be(e,t){return e<t?[e,t]:[t,e]}function I(e){return JSON.parse(JSON.stringify(e))}function Pe(e){return e.trim().replace(/\s+/g," ").slice(0,24)}function qe(e){return e.trim().replace(/\s+/g,"-").slice(0,36).toLowerCase()}function Ve(e){return JSON.stringify(e)}function Ke(){return{phase:"lobby",masterName:null,roster:{},publicState:null,fullState:null,actionRequests:[],consumedActionIds:[],message:null,clockTick:0,nextJoinOrder:0}}function He(e){return{...e,clockTick:e.clockTick+1}}function De(){return st.length}function We(){const e=st[Math.floor(Math.random()*st.length)]??st[0];return en(e)}function Je(e,t){let n;try{n=JSON.parse(e)}catch{return t}switch(n.$){case"join_room":return Xe(t,n);case"heartbeat":return Ye(t,n);case"claim_master":return Ze(t,n);case"unclaim_master":return Qe(t,n);case"publish_state":return tn(t,n);case"submit_move":return Vt(t,{id:n.requestId,type:"move",actorName:n.actorName,corridorId:n.corridorId},n.name,n.sessionId);case"select_kill_target":return Vt(t,{id:n.requestId,type:"kill",actorName:n.actorName,targetName:n.targetName},n.name,n.sessionId);default:return t}}function Ge(e,t,n){const o=new Set(n.consumedActionIds),s=Mt(n),r=Object.values(n.roster).sort((c,_)=>c.joinedAt-_.joinedAt).map(c=>{const _=n.fullState?.players[c.name],b=n.masterName===c.name,m=_?.seat??c.seat,$=_?.role??(b?"master":m==="spectator"?"spectator":"player");return{name:c.name,color:_?.color??c.color,joinedAt:_?.joinedAt??c.joinedAt,connected:vt(n,c),seat:m,isMaster:b,role:$,alive:_?.alive??!1}}),i=r.find(c=>c.name===t)??null,u=n.actionRequests.filter(c=>!o.has(c.id));return{room:e,selfName:t,phase:n.phase,masterName:n.masterName,controllerName:s,players:r,publicState:n.publicState,fullState:n.fullState,canClaimMaster:n.phase==="lobby"&&!n.masterName&&i?.seat!=="spectator",canBecomeMaster:!1,swapMode:"none",swapVotes:[],eligibleNames:[],message:n.message,pendingActions:u}}function Xe(e,t){const n=I(e),o=n.roster[t.name];if(o)return o.activeSessionId=t.sessionId,o.lastSeenTick=n.clockTick,n.message=null,n;const s=n.nextJoinOrder+1,r={name:t.name,color:gt[n.nextJoinOrder%gt.length]??gt[0],joinedAt:s,seat:n.phase==="lobby"?"participant":"spectator",activeSessionId:t.sessionId,lastSeenTick:n.clockTick};return n.nextJoinOrder+=1,n.roster[r.name]=r,n.message=n.phase==="lobby"?null:"Partida em andamento. Novo ingresso como espectador.",n}function Ye(e,t){if(!Z(e,t.name,t.sessionId))return e;const n=I(e),o=n.roster[t.name];return o?(o.lastSeenTick=n.clockTick,n):e}function Ze(e,t){if(e.phase!=="lobby"||e.masterName||!Z(e,t.name,t.sessionId))return e;const n=I(e);return n.masterName=t.name,n.message=`${t.name} virou mestre.`,n}function Qe(e,t){if(e.phase!=="lobby"||e.masterName!==t.name||!Z(e,t.name,t.sessionId))return e;const n=I(e);return n.masterName=null,n.message=`${t.name} deixou de ser mestre.`,n.fullState&&(n.fullState.masterName=null),n}function tn(e,t){if(Mt(e)!==t.name||!Z(e,t.name,t.sessionId))return e;const n=I(e);n.fullState=I(t.fullState),n.publicState=I(t.publicState),n.phase=t.fullState.phase,n.masterName=t.fullState.masterName??n.masterName,n.message=null;const o=new Set(n.consumedActionIds);for(const s of t.consumedActionIds)o.add(s);n.consumedActionIds=[...o].slice(-256),n.actionRequests=n.actionRequests.filter(s=>!o.has(s.id)),n.phase==="lobby"&&(n.actionRequests=[],n.consumedActionIds=[]);for(const s of Object.values(n.fullState.players)){const r=n.roster[s.name]??{name:s.name,color:s.color,joinedAt:s.joinedAt,seat:s.seat,activeSessionId:null,lastSeenTick:-99999};r.color=s.color,r.joinedAt=s.joinedAt,r.seat=s.seat,n.roster[s.name]=r}return n}function Vt(e,t,n,o){if(e.phase!=="running"||!Z(e,n,o)||n!==t.actorName&&Mt(e)!==n||e.actionRequests.some(r=>r.id===t.id)||e.consumedActionIds.includes(t.id))return e;const s=I(e);return s.actionRequests.push(t),s}function Z(e,t,n){return e.roster[t]?.activeSessionId===n}function vt(e,t){return t.activeSessionId?e.clockTick-t.lastSeenTick<=Fe:!1}function Mt(e){if(e.masterName){const n=e.roster[e.masterName];if(n&&vt(e,n))return e.masterName}return Object.values(e.roster).filter(n=>n.seat==="participant"&&vt(e,n)).sort((n,o)=>n.joinedAt-o.joinedAt)[0]?.name??null}function en(e){const t=sn(e),n=Et().rooms,o={},s=Object.keys(n).sort(),r=new Set,i=[],u=on(),c=g(1+Math.floor(t()*s.length));for(r.add(c),i.push(...u.get(c)??[]);r.size<s.length&&i.length>0;){const x=Math.floor(t()*i.length),[p,v]=i.splice(x,1)[0]??[];if(!p||!v||r.has(v))continue;r.add(v);const M=X(n[p],n[v]);o[M.id]=M;for(const z of u.get(v)??[])r.has(z[1])||i.push(z)}const _=Ht(oe.map(([x,p])=>[g(x),g(p)]),t),b=3+Math.floor(t()*5);for(const[x,p]of _){if(Object.keys(o).length>=s.length-1+b)break;const v=X(n[x],n[p]);o[v.id]=v}const m=1+Math.floor(t()*3),$=Ht(s.map(x=>[x,x]),t);for(let x=0;x<m;x+=1){const p=$[x]?.[0];p&&(n[p].type="shop")}const A=Math.floor(t()*2);for(let x=0;x<A;x+=1){const p=$[m+x]?.[0];if(!p)continue;const v=dt(p,p);o[v]={id:v,fromRoomId:p,toRoomId:p,angleFrom:0,angleTo:0}}return nn(n,o),{rooms:n,corridors:o}}function nn(e,t){const n=Object.values(e);if(n.length<2)return;const o=n.reduce((_,b)=>_+b.x,0)/n.length,s=n.reduce((_,b)=>_+b.y,0)/n.length,r=ot(n,"x",1,s,"y"),i=ot(n,"x",-1,s,"y"),u=ot(n,"y",1,o,"x"),c=ot(n,"y",-1,o,"x");Kt(t,r,i),Kt(t,u,c)}function ot(e,t,n,o,s){return e.length===0?null:[...e].sort((i,u)=>{const c=n*(i[t]-u[t]);return c!==0?c:Math.abs(i[s]-o)-Math.abs(u[s]-o)})[0]??null}function Kt(e,t,n){if(!t||!n||t.id===n.id)return;const o=X(t,n);e[o.id]=o}function on(){const e=new Map;for(const[t,n]of oe){const o=g(t),s=g(n);e.set(o,[...e.get(o)??[],[o,s]]),e.set(s,[...e.get(s)??[],[s,o]])}return e}function Ht(e,t){const n=[...e];for(let o=n.length-1;o>0;o-=1){const s=Math.floor(t()*(o+1)),r=n[o];n[o]=n[s],n[s]=r}return n}function sn(e){let t=e>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function ct(e,t){const n=Math.atan2(t.y-e.y,t.x-e.x);return Math.round((n*180/Math.PI+360)%360)}function se(e,t,n,o="normal"){return{id:e,x:t,y:n,type:o}}function Et(){const e={},t={};for(let o=0;o<3;o+=1)for(let s=0;s<3;s+=1){const r=o*3+s+1,i=g(r);e[i]=se(i,180+s*qt,160+o*qt)}const n=[[g(1),g(2)],[g(2),g(3)],[g(4),g(5)],[g(5),g(6)],[g(7),g(8)],[g(8),g(9)],[g(1),g(4)],[g(4),g(7)],[g(2),g(5)],[g(5),g(8)],[g(3),g(6)],[g(6),g(9)],[g(1),g(5)],[g(5),g(9)]];for(const[o,s]of n){const r=X(e[o],e[s]);t[r.id]=r}return{rooms:e,corridors:t}}function rn(e,t,n){const{rooms:o,corridors:s}=Et(),r={};for(const i of t)r[i.name]={name:i.name,color:i.color,joinedAt:i.joinedAt,seat:i.seat,role:i.isMaster?"master":i.seat==="spectator"?"spectator":"player",alive:!1,locationRoomId:null,hasFullInfo:i.isMaster||i.seat==="spectator"};return{phase:"lobby",masterName:n,foxName:null,foxCandidateName:null,round:0,currentTurnName:null,players:r,rooms:o,corridors:s,henOrder:[],pendingKillTargets:[]}}function At(e,t,n){const o=I(e);o.masterName=n;for(const s of t){const r=o.players[s.name],i=s.isMaster?"master":s.seat==="spectator"?"spectator":r?.role&&r.role!=="spectator"?r.role:"player";o.players[s.name]={name:s.name,color:s.color,joinedAt:s.joinedAt,seat:s.seat,role:i,alive:r?.alive??!1,locationRoomId:r?.locationRoomId??null,hasFullInfo:s.isMaster||s.seat==="spectator"||r?.hasFullInfo===!0}}for(const s of Object.keys(o.players))t.find(r=>r.name===s)||(o.players[s].seat="participant");if(n)for(const s of Object.values(o.players))s.name===n&&(s.role="master",s.hasFullInfo=!0,s.alive=!1,s.locationRoomId=null);return o}function X(e,t){const n=ct(e,t),o=ct(t,e);return{id:dt(e.id,t.id),fromRoomId:e.id,toRoomId:t.id,angleFrom:n,angleTo:o}}function an(e,t,n){const o=I(e),[s,r]=Be(t,n),i=dt(s,r);if(o.corridors[i])return delete o.corridors[i],o;const u=o.rooms[t],c=o.rooms[n];return!u||!c?e:(o.corridors[i]=X(u,c),o)}function cn(e){const t=I(e),n=Object.keys(t.rooms).map(s=>Number(s.split("-")[1]??0)),o=g((Math.max(0,...n)||0)+1);return t.rooms[o]=se(o,320,320,"normal"),t}function ln(e,t){const n=I(e);delete n.rooms[t];for(const o of Object.keys(n.corridors)){const s=n.corridors[o];(s.fromRoomId===t||s.toRoomId===t)&&delete n.corridors[o]}for(const o of Object.values(n.players))o.locationRoomId===t&&(o.locationRoomId=null);return n}function un(e,t,n,o){const s=I(e),r=s.rooms[t];if(!r)return e;r.x=n,r.y=o;for(const i of Object.values(s.corridors))if(i.fromRoomId===t||i.toRoomId===t){const u=s.rooms[i.fromRoomId],c=s.rooms[i.toRoomId];i.angleFrom=ct(u,c),i.angleTo=ct(c,u)}return s}function dn(e,t){const n=I(e),o=n.rooms[t];return o?(o.type=o.type==="normal"?"shop":"normal",n):e}function _n(e,t){const n=I(e),o=dt(t,t);return n.corridors[o]?(delete n.corridors[o],n):(n.corridors[o]={id:o,fromRoomId:t,toRoomId:t,angleFrom:0,angleTo:0},n)}function fn(e){const t=I(e),n=Object.values(t.players).filter(s=>s.seat==="participant"&&s.role!=="master").sort((s,r)=>s.joinedAt-r.joinedAt);if(n.length===0)return t.foxCandidateName=null,t;const o=Math.floor(Math.random()*n.length);return t.foxCandidateName=n[o]?.name??null,t}function re(e,t){const n=I(e);return n.foxCandidateName=t,n}function mn(e,t){const n=At(e,t,e.masterName),o=t.filter(c=>c.seat==="participant"&&!c.isMaster&&c.connected).sort((c,_)=>c.joinedAt-_.joinedAt);if(o.length<2||o.length>8)return null;const s=n.foxCandidateName&&o.find(c=>c.name===n.foxCandidateName)?n.foxCandidateName:o[Math.floor(Math.random()*o.length)]?.name??null;if(!s)return null;const r=Object.keys(n.rooms);if(r.length===0)return null;const i=[...r].sort(()=>Math.random()-.5),u=o.filter(c=>c.name!==s).map(c=>c.name);o.forEach((c,_)=>{const b=n.players[c.name];b.alive=!0,b.locationRoomId=i[_%i.length]??r[0]??null,b.role=c.name===s?"fox":"hen",b.hasFullInfo=!1});for(const c of Object.values(n.players))c.role==="spectator"&&(c.alive=!1,c.hasFullInfo=!0,c.locationRoomId=null),c.role==="master"&&(c.hasFullInfo=!0,c.alive=!1,c.locationRoomId=null);return n.phase="running",n.round=1,n.foxName=s,n.pendingKillTargets=[],n.henOrder=u,n.currentTurnName=u[0]??s,n}function pn(e,t){const n=At(e,t,e.masterName);n.phase="lobby",n.foxName=null,n.foxCandidateName=null,n.round=0,n.currentTurnName=null,n.pendingKillTargets=[],n.henOrder=[];for(const o of Object.values(n.players))o.role!=="master"&&o.seat==="participant"?(o.role="player",o.alive=!1,o.locationRoomId=null,o.hasFullInfo=!1):o.seat==="spectator"&&(o.role="spectator",o.alive=!1,o.locationRoomId=null,o.hasFullInfo=!0);return n}function hn(e,t){const n={},o=Object.values(e.players).filter(s=>s.role==="hen"||s.role==="fox").sort((s,r)=>s.joinedAt-r.joinedAt).map(s=>s.name);for(const s of o){const r=e.players[s],i=r.locationRoomId,u=i?e.rooms[i]:null,c=i?Object.values(e.players).filter(_=>_.locationRoomId===i&&_.alive).map(_=>{const b=t.find(m=>m.name===_.name);return{name:_.name,color:_.color,role:_.role,alive:_.alive,connected:b?.connected??!1}}):[];n[s]={name:s,roomId:i,roomType:u?.type??null,playersHere:c,exits:i?gn(e,i):[],alive:r.alive,connected:t.find(_=>_.name===s)?.connected??!1,canAct:e.currentTurnName===s}}return{phase:e.phase,round:e.round,currentTurnName:e.currentTurnName,screens:n,watchOrder:o,pendingKillTargets:[...e.pendingKillTargets]}}function gn(e,t){return Object.values(e.corridors).flatMap(n=>n.fromRoomId===t&&n.toRoomId===t?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!0}]:n.fromRoomId===t?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!1}]:n.toRoomId===t?[{corridorId:n.id,angle:n.angleTo,leadsToSelf:!1}]:[]).sort((n,o)=>n.angle-o.angle)}function ie(e,t,n){if(e.phase!=="running"||e.currentTurnName!==t||e.pendingKillTargets.length>0)return e;const o=I(e),s=o.players[t];if(!s||!s.alive)return e;if(n===null)return rt(o);const r=o.corridors[n];if(!r||!s.locationRoomId)return e;if(r.fromRoomId===s.locationRoomId&&r.toRoomId===s.locationRoomId)s.locationRoomId=r.toRoomId;else if(r.fromRoomId===s.locationRoomId)s.locationRoomId=r.toRoomId;else if(r.toRoomId===s.locationRoomId)s.locationRoomId=r.fromRoomId;else return e;if(s.role==="fox"){const i=bn(o,s.locationRoomId);return i.length===0?rt(o):i.length===1?ce(o,i[0]??""):(o.pendingKillTargets=i,o)}return rt(o)}function ae(e,t,n){if(e.phase!=="running"||e.currentTurnName!==t||e.pendingKillTargets.length===0||!e.pendingKillTargets.includes(n))return e;const o=I(e);return ce(o,n)}function ce(e,t){const n=e.players[t];return n?(n.alive=!1,n.hasFullInfo=!0,e.pendingKillTargets=[],Object.values(e.players).some(s=>s.role==="hen"&&s.alive)?rt(e):(e.phase="game_over",e.currentTurnName=null,e)):e}function bn(e,t){return t?Object.values(e.players).filter(n=>n.role==="hen"&&n.alive&&n.locationRoomId===t).map(n=>n.name):[]}function rt(e){const n=[...e.henOrder.filter(r=>e.players[r]?.alive),...e.foxName&&e.players[e.foxName]?.alive?[e.foxName]:[]];if(n.length===0)return e.phase="game_over",e.currentTurnName=null,e;const o=e.currentTurnName?n.indexOf(e.currentTurnName):-1,s=o+1;return o===-1||s>=n.length?(e.round=Math.max(1,e.round)+(o===-1?0:1),e.currentTurnName=n[0]??null):e.currentTurnName=n[s]??null,e.pendingKillTargets=[],e}const le="vibi-maze-name",ue="vibi-maze-room",de="vibi-maze-session",lt=900,ut=660,yn=200,vn=2500,wn={$:"String"},wt=new URLSearchParams(window.location.search),l={roomInput:wt.get("room")??window.localStorage.getItem(ue)??"galinheiro-1",nameInput:wt.get("name")??window.localStorage.getItem(le)??"",followTurn:!0,watchName:null,sideRailOpen:!0,revealFullMap:!1,selectedRoomId:null,connectSourceRoomId:null,dragRoomId:null,toast:""};let j=null,Y="idle",kt=null,xt=null,B=Tn(),K=null,H=null,It=null,a=null,$t="",d=null,St="",it="";const _e=document.querySelector("#app");if(!_e)throw new Error("Elemento #app não encontrado.");const V=_e;V.addEventListener("submit",e=>{const t=e.target;t instanceof HTMLFormElement&&t.dataset.form==="join"&&(e.preventDefault(),kn())});V.addEventListener("input",e=>{const t=e.target;t instanceof HTMLInputElement&&(t.name==="room"&&(l.roomInput=t.value),t.name==="name"&&(l.nameInput=t.value))});V.addEventListener("change",e=>{const t=e.target;if(t instanceof HTMLElement&&t instanceof HTMLSelectElement&&t.dataset.action==="fox-select"){if(!d)return;d=re(d,t.value),N(),y()}});V.addEventListener("click",async e=>{const t=e.target;if(!(t instanceof HTMLElement))return;const n=t.closest("[data-action]");if(!n)return;const o=n.dataset.action;if(o)switch(o){case"claim-master":if(!a)return;D(T()?{$:"unclaim_master",name:a.selfName,sessionId:B}:{$:"claim_master",name:a.selfName,sessionId:B});break;case"copy-link":await Zn();break;case"toggle-rail":l.sideRailOpen=!l.sideRailOpen,y();break;case"toggle-follow-turn":l.followTurn=!l.followTurn,l.followTurn&&(l.watchName=a?.publicState?.currentTurnName??a?.selfName??null),y();break;case"watch-screen":l.watchName=n.dataset.name??a?.selfName??null,l.followTurn=!1,y();break;case"reveal-full-map":l.revealFullMap=!0,y();break;case"vote-swap-master":case"become-master":case"abandon-match":O("Troca de mestre nao existe nesta branch.");break;case"editor-add-room":if(!d)return;d=cn(d),N(),y();break;case"editor-default":if(!d)return;{const s=Et();d={...d,rooms:s.rooms,corridors:s.corridors}}N(),y();break;case"random-map":if(!d)return;{const s=We();d={...d,rooms:s.rooms,corridors:s.corridors}}O(`Mapa aleatorio aplicado. Biblioteca: ${De()} mapas.`),N(),y();break;case"editor-connect":l.connectSourceRoomId=l.selectedRoomId,y();break;case"editor-cycle-type":if(!d||!l.selectedRoomId)return;d=dn(d,l.selectedRoomId),N(),y();break;case"editor-remove-room":if(!d||!l.selectedRoomId)return;d=ln(d,l.selectedRoomId),l.selectedRoomId=null,l.connectSourceRoomId=null,N(),y();break;case"editor-loop":if(!d||!l.selectedRoomId)return;d=_n(d,l.selectedRoomId),N(),y();break;case"shuffle-fox":if(!d)return;d=fn(d),N(),y();break;case"toggle-self-fox":if(!d||!a)return;d=re(d,ye()?"":a.selfName),N(),y();break;case"start-game":if(!d||!a)return;{const s=mn(d,a.players);if(!s){O("Precisa de pelo menos 2 jogadores conectados para iniciar.");return}d=s,l.revealFullMap=!1}N(),y();break;case"back-to-lobby":if(!d||!a)return;d=pn(d,a.players),l.revealFullMap=!1,N(),y();break;case"submit-pass":Dt(null);break;case"submit-move":Dt(n.dataset.corridorId??null);break;case"kill-target":$n(n.dataset.targetName??"");break}});window.addEventListener("keydown",e=>{e.key==="Escape"&&a&&(l.watchName=a.selfName,l.followTurn=!1,y())});y();function kn(){const e=qe(l.roomInput),t=Pe(l.nameInput);if(!e||!t){O("Informe room e nome.");return}l.roomInput=e,l.nameInput=t,window.localStorage.setItem(ue,e),window.localStorage.setItem(le,t),kt=e,xt=t,B=pe(),Rn(),a=null,$t="",It=null,d=null,St="",it="",Y="connecting";const n={room:e,initial:Ke(),on_tick:He,on_post:Je,packer:wn,tick_rate:6,tolerance:300},o=we();o!==Tt&&(n.server=o),j=new Ce.game(n),j.on_sync(()=>{Y="connected",D({$:"join_room",name:t,sessionId:B}),Nn(),fe(),y()}),y()}function fe(){if(!j||!kt||!xt)return;It=j.compute_render_state();const e=Ge(kt,xt,It);if(e.fullState){const n=JSON.stringify(e.fullState);n!==it&&!l.dragRoomId&&(it=n,(!d||e.controllerName!==e.selfName)&&(d=I(e.fullState)))}else it="";a=e,xn();const t=JSON.stringify(a);t!==$t&&($t=t,y())}function xn(){if(!a)return;if(tt()){const t=d??a.fullState??rn(a.room,a.players,a.masterName);d=At(t,a.players,a.masterName),In()||N()}const e=Q();e&&e.seat==="spectator"&&a.phase!=="lobby"&&(l.revealFullMap=!0),l.followTurn?l.watchName=a.publicState?.currentTurnName??a.selfName:l.watchName||(l.watchName=a.selfName)}function In(){if(!a||!d)return!1;const e=a.pendingActions;if(e.length===0)return!1;let t=d;const n=[];for(const o of e)t=o.type==="move"?ie(t,o.actorName,o.corridorId):ae(t,o.actorName,o.targetName),n.push(o.id);return d=t,N(n),y(),!0}function N(e=[]){if(!a||!d||!tt())return;const t=hn(d,a.players),n=I(d),o=JSON.stringify({fullState:n,publicState:t,consumedActionIds:e});o!==St&&(St=o,D({$:"publish_state",name:a.selfName,sessionId:B,fullState:n,publicState:t,consumedActionIds:e}))}function Dt(e){if(!a)return;const t=Ot();if(t){if(tt()){if(!d)return;d=ie(d,t,e),N(),y();return}D({$:"submit_move",name:a.selfName,sessionId:B,actorName:t,requestId:he(),corridorId:e})}}function $n(e){if(!a||!e)return;const t=Ot();if(t){if(tt()){if(!d)return;d=ae(d,t,e),N(),y();return}D({$:"select_kill_target",name:a.selfName,sessionId:B,actorName:t,requestId:he(),targetName:e})}}function Ot(){return a?.publicState?.currentTurnName?Sn()?a.selfName:me()?a.publicState.currentTurnName:null:null}function Sn(){return a?.publicState?.currentTurnName?a.publicState.currentTurnName===a.selfName:!1}function me(){if(!tt()||!a?.publicState?.currentTurnName)return!1;const e=a;return e.players.find(n=>n.name===e.publicState?.currentTurnName)?.connected===!1}function D(e){if(!j){O("Sem conexao com o VibiNet.");return}j.post(Ve(e))}function Nn(){K!==null&&window.clearInterval(K),H!==null&&window.clearInterval(H),K=window.setInterval(()=>{fe()},yn),H=window.setInterval(()=>{a&&D({$:"heartbeat",name:a.selfName,sessionId:B})},vn)}function Rn(){K!==null&&(window.clearInterval(K),K=null),H!==null&&(window.clearInterval(H),H=null),j?.close(),j=null,Y="closed"}function Tn(){const e=window.sessionStorage.getItem(de);return e||pe()}function pe(){const e=typeof crypto.randomUUID=="function"?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;return window.sessionStorage.setItem(de,e),e}function he(){return`req-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function y(){if(!a){V.innerHTML=Mn();return}V.innerHTML=`
    <main class="app-shell">
      ${Dn()}
      <section class="main-column">
        ${En()}
        ${An()}
        ${On()}
      </section>
      <aside class="right-column">
        ${Vn()}
        ${Kn()}
        ${Hn()}
      </aside>
      ${Wn()}
    </main>
  `,Gn()}function Mn(){return`
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
            ${Y==="connecting"?"Conectando...":"Entrar"}
          </button>
        </form>
        <p class="helper">
          Servidor VibiNet: <code>${h(we())}</code>
        </p>
        ${l.toast?`<p class="toast">${h(l.toast)}</p>`:""}
      </section>
    </main>
  `}function En(){if(!a)return"";const t=Q()?.role??"player";return`
    <header class="header-card">
      <div>
        <p class="eyebrow">Open Info / UI Oculta</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Room <code>${h(a.room)}</code> • voce é
          <strong>${h(_t(t))}</strong>
        </p>
      </div>
    </header>
  `}function An(){if(!a)return"";const e=a,t=e.publicState?.currentTurnName?e.players.find(n=>n.name===e.publicState?.currentTurnName):null;return`
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${h(ve(e.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">VEZ</p>
        <strong style="${t?`color:${t.color}`:""}">
          ${h(t?.name??"Aguardando")}
        </strong>
      </div>
    </section>
  `}function On(){return a?a.phase==="lobby"?`
      <section class="phase-grid">
        <div class="panel spacious">
          ${be()?Un():jn()}
        </div>
        <div class="panel">
          ${zn()}
        </div>
      </section>
    `:`
    <section class="phase-grid running">
      <div class="panel spacious">
        ${Xn()?Ln():Fn()}
      </div>
      <div class="panel">
        ${qn()}
      </div>
    </section>
  `:""}function jn(){const e=zt()&&!T();return`
    <div class="empty-panel">
      <h2>${e?"Pronto para partida rapida":"Aguardando mestre"}</h2>
      <p>
        ${e?"Ninguem virou mestre. Como primeiro jogador conectado, voce pode sortear um mapa salvo e iniciar com 2 ou mais pessoas.":"Quando alguem assumir o papel de mestre, essa pessoa vai editar o labirinto e escolher quem sera a raposa."}
      </p>
    </div>
  `}function zn(){if(!a)return"";const e=zt();return`
    <section class="stack">
      <h2 class="section-title">Sala</h2>
      <p class="metric"><strong>Jogadores ativos:</strong> ${a.players.filter(t=>t.seat==="participant").length}</p>
      <p class="metric"><strong>Mestre:</strong> ${h(a.masterName??"ninguem")}</p>
      <p class="metric"><strong>Controller:</strong> ${h(a.controllerName??"aguardando jogadores")}</p>
      ${e?`
            ${T()?'<p class="helper">Como mestre, voce tambem pode editar o labirinto manualmente.</p>':'<p class="helper">Sem mestre explicito, o primeiro jogador conectado controla o lobby e o sorteio do mapa.</p>'}
          `:`
            <p class="helper">Voce continua esperando no lobby enquanto o controller atual prepara a partida.</p>
          `}
    </section>
  `}function Un(){if(!d||!a)return"";const e=l.selectedRoomId?d.rooms[l.selectedRoomId]:null,t=T()?"Editor do mestre":"Editor do controller",n=T()?"Arraste salas, conecte pares e monte o labirinto antes do inicio.":"Sem mestre explicito, o controller atual pode editar o labirinto antes do inicio.";return`
    <section class="editor-shell">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${t}</h2>
          <p class="helper">${n}</p>
        </div>
        <div class="button-row tight">
          <button class="btn btn-secondary" data-action="editor-add-room" type="button">Nova sala</button>
          <button class="btn btn-secondary" data-action="editor-default" type="button">Mapa 3x3</button>
          <button class="btn btn-secondary" data-action="random-map" type="button">Mapa aleatorio</button>
        </div>
      </div>
      <svg class="editor-map" data-editor-svg viewBox="0 0 ${lt} ${ut}">
        ${ge(d)}
      </svg>
      <div class="editor-toolbar">
        <div class="metric-block">
          <strong>Sala selecionada</strong>
          <span>${h(e?.id??"nenhuma")}</span>
        </div>
        <div class="metric-block">
          <strong>Tipo</strong>
          <span>${h(e?.type??"-")}</span>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary" data-action="editor-connect" type="button" ${e?"":"disabled"}>
            ${l.connectSourceRoomId?"Clique em outra sala":"Conectar"}
          </button>
          <button class="btn btn-secondary" data-action="editor-cycle-type" type="button" ${e?"":"disabled"}>
            Alternar tipo
          </button>
          <button class="btn btn-secondary" data-action="editor-loop" type="button" ${e?"":"disabled"}>
            Loop
          </button>
          <button class="btn btn-danger" data-action="editor-remove-room" type="button" ${e?"":"disabled"}>
            Remover
          </button>
        </div>
      </div>
    </section>
  `}function Ln(){if(!d)return'<div class="empty-panel"><h2>Sem mapa completo</h2></div>';const e=T();return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${T()?"Mapa mestre":"Visao completa"}</h2>
          <p class="helper">
            ${T()?"Voce enxerga tudo o tempo todo.":"Agora voce pode assistir a partida inteira."}
          </p>
        </div>
        ${e?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${lt} ${ut}">
        ${ge(d)}
      </svg>
      ${Cn()}
    </section>
  `}function Cn(){return a?`
    <div class="legend-grid">
      ${a.players.map(e=>`
          <div class="legend-chip">
            <span class="legend-color" style="background:${e.color}"></span>
            <strong>${h(e.name)}</strong>
            <span>${h(_t(e.role))}</span>
          </div>
        `).join("")}
    </div>
  `:""}function Fn(){if(!a?.publicState)return'<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';const e=l.watchName??a.selfName,t=a.publicState.screens[e]??null,n=a.fullState?.players[a.selfName],o=!!(n&&!n.alive&&n.seat==="participant"&&!l.revealFullMap);if(!t)return`
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${o?'<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
      </div>
    `;const r=Ot()===e,i=r&&a.publicState.pendingKillTargets.length===0,u=r&&a.publicState.pendingKillTargets.length>0;return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${h(t.name)}</h2>
          <p class="helper">
            ${h(t.roomType?`Sala ${ft(t.roomType)}`:"Sem posicao visivel")}
          </p>
        </div>
        ${o?'<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
      </div>
      ${Pn(t,i)}
      ${u?Bn(a.publicState.pendingKillTargets):`
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${i?"":"disabled"}>Passar</button>
            </div>
          `}
    </section>
  `}function Bn(e){return`
    <div class="kill-picker">
      <strong>Raposa escolhe quem cai:</strong>
      <div class="button-row">
        ${e.map(t=>`
            <button class="btn btn-danger" data-action="kill-target" data-target-name="${h(t)}" type="button">
              ${h(t)}
            </button>
          `).join("")}
      </div>
    </div>
  `}function Pn(e,t){const n=Yn(e.exits);return`
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${h(e.roomType?ft(e.roomType):"Sem sala")}</div>
        ${n.map((o,s)=>`
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
          ${e.playersHere.map(o=>Jn(o.name,o.color)).join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${e.playersHere.length||0}</p>
        <p><strong>Saidas:</strong> ${e.exits.map(o=>`${o.angle}°`).join(", ")||"nenhuma"}</p>
      </div>
    </section>
  `}function qn(){if(!a)return"";const e=l.watchName??a.selfName,t=a.publicState?.currentTurnName??"Aguardando",n=Q(),o=me();return`
    <section class="stack">
      <h2 class="section-title">Partida</h2>
      <p class="metric"><strong>Rodada:</strong> ${a.publicState?.round??0}</p>
      <p class="metric"><strong>Na tela:</strong> ${h(e)}</p>
      <p class="metric"><strong>Turno atual:</strong> ${h(t)}</p>
      <p class="metric"><strong>Status:</strong> ${h(ve(a.phase))}</p>
      ${o?`<p class="notice">Jogador atual caiu. O mestre pode agir por <strong>${h(t)}</strong>.</p>`:""}
      ${n&&n.role==="spectator"?'<p class="helper">Voce entrou depois do inicio e esta vendo a partida como espectador total.</p>':""}
      ${l.toast?`<p class="toast">${h(l.toast)}</p>`:""}
    </section>
  `}function Vn(){if(!a)return"";const e=a;return`
    <section class="panel stack">
      <h2 class="section-title">Jogadores</h2>
      <ul class="roster">
        ${e.players.map(t=>`
              <li class="roster-item ${t.name===e.selfName?"is-self":""}">
                <span class="legend-color" style="background:${t.color}"></span>
                <div>
                  <strong>${h(t.name)}</strong>
                  <div class="helper">${h(_t(t.role))} • ${t.connected?"online":"offline"}</div>
                </div>
                <span class="tag">${t.alive?"vivo":t.seat==="spectator"?"spec":"fora"}</span>
              </li>
            `).join("")}
      </ul>
    </section>
  `}function Kn(){return a?`
    <section class="panel stack">
      <h2 class="section-title">Conexao</h2>
      <p class="metric"><strong>Estado:</strong> ${h(Y)}</p>
      <p class="metric"><strong>Ping:</strong> ${Math.round(j?.ping?.()??0)} ms</p>
      ${a.message?`<p class="notice">${h(a.message)}</p>`:""}
    </section>
  `:""}function Hn(){if(!a)return"";const e=a.phase==="lobby",t=zt(),o=!!!a.masterName||T(),s=Q()?.seat==="participant",r=T()?"Deixar de ser mestre":"Virar mestre",i=ye()?"Deixar de ser raposa":"Se tornar raposa";return`
    <section class="panel stack">
      <h2 class="section-title">Acoes</h2>
      <div class="action-stack">
        <button class="btn btn-secondary btn-block" data-action="copy-link" type="button">Copiar link da sala</button>
        <button class="btn btn-secondary btn-block" data-action="toggle-follow-turn" type="button">
          ${l.followTurn?"Parar de acompanhar a vez":"Acompanhar a vez"}
        </button>
        <button
          class="btn ${T()?"btn-danger":"btn-primary"} btn-block"
          data-action="claim-master"
          type="button"
          ${e&&o?"":"disabled"}
        >
          ${r}
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="random-map"
          type="button"
          ${e&&t?"":"disabled"}
        >
          Mapa aleatorio
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="shuffle-fox"
          type="button"
          ${e&&t?"":"disabled"}
        >
          Sortear raposa
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="toggle-self-fox"
          type="button"
          ${e&&t&&s?"":"disabled"}
        >
          ${i}
        </button>
        <button
          class="btn btn-primary btn-block"
          data-action="start-game"
          type="button"
          ${e&&t?"":"disabled"}
        >
          Play
        </button>
      </div>
    </section>
  `}function Dn(){if(!a?.publicState)return`
      <aside class="side-rail ${l.sideRailOpen?"":"collapsed"}">
        <div class="side-rail-header">
          <strong>Telas</strong>
          <button class="ghost-btn rail-toggle" data-action="toggle-rail" type="button" aria-label="${l.sideRailOpen?"Fechar telas":"Abrir telas"}">
            ${l.sideRailOpen?"←":"→"}
          </button>
        </div>
      </aside>
    `;const e=a,t=e.publicState,n=[e.selfName,...t.watchOrder.filter(o=>o!==e.selfName)];return`
    <aside class="side-rail ${l.sideRailOpen?"":"collapsed"}">
      <div class="side-rail-header">
        <strong>Telas</strong>
        <button class="ghost-btn rail-toggle" data-action="toggle-rail" type="button" aria-label="${l.sideRailOpen?"Fechar telas":"Abrir telas"}">${l.sideRailOpen?"←":"→"}</button>
      </div>
      ${n.map(o=>{const s=t.screens[o],r=e.players.find(i=>i.name===o);return`
            <button
              class="screen-card ${l.watchName===o?"active":""}"
              data-action="watch-screen"
              data-name="${h(o)}"
              type="button"
            >
              <div class="screen-card-header">
                <span class="legend-color" style="background:${r?.color??"#000"}"></span>
                <strong>${h(o)}</strong>
              </div>
              <div class="screen-card-body">
                <span>${h(_t(r?.role??"player"))}</span>
                <span>${h(s?.roomType?ft(s.roomType):"sem sala")}</span>
                <span>${h(s?`${s.exits.length} saidas`:"-")}</span>
              </div>
            </button>
          `}).join("")}
    </aside>
  `}function Wn(){return""}function ge(e,t){const n=new Map;for(const o of Object.values(e.players))o.locationRoomId&&(n.has(o.locationRoomId)||n.set(o.locationRoomId,[]),n.get(o.locationRoomId)?.push({name:o.name,color:o.color,role:o.role}));return`
    ${Object.values(e.corridors).map(o=>{const s=e.rooms[o.fromRoomId],r=e.rooms[o.toRoomId];return!s||!r?"":s.id===r.id?`
            <path
              class="corridor-loop"
              d="M ${s.x} ${s.y-44} C ${s.x+48} ${s.y-120}, ${s.x-48} ${s.y-120}, ${s.x} ${s.y-44}"
            />
          `:`
          <line
            class="corridor-line"
            x1="${s.x}"
            y1="${s.y}"
            x2="${r.x}"
            y2="${r.y}"
          />
        `}).join("")}
    ${Object.values(e.rooms).map(o=>{const s=l.selectedRoomId===o.id,r=l.connectSourceRoomId===o.id,i=n.get(o.id)??[];return`
          <g
            data-room-node="${h(o.id)}"
            class="room-node ${s?"selected":""} ${r?"armed":""}"
            transform="translate(${o.x}, ${o.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${o.type}" />
            <text class="room-title" text-anchor="middle" y="4">${h(o.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${h(ft(o.type))}</text>
            ${i.map((u,c)=>`
                <circle cx="${-18+c*18}" cy="-12" r="6" fill="${u.color}" />
              `).join("")}
          </g>
        `}).join("")}
  `}function Jn(e,t){return`
    <div class="stickman">
      <svg viewBox="0 0 64 84" class="stickman-svg" aria-hidden="true">
        <circle cx="32" cy="14" r="10" fill="${t}" />
        <line x1="32" y1="24" x2="32" y2="52" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="16" y1="36" x2="48" y2="36" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="18" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="46" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
      </svg>
      <span>${h(e)}</span>
    </div>
  `}function Gn(){const e=V.querySelector("[data-editor-svg]");if(!e||!be()||a?.phase!=="lobby"||!d)return;const t=n=>{const o=e.getBoundingClientRect(),s=(n.clientX-o.left)/o.width*lt,r=(n.clientY-o.top)/o.height*ut;return{x:Math.max(60,Math.min(lt-60,s)),y:Math.max(60,Math.min(ut-60,r))}};e.onpointerdown=n=>{const o=n.target;if(!(o instanceof SVGElement))return;const r=o.closest("[data-room-node]")?.dataset.roomNode;if(r){if(l.connectSourceRoomId&&l.connectSourceRoomId!==r&&d){d=an(d,l.connectSourceRoomId,r),l.connectSourceRoomId=null,N(),y();return}if(l.connectSourceRoomId===r){l.connectSourceRoomId=null,y();return}l.selectedRoomId=r,l.dragRoomId=r,y(),e.setPointerCapture(n.pointerId)}},e.onpointermove=n=>{if(!l.dragRoomId||l.connectSourceRoomId||!d)return;const o=t(n);d=un(d,l.dragRoomId,o.x,o.y),y()},e.onpointerup=()=>{l.dragRoomId&&(l.dragRoomId=null,N(),y())}}function Xn(){if(!a)return!1;if(T())return!0;const e=a.fullState?.players[a.selfName];return Q()?.seat==="spectator"&&a.phase!=="lobby"?!0:!!(e&&!e.alive&&l.revealFullMap)}function Q(){return a?.players.find(e=>e.name===a?.selfName)??null}function T(){return!!(a&&a.masterName===a.selfName)}function jt(){return!!(a&&a.controllerName===a.selfName)}function tt(){return jt()}function zt(){return!!(a&&a.phase==="lobby"&&jt())}function be(){return!!(a&&a.phase==="lobby"&&jt())}function ye(){return!!(a&&d&&d.foxCandidateName===a.selfName)}function _t(e){switch(e){case"master":return"mestre";case"fox":return"raposa";case"hen":return"galinha";case"spectator":return"espectador";default:return"jogador"}}function ve(e){switch(e){case"lobby":return"lobby";case"running":return"partida em andamento";case"paused_master_disconnect":return"pausado";case"game_over":return"fim da partida";default:return e}}function ft(e){return e==="shop"?"loja":"normal"}function Yn(e){const t=[...e].sort((s,r)=>s.angle-r.angle);let n=-999,o=0;return t.map(s=>{Math.abs(s.angle-n)<18?o+=1:o=0,n=s.angle;const r=s.angle*Math.PI/180,i=40+o*8,u=28+o*6,c=50+Math.cos(r)*i,_=50+Math.sin(r)*u;return{corridorId:s.corridorId,angle:s.angle,left:c,top:_}})}function we(){const e=wt.get("server")??void 0;return e||Tt}async function Zn(){if(!a)return;const e=new URL(window.location.href);e.searchParams.set("room",a.room);const t=e.toString();try{await navigator.clipboard.writeText(t),O("Link da room copiado.")}catch{O(t)}}function O(e){l.toast=e,y(),window.clearTimeout(O.timer),O.timer=window.setTimeout(()=>{l.toast="",y()},2600)}function h(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
