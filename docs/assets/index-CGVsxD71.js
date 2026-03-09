(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();var de=Object.defineProperty,_e=(e,t,n)=>t in e?de(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,b=(e,t,n)=>_e(e,typeof t!="symbol"?t+"":t,n),ft=53,fe=new TextDecoder,Tt=new WeakMap,Mt=new WeakMap,me=class{constructor(e){b(this,"buf"),b(this,"bit_pos"),this.buf=e,this.bit_pos=0}write_bit(e){const t=this.bit_pos>>>3,n=this.bit_pos&7;e&&(this.buf[t]|=1<<n),this.bit_pos++}write_bitsUnsigned(e,t){if(t!==0){if(typeof e=="number"){if(t<=32){if((this.bit_pos&7)===0&&(t&7)===0){let s=e>>>0,i=this.bit_pos>>>3;for(let r=0;r<t;r+=8)this.buf[i++]=s&255,s>>>=8;this.bit_pos+=t;return}let o=e>>>0;for(let s=0;s<t;s++)this.write_bit(o&1),o>>>=1;return}this.write_bitsBigint(BigInt(e),t);return}this.write_bitsBigint(e,t)}}write_bitsBigint(e,t){if(t===0)return;if((this.bit_pos&7)===0&&(t&7)===0){let s=e,i=this.bit_pos>>>3;for(let r=0;r<t;r+=8)this.buf[i++]=Number(s&0xffn),s>>=8n;this.bit_pos+=t;return}let o=e;for(let s=0;s<t;s++)this.write_bit((o&1n)===0n?0:1),o>>=1n}},pe=class{constructor(e){b(this,"buf"),b(this,"bit_pos"),this.buf=e,this.bit_pos=0}read_bit(){const e=this.bit_pos>>>3,t=this.bit_pos&7,n=this.buf[e]>>>t&1;return this.bit_pos++,n}read_bitsUnsigned(e){if(e===0)return 0;if(e<=32){if((this.bit_pos&7)===0&&(e&7)===0){let o=0,s=0,i=this.bit_pos>>>3;for(let r=0;r<e;r+=8)o|=this.buf[i++]<<s,s+=8;return this.bit_pos+=e,o>>>0}let n=0;for(let o=0;o<e;o++)this.read_bit()&&(n|=1<<o);return n>>>0}if(e<=ft){let t=0,n=1;for(let o=0;o<e;o++)this.read_bit()&&(t+=n),n*=2;return t}return this.read_bitsBigint(e)}read_bitsBigint(e){if(e===0)return 0n;if((this.bit_pos&7)===0&&(e&7)===0){let s=0n,i=0n,r=this.bit_pos>>>3;for(let l=0;l<e;l+=8)s|=BigInt(this.buf[r++])<<i,i+=8n;return this.bit_pos+=e,s}let n=0n,o=1n;for(let s=0;s<e;s++)this.read_bit()&&(n+=o),o<<=1n;return n}};function D(e,t){if(!Number.isInteger(e))throw new TypeError(`${t} must be an integer`)}function C(e){if(D(e,"size"),e<0)throw new RangeError("size must be >= 0")}function Lt(e,t){if(t!==e)throw new RangeError(`vector size mismatch: expected ${e}, got ${t}`)}function O(e,t){switch(e.$){case"UInt":case"Int":return C(e.size),e.size;case"Nat":{if(typeof t=="bigint"){if(t<0n)throw new RangeError("Nat must be >= 0");if(t>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Nat too large to size");return Number(t)+1}if(D(t,"Nat"),t<0)throw new RangeError("Nat must be >= 0");return t+1}case"Tuple":{const n=e.fields,o=ot(t,"Tuple");let s=0;for(let i=0;i<n.length;i++)s+=O(n[i],o[i]);return s}case"Vector":{C(e.size);const n=ot(t,"Vector");Lt(e.size,n.length);let o=0;for(let s=0;s<e.size;s++)o+=O(e.type,n[s]);return o}case"Struct":{let n=0;const o=kt(e.fields);for(let s=0;s<o.length;s++){const i=o[s],r=Ft(t,i);n+=O(e.fields[i],r)}return n}case"List":{let n=1;return Bt(t,o=>{n+=1,n+=O(e.type,o)}),n}case"Map":{let n=1;return qt(t,(o,s)=>{n+=1,n+=O(e.key,o),n+=O(e.value,s)}),n}case"Union":{const n=wt(e),o=Ct(t),s=e.variants[o];if(!s)throw new RangeError(`Unknown union variant: ${o}`);const i=Pt(t,s);return n.tag_bits+O(s,i)}case"String":return 1+he(t)*9}}function j(e,t,n){switch(t.$){case"UInt":{if(C(t.size),t.size===0){if(n===0||n===0n)return;throw new RangeError("UInt out of range")}if(typeof n=="bigint"){if(n<0n)throw new RangeError("UInt must be >= 0");const s=1n<<BigInt(t.size);if(n>=s)throw new RangeError("UInt out of range");e.write_bitsUnsigned(n,t.size);return}if(D(n,"UInt"),n<0)throw new RangeError("UInt must be >= 0");if(t.size>ft)throw new RangeError("UInt too large for number; use bigint");const o=2**t.size;if(n>=o)throw new RangeError("UInt out of range");e.write_bitsUnsigned(n,t.size);return}case"Int":{if(C(t.size),t.size===0){if(n===0||n===0n)return;throw new RangeError("Int out of range")}if(typeof n=="bigint"){const r=BigInt(t.size),l=-(1n<<r-1n),c=(1n<<r-1n)-1n;if(n<l||n>c)throw new RangeError("Int out of range");let _=n;n<0n&&(_=(1n<<r)+n),e.write_bitsUnsigned(_,t.size);return}if(D(n,"Int"),t.size>ft)throw new RangeError("Int too large for number; use bigint");const o=-(2**(t.size-1)),s=2**(t.size-1)-1;if(n<o||n>s)throw new RangeError("Int out of range");let i=n;n<0&&(i=2**t.size+n),e.write_bitsUnsigned(i,t.size);return}case"Nat":{if(typeof n=="bigint"){if(n<0n)throw new RangeError("Nat must be >= 0");let o=n;for(;o>0n;)e.write_bit(1),o-=1n;e.write_bit(0);return}if(D(n,"Nat"),n<0)throw new RangeError("Nat must be >= 0");for(let o=0;o<n;o++)e.write_bit(1);e.write_bit(0);return}case"Tuple":{const o=t.fields,s=ot(n,"Tuple");for(let i=0;i<o.length;i++)j(e,o[i],s[i]);return}case"Vector":{C(t.size);const o=ot(n,"Vector");Lt(t.size,o.length);for(let s=0;s<t.size;s++)j(e,t.type,o[s]);return}case"Struct":{const o=kt(t.fields);for(let s=0;s<o.length;s++){const i=o[s];j(e,t.fields[i],Ft(n,i))}return}case"List":{Bt(n,o=>{e.write_bit(1),j(e,t.type,o)}),e.write_bit(0);return}case"Map":{qt(n,(o,s)=>{e.write_bit(1),j(e,t.key,o),j(e,t.value,s)}),e.write_bit(0);return}case"Union":{const o=wt(t),s=Ct(n),i=o.index_by_tag.get(s);if(i===void 0)throw new RangeError(`Unknown union variant: ${s}`);o.tag_bits>0&&e.write_bitsUnsigned(i,o.tag_bits);const r=t.variants[s],l=Pt(n,r);j(e,r,l);return}case"String":{ge(e,n);return}}}function z(e,t){switch(t.$){case"UInt":return C(t.size),e.read_bitsUnsigned(t.size);case"Int":{if(C(t.size),t.size===0)return 0;const n=e.read_bitsUnsigned(t.size);if(typeof n=="bigint"){const s=1n<<BigInt(t.size-1);return n&s?n-(1n<<BigInt(t.size)):n}const o=2**(t.size-1);return n>=o?n-2**t.size:n}case"Nat":{let n=0,o=null;for(;e.read_bit();)o!==null?o+=1n:n===Number.MAX_SAFE_INTEGER?o=BigInt(n)+1n:n++;return o??n}case"Tuple":{const n=new Array(t.fields.length);for(let o=0;o<t.fields.length;o++)n[o]=z(e,t.fields[o]);return n}case"Vector":{const n=new Array(t.size);for(let o=0;o<t.size;o++)n[o]=z(e,t.type);return n}case"Struct":{const n={},o=kt(t.fields);for(let s=0;s<o.length;s++){const i=o[s];n[i]=z(e,t.fields[i])}return n}case"List":{const n=[];for(;e.read_bit();)n.push(z(e,t.type));return n}case"Map":{const n=new Map;for(;e.read_bit();){const o=z(e,t.key),s=z(e,t.value);n.set(o,s)}return n}case"Union":{const n=wt(t);let o=0;n.tag_bits>0&&(o=e.read_bitsUnsigned(n.tag_bits));let s;if(typeof o=="bigint"){if(o>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Union tag index too large");s=Number(o)}else s=o;if(s<0||s>=n.keys.length)throw new RangeError("Union tag index out of range");const i=n.keys[s],r=t.variants[i],l=z(e,r);return r.$==="Struct"&&l&&typeof l=="object"?(l.$=i,l):{$:i,value:l}}case"String":return be(e)}}function ot(e,t){if(!Array.isArray(e))throw new TypeError(`${t} value must be an Array`);return e}function Ft(e,t){if(e&&typeof e=="object")return e[t];throw new TypeError("Struct value must be an object")}function wt(e){const t=Tt.get(e);if(t)return t;const n=Object.keys(e.variants).sort();if(n.length===0)throw new RangeError("Union must have at least one variant");const o=new Map;for(let r=0;r<n.length;r++)o.set(n[r],r);const s=n.length<=1?0:Math.ceil(Math.log2(n.length)),i={keys:n,index_by_tag:o,tag_bits:s};return Tt.set(e,i),i}function kt(e){const t=Mt.get(e);if(t)return t;const n=Object.keys(e);return Mt.set(e,n),n}function Ct(e){if(!e||typeof e!="object")throw new TypeError("Union value must be an object with a $ tag");const t=e.$;if(typeof t!="string")throw new TypeError("Union value must have a string $ tag");return t}function Pt(e,t){return t.$!=="Struct"&&e&&typeof e=="object"&&Object.prototype.hasOwnProperty.call(e,"value")?e.value:e}function Bt(e,t){if(!Array.isArray(e))throw new TypeError("List value must be an Array");for(let n=0;n<e.length;n++)t(e[n])}function qt(e,t){if(e!=null){if(e instanceof Map){for(const[n,o]of e)t(n,o);return}if(typeof e=="object"){for(const n of Object.keys(e))t(n,e[n]);return}throw new TypeError("Map value must be a Map or object")}}function he(e){if(typeof e!="string")throw new TypeError("String value must be a string");let t=0;for(let n=0;n<e.length;n++){const o=e.charCodeAt(n);if(o<128)t+=1;else if(o<2048)t+=2;else if(o>=55296&&o<=56319){const s=n+1<e.length?e.charCodeAt(n+1):0;s>=56320&&s<=57343?(n++,t+=4):t+=3}else o>=56320&&o<=57343,t+=3}return t}function ge(e,t){if(typeof t!="string")throw new TypeError("String value must be a string");for(let n=0;n<t.length;n++){let o=t.charCodeAt(n);if(o<128){e.write_bit(1),e.write_bitsUnsigned(o,8);continue}if(o<2048){e.write_bit(1),e.write_bitsUnsigned(192|o>>>6,8),e.write_bit(1),e.write_bitsUnsigned(128|o&63,8);continue}if(o>=55296&&o<=56319){const s=n+1<t.length?t.charCodeAt(n+1):0;if(s>=56320&&s<=57343){n++;const i=(o-55296<<10)+(s-56320)+65536;e.write_bit(1),e.write_bitsUnsigned(240|i>>>18,8),e.write_bit(1),e.write_bitsUnsigned(128|i>>>12&63,8),e.write_bit(1),e.write_bitsUnsigned(128|i>>>6&63,8),e.write_bit(1),e.write_bitsUnsigned(128|i&63,8);continue}o=65533}else o>=56320&&o<=57343&&(o=65533);e.write_bit(1),e.write_bitsUnsigned(224|o>>>12,8),e.write_bit(1),e.write_bitsUnsigned(128|o>>>6&63,8),e.write_bit(1),e.write_bitsUnsigned(128|o&63,8)}e.write_bit(0)}function be(e){let t=new Uint8Array(16),n=0;for(;e.read_bit();){const o=e.read_bitsUnsigned(8);if(n===t.length){const s=new Uint8Array(t.length*2);s.set(t),t=s}t[n++]=o}return fe.decode(t.subarray(0,n))}function Vt(e,t){const n=O(e,t),o=new Uint8Array(n+7>>>3),s=new me(o);return j(s,e,t),o}function Kt(e,t){const n=new pe(t);return z(n,e)}var J=53,Et={$:"List",type:{$:"UInt",size:8}},Ht={$:"Union",variants:{get_time:{$:"Struct",fields:{}},info_time:{$:"Struct",fields:{time:{$:"UInt",size:J}}},post:{$:"Struct",fields:{room:{$:"String"},time:{$:"UInt",size:J},name:{$:"String"},payload:Et}},info_post:{$:"Struct",fields:{room:{$:"String"},index:{$:"UInt",size:32},server_time:{$:"UInt",size:J},client_time:{$:"UInt",size:J},name:{$:"String"},payload:Et}},load:{$:"Struct",fields:{room:{$:"String"},from:{$:"UInt",size:32}}},watch:{$:"Struct",fields:{room:{$:"String"}}},unwatch:{$:"Struct",fields:{room:{$:"String"}}},get_latest_post_index:{$:"Struct",fields:{room:{$:"String"}}},info_latest_post_index:{$:"Struct",fields:{room:{$:"String"},latest_index:{$:"Int",size:32},server_time:{$:"UInt",size:J}}}}};function At(e){const t=new Array(e.length);for(let n=0;n<e.length;n++)t[n]=e[n];return t}function Ot(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e[n]&255;return t}function ye(e){switch(e.$){case"post":return{$:"post",room:e.room,time:e.time,name:e.name,payload:At(e.payload)};case"info_post":return{$:"info_post",room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,payload:At(e.payload)};default:return e}}function ve(e){switch(e.$){case"post":return{$:"post",room:e.room,time:e.time,name:e.name,payload:Ot(e.payload)};case"info_post":return{$:"info_post",room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,payload:Ot(e.payload)};default:return e}}function F(e){return Vt(Ht,ye(e))}function we(e){const t=Kt(Ht,e);return ve(t)}var xt="wss://net.studiovibi.com";function ke(e){let t=e;try{const n=new URL(e);n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),t=n.toString()}catch{t=e}if(typeof window<"u"&&window.location.protocol==="https:"&&t.startsWith("ws://")){const n=`wss://${t.slice(5)}`;return console.warn(`[VibiNet] Upgrading insecure WebSocket URL "${t}" to "${n}" because the page is HTTPS.`),n}return t}function dt(){return Math.floor(Date.now())}function xe(){return xt}function Wt(){const e="_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",t=new Uint8Array(8);if(typeof crypto<"u"&&typeof crypto.getRandomValues=="function")crypto.getRandomValues(t);else for(let s=0;s<8;s++)t[s]=Math.floor(Math.random()*256);let o="";for(let s=0;s<8;s++)o+=e[t[s]%64];return o}function Ie(e){const t={clock_offset:1/0,lowest_ping:1/0,request_sent_at:0,last_ping:1/0},n=new Map,o=new Set,s=[];let i=!1;const r=[];let l=null,c=null,_=0,y=!1,p=null;const $=[],L=ke(e??xe());function Z(){if(!isFinite(t.clock_offset))throw new Error("server_time() called before initial sync");return Math.floor(dt()+t.clock_offset)}function v(){l!==null&&(clearInterval(l),l=null)}function x(){c!==null&&(clearTimeout(c),c=null)}function E(){const N=Math.min(8e3,500*Math.pow(2,_)),w=Math.floor(Math.random()*250);return N+w}function H(){if(!(!p||p.readyState!==WebSocket.OPEN))for(;$.length>0;){if(!p||p.readyState!==WebSocket.OPEN)return;const f=$[0];try{p.send(f),$.shift()}catch{W();return}}}function Q(){!p||p.readyState!==WebSocket.OPEN||(t.request_sent_at=dt(),p.send(F({$:"get_time"})))}function tt(f){if(!p||p.readyState!==WebSocket.OPEN)return!1;try{return p.send(f),!0}catch{return!1}}function lt(f){tt(f)||W()}function le(f){$.push(f),W()}function Rt(f,I,N){const w=n.get(f);if(w){if(w.packer!==I)throw new Error(`Packed schema already registered for room: ${f}`);N&&(w.handler=N);return}n.set(f,{handler:N,packer:I})}function ue(){if(y||c!==null)return;const f=E();c=setTimeout(()=>{c=null,_+=1,W()},f)}function W(){if(y||p&&(p.readyState===WebSocket.OPEN||p.readyState===WebSocket.CONNECTING))return;x();const f=new WebSocket(L);p=f,f.binaryType="arraybuffer",f.addEventListener("open",()=>{if(p===f){_=0,console.log("[WS] Connected"),Q(),v();for(const I of o.values())f.send(F({$:"watch",room:I}));H(),l=setInterval(Q,2e3)}}),f.addEventListener("message",I=>{const N=I.data instanceof ArrayBuffer?new Uint8Array(I.data):new Uint8Array(I.data),w=we(N);switch(w.$){case"info_time":{const T=dt(),A=T-t.request_sent_at;if(t.last_ping=A,A<t.lowest_ping){const ut=Math.floor((t.request_sent_at+T)/2);t.clock_offset=w.time-ut,t.lowest_ping=A}if(!i){i=!0;for(const ut of r)ut();r.length=0}break}case"info_post":{const T=n.get(w.room);if(T&&T.handler){const A=Kt(T.packer,w.payload);T.handler({$:"info_post",room:w.room,index:w.index,server_time:w.server_time,client_time:w.client_time,name:w.name,data:A})}break}case"info_latest_post_index":{for(const T of s)T({room:w.room,latest_index:w.latest_index,server_time:w.server_time});break}}}),f.addEventListener("close",I=>{p===f&&(v(),p=null,!y&&(console.warn(`[WS] Disconnected (code=${I.code}); reconnecting...`),ue()))}),f.addEventListener("error",()=>{})}return W(),{on_sync:f=>{if(i){f();return}r.push(f)},watch:(f,I,N)=>{Rt(f,I,N),o.add(f),lt(F({$:"watch",room:f}))},load:(f,I,N,w)=>{Rt(f,N,w),lt(F({$:"load",room:f,from:I}))},get_latest_post_index:f=>{lt(F({$:"get_latest_post_index",room:f}))},on_latest_post_index:f=>{s.push(f)},post:(f,I,N)=>{const w=Wt(),T=Vt(N,I),A=F({$:"post",room:f,time:Z(),name:w,payload:T});return $.length>0&&H(),tt(A)||le(A),w},server_time:Z,ping:()=>t.last_ping,close:()=>{if(y=!0,x(),v(),p&&p.readyState===WebSocket.OPEN)for(const f of o.values())try{p.send(F({$:"unwatch",room:f}))}catch{break}p&&p.close(),p=null},debug_dump:()=>({ws_url:L,ws_ready_state:p?p.readyState:WebSocket.CLOSED,is_synced:i,reconnect_attempt:_,reconnect_scheduled:c!==null,pending_post_count:$.length,watched_rooms:Array.from(o.values()),room_watchers:Array.from(n.keys()),room_watcher_count:n.size,latest_post_index_listener_count:s.length,sync_listener_count:r.length,time_sync:{clock_offset:t.clock_offset,lowest_ping:t.lowest_ping,request_sent_at:t.request_sent_at,last_ping:t.last_ping}})}}var mt=class{constructor(t){b(this,"room"),b(this,"init"),b(this,"on_tick"),b(this,"on_post"),b(this,"packer"),b(this,"smooth"),b(this,"tick_rate"),b(this,"tolerance"),b(this,"client_api"),b(this,"remote_posts"),b(this,"local_posts"),b(this,"timeline"),b(this,"cache_enabled"),b(this,"snapshot_stride"),b(this,"snapshot_count"),b(this,"snapshots"),b(this,"snapshot_start_tick"),b(this,"initial_time_value"),b(this,"initial_tick_value"),b(this,"no_pending_posts_before_ms"),b(this,"max_contiguous_remote_index"),b(this,"cache_drop_guard_hits"),b(this,"latest_index_poll_interval_id"),b(this,"max_remote_index");const n=(c,_)=>c,o=t.smooth??n,s=t.cache??!0,i=t.snapshot_stride??8,r=t.snapshot_count??256,l=t.client??Ie(t.server);this.room=t.room,this.init=t.initial,this.on_tick=t.on_tick,this.on_post=t.on_post,this.packer=t.packer,this.smooth=o,this.tick_rate=t.tick_rate,this.tolerance=t.tolerance,this.client_api=l,this.remote_posts=new Map,this.local_posts=new Map,this.timeline=new Map,this.cache_enabled=s,this.snapshot_stride=Math.max(1,Math.floor(i)),this.snapshot_count=Math.max(1,Math.floor(r)),this.snapshots=new Map,this.snapshot_start_tick=null,this.initial_time_value=null,this.initial_tick_value=null,this.no_pending_posts_before_ms=null,this.max_contiguous_remote_index=-1,this.cache_drop_guard_hits=0,this.latest_index_poll_interval_id=null,this.max_remote_index=-1,this.client_api.on_latest_post_index&&this.client_api.on_latest_post_index(c=>{this.on_latest_post_index_info(c)}),this.client_api.on_sync(()=>{console.log(`[VIBI] synced; loading+watching room=${this.room}`);const c=_=>{_.name&&this.remove_local_post(_.name),this.add_remote_post(_)};this.client_api.load(this.room,0,this.packer,c),this.client_api.watch(this.room,this.packer,c),this.request_latest_post_index(),this.latest_index_poll_interval_id!==null&&clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=setInterval(()=>{this.request_latest_post_index()},2e3)})}official_time(t){return t.client_time<=t.server_time-this.tolerance?t.server_time-this.tolerance:t.client_time}official_tick(t){return this.time_to_tick(this.official_time(t))}get_bucket(t){let n=this.timeline.get(t);return n||(n={remote:[],local:[]},this.timeline.set(t,n)),n}insert_remote_post(t,n){const o=this.get_bucket(n);o.remote.push(t),o.remote.sort((s,i)=>s.index-i.index)}invalidate_from_tick(t){if(!this.cache_enabled)return;const n=this.snapshot_start_tick;if(n!==null&&t<n||n===null||this.snapshots.size===0)return;const o=this.snapshot_stride,s=n+(this.snapshots.size-1)*o;if(!(t>s)){if(t<=n){this.snapshots.clear();return}for(let i=s;i>=t;i-=o)this.snapshots.delete(i)}}advance_state(t,n,o){let s=t;for(let i=n+1;i<=o;i++)s=this.apply_tick(s,i);return s}prune_before_tick(t){if(!this.cache_enabled)return;const n=this.safe_prune_tick();n!==null&&t>n&&(this.cache_drop_guard_hits+=1,t=n);for(const o of this.timeline.keys())o<t&&this.timeline.delete(o);for(const[o,s]of this.remote_posts.entries())this.official_tick(s)<t&&this.remote_posts.delete(o);for(const[o,s]of this.local_posts.entries())this.official_tick(s)<t&&this.local_posts.delete(o)}tick_ms(){return 1e3/this.tick_rate}cache_window_ticks(){return this.snapshot_stride*Math.max(0,this.snapshot_count-1)}safe_prune_tick(){return this.no_pending_posts_before_ms===null?null:this.time_to_tick(this.no_pending_posts_before_ms)}safe_compute_tick(t){if(!this.cache_enabled)return t;const n=this.safe_prune_tick();if(n===null)return t;const o=n+this.cache_window_ticks();return Math.min(t,o)}advance_no_pending_posts_before_ms(t){const n=Math.max(0,Math.floor(t));(this.no_pending_posts_before_ms===null||n>this.no_pending_posts_before_ms)&&(this.no_pending_posts_before_ms=n)}advance_contiguous_remote_frontier(){for(;;){const t=this.max_contiguous_remote_index+1,n=this.remote_posts.get(t);if(!n)break;this.max_contiguous_remote_index=t,this.advance_no_pending_posts_before_ms(this.official_time(n))}}on_latest_post_index_info(t){if(t.room!==this.room||t.latest_index>this.max_contiguous_remote_index)return;const n=this.tick_ms(),o=t.server_time-this.tolerance-n;this.advance_no_pending_posts_before_ms(o)}request_latest_post_index(){if(this.client_api.get_latest_post_index)try{this.client_api.get_latest_post_index(this.room)}catch{}}ensure_snapshots(t,n){if(!this.cache_enabled)return;this.snapshot_start_tick===null&&(this.snapshot_start_tick=n);let o=this.snapshot_start_tick;if(o===null||t<o)return;const s=this.snapshot_stride,i=o+Math.floor((t-o)/s)*s;let r,l;if(this.snapshots.size===0)r=this.init,l=o-1;else{const y=o+(this.snapshots.size-1)*s;r=this.snapshots.get(y),l=y}let c=l+s;for(this.snapshots.size===0&&(c=o);c<=i;c+=s)r=this.advance_state(r,l,c),this.snapshots.set(c,r),l=c;const _=this.snapshots.size;if(_>this.snapshot_count){const y=_-this.snapshot_count,p=o+y*s;for(let $=o;$<p;$+=s)this.snapshots.delete($);o=p,this.snapshot_start_tick=o}this.prune_before_tick(o)}add_remote_post(t){const n=this.official_tick(t);if(t.index===0&&this.initial_time_value===null){const s=this.official_time(t);this.initial_time_value=s,this.initial_tick_value=this.time_to_tick(s)}if(this.remote_posts.has(t.index))return;this.cache_enabled&&this.snapshot_start_tick!==null&&n<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.remote_posts.set(t.index,t),t.index>this.max_remote_index&&(this.max_remote_index=t.index),this.advance_contiguous_remote_frontier(),this.insert_remote_post(t,n),this.invalidate_from_tick(n)}add_local_post(t,n){this.local_posts.has(t)&&this.remove_local_post(t);const o=this.official_tick(n);this.cache_enabled&&this.snapshot_start_tick!==null&&o<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.local_posts.set(t,n),this.get_bucket(o).local.push(n),this.invalidate_from_tick(o)}remove_local_post(t){const n=this.local_posts.get(t);if(!n)return;this.local_posts.delete(t);const o=this.official_tick(n),s=this.timeline.get(o);if(s){const i=s.local.indexOf(n);if(i!==-1)s.local.splice(i,1);else{const r=s.local.findIndex(l=>l.name===t);r!==-1&&s.local.splice(r,1)}s.remote.length===0&&s.local.length===0&&this.timeline.delete(o)}this.invalidate_from_tick(o)}apply_tick(t,n){let o=this.on_tick(t);const s=this.timeline.get(n);if(s){for(const i of s.remote)o=this.on_post(i.data,o);for(const i of s.local)o=this.on_post(i.data,o)}return o}compute_state_at_uncached(t,n){let o=this.init;for(let s=t;s<=n;s++)o=this.apply_tick(o,s);return o}post_to_debug_dump(t){return{room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,official_time:this.official_time(t),official_tick:this.official_tick(t),data:t.data}}timeline_tick_bounds(){let t=null,n=null;for(const o of this.timeline.keys())(t===null||o<t)&&(t=o),(n===null||o>n)&&(n=o);return{min:t,max:n}}snapshot_tick_bounds(){let t=null,n=null;for(const o of this.snapshots.keys())(t===null||o<t)&&(t=o),(n===null||o>n)&&(n=o);return{min:t,max:n}}time_to_tick(t){return Math.floor(t*this.tick_rate/1e3)}server_time(){return this.client_api.server_time()}server_tick(){return this.time_to_tick(this.server_time())}post_count(){return this.max_remote_index+1}compute_render_state(){const t=this.server_tick(),n=1e3/this.tick_rate,o=Math.ceil(this.tolerance/n),s=this.client_api.ping(),i=isFinite(s)?Math.ceil(s/2/n):0,r=Math.max(o,i+1),l=Math.max(0,t-r),c=this.compute_state_at(l),_=this.compute_state_at(t);return this.smooth(c,_)}initial_time(){if(this.initial_time_value!==null)return this.initial_time_value;const t=this.remote_posts.get(0);if(!t)return null;const n=this.official_time(t);return this.initial_time_value=n,this.initial_tick_value=this.time_to_tick(n),n}initial_tick(){if(this.initial_tick_value!==null)return this.initial_tick_value;const t=this.initial_time();return t===null?null:(this.initial_tick_value=this.time_to_tick(t),this.initial_tick_value)}compute_state_at(t){t=this.safe_compute_tick(t);const n=this.initial_tick();if(n===null)return this.init;if(t<n)return this.init;if(!this.cache_enabled)return this.compute_state_at_uncached(n,t);this.ensure_snapshots(t,n);const o=this.snapshot_start_tick;if(o===null||this.snapshots.size===0)return this.init;if(t<o)return this.snapshots.get(o)??this.init;const s=this.snapshot_stride,i=o+(this.snapshots.size-1)*s,r=Math.floor((i-o)/s),l=Math.floor((t-o)/s),c=Math.min(l,r),_=o+c*s,y=this.snapshots.get(_)??this.init;return this.advance_state(y,_,t)}debug_dump(){const t=Array.from(this.remote_posts.values()).sort((v,x)=>v.index-x.index).map(v=>this.post_to_debug_dump(v)),n=Array.from(this.local_posts.values()).sort((v,x)=>{const E=this.official_tick(v),H=this.official_tick(x);if(E!==H)return E-H;const Q=v.name??"",tt=x.name??"";return Q.localeCompare(tt)}).map(v=>this.post_to_debug_dump(v)),o=Array.from(this.timeline.entries()).sort((v,x)=>v[0]-x[0]).map(([v,x])=>({tick:v,remote_count:x.remote.length,local_count:x.local.length,remote_posts:x.remote.map(E=>this.post_to_debug_dump(E)),local_posts:x.local.map(E=>this.post_to_debug_dump(E))})),s=Array.from(this.snapshots.entries()).sort((v,x)=>v[0]-x[0]).map(([v,x])=>({tick:v,state:x})),i=this.initial_time(),r=this.initial_tick(),l=this.timeline_tick_bounds(),c=this.snapshot_tick_bounds(),_=r!==null&&l.min!==null&&l.min>r;let y=null,p=null;try{y=this.server_time(),p=this.server_tick()}catch{y=null,p=null}let $=null,L=null;for(const v of this.remote_posts.keys())($===null||v<$)&&($=v),(L===null||v>L)&&(L=v);const Z=typeof this.client_api.debug_dump=="function"?this.client_api.debug_dump():null;return{room:this.room,tick_rate:this.tick_rate,tolerance:this.tolerance,cache_enabled:this.cache_enabled,snapshot_stride:this.snapshot_stride,snapshot_count:this.snapshot_count,snapshot_start_tick:this.snapshot_start_tick,no_pending_posts_before_ms:this.no_pending_posts_before_ms,max_contiguous_remote_index:this.max_contiguous_remote_index,initial_time:i,initial_tick:r,max_remote_index:this.max_remote_index,post_count:this.post_count(),server_time:y,server_tick:p,ping:this.ping(),history_truncated:_,cache_drop_guard_hits:this.cache_drop_guard_hits,counts:{remote_posts:this.remote_posts.size,local_posts:this.local_posts.size,timeline_ticks:this.timeline.size,snapshots:this.snapshots.size},ranges:{timeline_min_tick:l.min,timeline_max_tick:l.max,snapshot_min_tick:c.min,snapshot_max_tick:c.max,min_remote_index:$,max_remote_index:L},remote_posts:t,local_posts:n,timeline:o,snapshots:s,client_debug:Z}}debug_recompute(t){const n=this.initial_tick(),o=this.timeline_tick_bounds(),s=n!==null&&o.min!==null&&o.min>n;let i=t;if(i===void 0)try{i=this.server_tick()}catch{i=void 0}i===void 0&&(i=n??0);const r=this.snapshots.size;this.snapshots.clear(),this.snapshot_start_tick=null;const l=[];if(s&&l.push("Local history before timeline_min_tick was pruned; full room replay may be impossible without reloading posts."),n===null||i<n)return l.push("No replayable post range available at target tick."),{target_tick:i,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:r,history_truncated:s,state:this.init,notes:l};const c=this.compute_state_at_uncached(n,i);return{target_tick:i,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:r,history_truncated:s,state:c,notes:l}}post(t){const n=this.client_api.post(this.room,t,this.packer),o=this.server_time(),s={room:this.room,index:-1,server_time:o,client_time:o,name:n,data:t};this.add_local_post(n,s)}compute_current_state(){return this.compute_state_at(this.server_tick())}on_sync(t){this.client_api.on_sync(t)}ping(){return this.client_api.ping()}close(){this.latest_index_poll_interval_id!==null&&(clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=null),this.client_api.close()}static gen_name(){return Wt()}};b(mt,"game",mt);var $e=mt;const jt=220,_t=["#f25f5c","#247ba0","#70c1b3","#f7b267","#8e6c88","#5c80bc","#9bc53d","#f18f01"],Se=24;function h(e){return`room-${e}`}function It(e,t){return`corridor:${e}:${t}`}function Ne(e,t){return e<t?[e,t]:[t,e]}function k(e){return JSON.parse(JSON.stringify(e))}function Re(e){return e.trim().replace(/\s+/g," ").slice(0,24)}function Te(e){return e.trim().replace(/\s+/g,"-").slice(0,36).toLowerCase()}function Me(e){return JSON.stringify(e)}function Ee(){return{phase:"lobby",masterName:null,roster:{},publicState:null,fullState:null,actionRequests:[],consumedActionIds:[],message:null,clockTick:0,nextJoinOrder:0}}function Ae(e){return{...e,clockTick:e.clockTick+1}}function Oe(e,t){let n;try{n=JSON.parse(e)}catch{return t}switch(n.$){case"join_room":return ze(t,n);case"heartbeat":return Ue(t,n);case"claim_master":return Le(t,n);case"publish_state":return Fe(t,n);case"submit_move":return zt(t,{id:n.requestId,type:"move",actorName:n.actorName,corridorId:n.corridorId},n.name,n.sessionId);case"select_kill_target":return zt(t,{id:n.requestId,type:"kill",actorName:n.actorName,targetName:n.targetName},n.name,n.sessionId);default:return t}}function je(e,t,n){const o=new Set(n.consumedActionIds),s=Object.values(n.roster).sort((l,c)=>l.joinedAt-c.joinedAt).map(l=>{const c=n.fullState?.players[l.name],_=n.masterName===l.name,y=c?.seat??l.seat,p=c?.role??(_?"master":y==="spectator"?"spectator":"player");return{name:l.name,color:c?.color??l.color,joinedAt:c?.joinedAt??l.joinedAt,connected:Ce(n,l),seat:y,isMaster:_,role:p,alive:c?.alive??!1}}),i=s.find(l=>l.name===t)??null,r=n.actionRequests.filter(l=>!o.has(l.id));return{room:e,selfName:t,phase:n.phase,masterName:n.masterName,players:s,publicState:n.publicState,fullState:n.fullState,canClaimMaster:n.phase==="lobby"&&!n.masterName&&i?.seat!=="spectator",canBecomeMaster:!1,swapMode:"none",swapVotes:[],eligibleNames:[],message:n.message,pendingActions:r}}function ze(e,t){const n=k(e),o=n.roster[t.name];if(o)return o.activeSessionId=t.sessionId,o.lastSeenTick=n.clockTick,n.message=null,n;const s=n.nextJoinOrder+1,i={name:t.name,color:_t[n.nextJoinOrder%_t.length]??_t[0],joinedAt:s,seat:n.phase==="lobby"?"participant":"spectator",activeSessionId:t.sessionId,lastSeenTick:n.clockTick};return n.nextJoinOrder+=1,n.roster[i.name]=i,n.message=n.phase==="lobby"?null:"Partida em andamento. Novo ingresso como espectador.",n}function Ue(e,t){if(!it(e,t.name,t.sessionId))return e;const n=k(e),o=n.roster[t.name];return o?(o.lastSeenTick=n.clockTick,n):e}function Le(e,t){if(e.phase!=="lobby"||e.masterName||!it(e,t.name,t.sessionId))return e;const n=k(e);return n.masterName=t.name,n.message=`${t.name} virou mestre.`,n}function Fe(e,t){if(e.masterName!==t.name||!it(e,t.name,t.sessionId))return e;const n=k(e);n.fullState=k(t.fullState),n.publicState=k(t.publicState),n.phase=t.fullState.phase,n.masterName=t.fullState.masterName??n.masterName,n.message=null;const o=new Set(n.consumedActionIds);for(const s of t.consumedActionIds)o.add(s);n.consumedActionIds=[...o].slice(-256),n.actionRequests=n.actionRequests.filter(s=>!o.has(s.id)),n.phase==="lobby"&&(n.actionRequests=[],n.consumedActionIds=[]);for(const s of Object.values(n.fullState.players)){const i=n.roster[s.name]??{name:s.name,color:s.color,joinedAt:s.joinedAt,seat:s.seat,activeSessionId:null,lastSeenTick:-99999};i.color=s.color,i.joinedAt=s.joinedAt,i.seat=s.seat,n.roster[s.name]=i}return n}function zt(e,t,n,o){if(e.phase!=="running"||!it(e,n,o)||n!==t.actorName&&e.masterName!==n||e.actionRequests.some(i=>i.id===t.id)||e.consumedActionIds.includes(t.id))return e;const s=k(e);return s.actionRequests.push(t),s}function it(e,t,n){return e.roster[t]?.activeSessionId===n}function Ce(e,t){return t.activeSessionId?e.clockTick-t.lastSeenTick<=Se:!1}function st(e,t){const n=Math.atan2(t.y-e.y,t.x-e.x);return Math.round((n*180/Math.PI+360)%360)}function Jt(e,t,n,o="normal"){return{id:e,x:t,y:n,type:o}}function Dt(){const e={},t={};for(let o=0;o<3;o+=1)for(let s=0;s<3;s+=1){const i=o*3+s+1,r=h(i);e[r]=Jt(r,180+s*jt,160+o*jt)}const n=[[h(1),h(2)],[h(2),h(3)],[h(4),h(5)],[h(5),h(6)],[h(7),h(8)],[h(8),h(9)],[h(1),h(4)],[h(4),h(7)],[h(2),h(5)],[h(5),h(8)],[h(3),h(6)],[h(6),h(9)],[h(1),h(5)],[h(5),h(9)]];for(const[o,s]of n){const i=Gt(e[o],e[s]);t[i.id]=i}return{rooms:e,corridors:t}}function Pe(e,t,n){const{rooms:o,corridors:s}=Dt(),i={};for(const r of t)i[r.name]={name:r.name,color:r.color,joinedAt:r.joinedAt,seat:r.seat,role:r.isMaster?"master":r.seat==="spectator"?"spectator":"player",alive:!1,locationRoomId:null,hasFullInfo:r.isMaster||r.seat==="spectator"};return{phase:"lobby",masterName:n,foxName:null,foxCandidateName:null,round:0,currentTurnName:null,players:i,rooms:o,corridors:s,henOrder:[],pendingKillTargets:[]}}function $t(e,t,n){const o=k(e);o.masterName=n;for(const s of t){const i=o.players[s.name],r=s.isMaster?"master":s.seat==="spectator"?"spectator":i?.role&&i.role!=="spectator"?i.role:"player";o.players[s.name]={name:s.name,color:s.color,joinedAt:s.joinedAt,seat:s.seat,role:r,alive:i?.alive??!1,locationRoomId:i?.locationRoomId??null,hasFullInfo:s.isMaster||s.seat==="spectator"||i?.hasFullInfo===!0}}for(const s of Object.keys(o.players))t.find(i=>i.name===s)||(o.players[s].seat="participant");if(n)for(const s of Object.values(o.players))s.name===n&&(s.role="master",s.hasFullInfo=!0,s.alive=!1,s.locationRoomId=null);return o}function Gt(e,t){const n=st(e,t),o=st(t,e);return{id:It(e.id,t.id),fromRoomId:e.id,toRoomId:t.id,angleFrom:n,angleTo:o}}function Be(e,t,n){const o=k(e),[s,i]=Ne(t,n),r=It(s,i);if(o.corridors[r])return delete o.corridors[r],o;const l=o.rooms[t],c=o.rooms[n];return!l||!c?e:(o.corridors[r]=Gt(l,c),o)}function qe(e){const t=k(e),n=Object.keys(t.rooms).map(s=>Number(s.split("-")[1]??0)),o=h((Math.max(0,...n)||0)+1);return t.rooms[o]=Jt(o,320,320,"normal"),t}function Ve(e,t){const n=k(e);delete n.rooms[t];for(const o of Object.keys(n.corridors)){const s=n.corridors[o];(s.fromRoomId===t||s.toRoomId===t)&&delete n.corridors[o]}for(const o of Object.values(n.players))o.locationRoomId===t&&(o.locationRoomId=null);return n}function Ke(e,t,n,o){const s=k(e),i=s.rooms[t];if(!i)return e;i.x=n,i.y=o;for(const r of Object.values(s.corridors))if(r.fromRoomId===t||r.toRoomId===t){const l=s.rooms[r.fromRoomId],c=s.rooms[r.toRoomId];r.angleFrom=st(l,c),r.angleTo=st(c,l)}return s}function He(e,t){const n=k(e),o=n.rooms[t];return o?(o.type=o.type==="normal"?"shop":"normal",n):e}function We(e,t){const n=k(e),o=It(t,t);return n.corridors[o]?(delete n.corridors[o],n):(n.corridors[o]={id:o,fromRoomId:t,toRoomId:t,angleFrom:0,angleTo:0},n)}function Je(e){const t=k(e),n=Object.values(t.players).filter(s=>s.seat==="participant"&&s.role!=="master").sort((s,i)=>s.joinedAt-i.joinedAt);if(n.length===0)return t.foxCandidateName=null,t;const o=Math.floor(Math.random()*n.length);return t.foxCandidateName=n[o]?.name??null,t}function De(e,t){const n=k(e);return n.foxCandidateName=t,n}function Ge(e,t){const n=$t(e,t,e.masterName),o=t.filter(c=>c.seat==="participant"&&!c.isMaster&&c.connected).sort((c,_)=>c.joinedAt-_.joinedAt);if(o.length<2||o.length>8)return null;const s=n.foxCandidateName&&o.find(c=>c.name===n.foxCandidateName)?n.foxCandidateName:o[Math.floor(Math.random()*o.length)]?.name??null;if(!s)return null;const i=Object.keys(n.rooms);if(i.length===0)return null;const r=[...i].sort(()=>Math.random()-.5),l=o.filter(c=>c.name!==s).map(c=>c.name);o.forEach((c,_)=>{const y=n.players[c.name];y.alive=!0,y.locationRoomId=r[_%r.length]??i[0]??null,y.role=c.name===s?"fox":"hen",y.hasFullInfo=!1});for(const c of Object.values(n.players))c.role==="spectator"&&(c.alive=!1,c.hasFullInfo=!0,c.locationRoomId=null),c.role==="master"&&(c.hasFullInfo=!0,c.alive=!1,c.locationRoomId=null);return n.phase="running",n.round=1,n.foxName=s,n.pendingKillTargets=[],n.henOrder=l,n.currentTurnName=l[0]??s,n}function Xe(e,t){const n=$t(e,t,e.masterName);n.phase="lobby",n.foxName=null,n.foxCandidateName=null,n.round=0,n.currentTurnName=null,n.pendingKillTargets=[],n.henOrder=[];for(const o of Object.values(n.players))o.role!=="master"&&o.seat==="participant"?(o.role="player",o.alive=!1,o.locationRoomId=null,o.hasFullInfo=!1):o.seat==="spectator"&&(o.role="spectator",o.alive=!1,o.locationRoomId=null,o.hasFullInfo=!0);return n}function Ye(e,t){const n={},o=Object.values(e.players).filter(s=>s.role==="hen"||s.role==="fox").sort((s,i)=>s.joinedAt-i.joinedAt).map(s=>s.name);for(const s of o){const i=e.players[s],r=i.locationRoomId,l=r?e.rooms[r]:null,c=r?Object.values(e.players).filter(_=>_.locationRoomId===r&&_.alive).map(_=>{const y=t.find(p=>p.name===_.name);return{name:_.name,color:_.color,role:_.role,alive:_.alive,connected:y?.connected??!1}}):[];n[s]={name:s,roomId:r,roomType:l?.type??null,playersHere:c,exits:r?Ze(e,r):[],alive:i.alive,connected:t.find(_=>_.name===s)?.connected??!1,canAct:e.currentTurnName===s}}return{phase:e.phase,round:e.round,currentTurnName:e.currentTurnName,screens:n,watchOrder:o,pendingKillTargets:[...e.pendingKillTargets]}}function Ze(e,t){return Object.values(e.corridors).flatMap(n=>n.fromRoomId===t&&n.toRoomId===t?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!0}]:n.fromRoomId===t?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!1}]:n.toRoomId===t?[{corridorId:n.id,angle:n.angleTo,leadsToSelf:!1}]:[]).sort((n,o)=>n.angle-o.angle)}function Xt(e,t,n){if(e.phase!=="running"||e.currentTurnName!==t||e.pendingKillTargets.length>0)return e;const o=k(e),s=o.players[t];if(!s||!s.alive)return e;if(n===null)return et(o);const i=o.corridors[n];if(!i||!s.locationRoomId)return e;if(i.fromRoomId===s.locationRoomId&&i.toRoomId===s.locationRoomId)s.locationRoomId=i.toRoomId;else if(i.fromRoomId===s.locationRoomId)s.locationRoomId=i.toRoomId;else if(i.toRoomId===s.locationRoomId)s.locationRoomId=i.fromRoomId;else return e;if(s.role==="fox"){const r=Qe(o,s.locationRoomId);return r.length===0?et(o):r.length===1?Zt(o,r[0]??""):(o.pendingKillTargets=r,o)}return et(o)}function Yt(e,t,n){if(e.phase!=="running"||e.currentTurnName!==t||e.pendingKillTargets.length===0||!e.pendingKillTargets.includes(n))return e;const o=k(e);return Zt(o,n)}function Zt(e,t){const n=e.players[t];return n?(n.alive=!1,n.hasFullInfo=!0,e.pendingKillTargets=[],Object.values(e.players).some(s=>s.role==="hen"&&s.alive)?et(e):(e.phase="game_over",e.currentTurnName=null,e)):e}function Qe(e,t){return t?Object.values(e.players).filter(n=>n.role==="hen"&&n.alive&&n.locationRoomId===t).map(n=>n.name):[]}function et(e){const n=[...e.henOrder.filter(i=>e.players[i]?.alive),...e.foxName&&e.players[e.foxName]?.alive?[e.foxName]:[]];if(n.length===0)return e.phase="game_over",e.currentTurnName=null,e;const o=e.currentTurnName?n.indexOf(e.currentTurnName):-1,s=o+1;return o===-1||s>=n.length?(e.round=Math.max(1,e.round)+(o===-1?0:1),e.currentTurnName=n[0]??null):e.currentTurnName=n[s]??null,e.pendingKillTargets=[],e}const Qt="vibi-maze-name",te="vibi-maze-room",ee="vibi-maze-session",G=900,X=660,tn=200,en=2500,nn={$:"String"},pt=new URLSearchParams(window.location.search),u={roomInput:pt.get("room")??window.localStorage.getItem(te)??"galinheiro-1",nameInput:pt.get("name")??window.localStorage.getItem(Qt)??"",followTurn:!0,watchName:null,sideRailOpen:!0,revealFullMap:!1,selectedRoomId:null,connectSourceRoomId:null,dragRoomId:null,toast:""};let M=null,Y="idle",ht=null,gt=null,P=dn(),q=null,V=null,bt=null,a=null,yt="",d=null,vt="",nt="";const ne=document.querySelector("#app");if(!ne)throw new Error("Elemento #app não encontrado.");const B=ne;B.addEventListener("submit",e=>{const t=e.target;t instanceof HTMLFormElement&&t.dataset.form==="join"&&(e.preventDefault(),on())});B.addEventListener("input",e=>{const t=e.target;t instanceof HTMLInputElement&&(t.name==="room"&&(u.roomInput=t.value),t.name==="name"&&(u.nameInput=t.value))});B.addEventListener("change",e=>{const t=e.target;if(t instanceof HTMLElement){if(t instanceof HTMLSelectElement&&t.dataset.action==="fox-select"){if(!d)return;d=De(d,t.value),S(),g()}t instanceof HTMLInputElement&&t.dataset.action==="follow-toggle"&&(u.followTurn=t.checked,u.followTurn&&(u.watchName=a?.publicState?.currentTurnName??a?.selfName??null),g())}});B.addEventListener("click",async e=>{const t=e.target;if(!(t instanceof HTMLElement))return;const n=t.closest("[data-action]");if(!n)return;const o=n.dataset.action;if(o)switch(o){case"claim-master":if(!a)return;K({$:"claim_master",name:a.selfName,sessionId:P});break;case"copy-link":await jn();break;case"toggle-rail":u.sideRailOpen=!u.sideRailOpen,g();break;case"watch-screen":u.watchName=n.dataset.name??a?.selfName??null,u.followTurn=!1,g();break;case"self-screen":u.watchName=a?.selfName??null,u.followTurn=!1,g();break;case"reveal-full-map":u.revealFullMap=!0,g();break;case"vote-swap-master":case"become-master":case"abandon-match":U("Troca de mestre nao existe nesta branch.");break;case"editor-add-room":if(!d)return;d=qe(d),S(),g();break;case"editor-default":if(!d)return;{const s=Dt();d={...d,rooms:s.rooms,corridors:s.corridors}}S(),g();break;case"editor-connect":u.connectSourceRoomId=u.selectedRoomId,g();break;case"editor-cycle-type":if(!d||!u.selectedRoomId)return;d=He(d,u.selectedRoomId),S(),g();break;case"editor-remove-room":if(!d||!u.selectedRoomId)return;d=Ve(d,u.selectedRoomId),u.selectedRoomId=null,u.connectSourceRoomId=null,S(),g();break;case"editor-loop":if(!d||!u.selectedRoomId)return;d=We(d,u.selectedRoomId),S(),g();break;case"shuffle-fox":if(!d)return;d=Je(d),S(),g();break;case"start-game":if(!d||!a)return;{const s=Ge(d,a.players);if(!s){U("Precisa de pelo menos 2 jogadores ativos além do mestre para iniciar.");return}d=s,u.revealFullMap=!1}S(),g();break;case"back-to-lobby":if(!d||!a)return;d=Xe(d,a.players),u.revealFullMap=!1,S(),g();break;case"submit-pass":Ut(null);break;case"submit-move":Ut(n.dataset.corridorId??null);break;case"kill-target":an(n.dataset.targetName??"");break}});window.addEventListener("keydown",e=>{e.key==="Escape"&&a&&(u.watchName=a.selfName,u.followTurn=!1,g())});g();function on(){const e=Te(u.roomInput),t=Re(u.nameInput);if(!e||!t){U("Informe room e nome.");return}u.roomInput=e,u.nameInput=t,window.localStorage.setItem(te,e),window.localStorage.setItem(Qt,t),ht=e,gt=t,P=ie(),un(),a=null,yt="",bt=null,d=null,vt="",nt="",Y="connecting";const n={room:e,initial:Ee(),on_tick:Ae,on_post:Oe,packer:nn,tick_rate:6,tolerance:300},o=Nt();o!==xt&&(n.server=o),M=new $e.game(n),M.on_sync(()=>{Y="connected",K({$:"join_room",name:t,sessionId:P}),ln(),oe(),g()}),g()}function oe(){if(!M||!ht||!gt)return;bt=M.compute_render_state();const e=je(ht,gt,bt);if(e.fullState){const n=JSON.stringify(e.fullState);n!==nt&&!u.dragRoomId&&(nt=n,(!d||e.masterName!==e.selfName)&&(d=k(e.fullState)))}else nt="";a=e,sn();const t=JSON.stringify(a);t!==yt&&(yt=t,g())}function sn(){if(!a)return;if(R()){const t=d??a.fullState??Pe(a.room,a.players,a.masterName);d=$t(t,a.players,a.masterName),rn()||S()}const e=rt();e&&e.seat==="spectator"&&a.phase!=="lobby"&&(u.revealFullMap=!0),u.followTurn?u.watchName=a.publicState?.currentTurnName??a.selfName:u.watchName||(u.watchName=a.selfName)}function rn(){if(!a||!d)return!1;const e=a.pendingActions;if(e.length===0)return!1;let t=d;const n=[];for(const o of e)t=o.type==="move"?Xt(t,o.actorName,o.corridorId):Yt(t,o.actorName,o.targetName),n.push(o.id);return d=t,S(n),g(),!0}function S(e=[]){if(!a||!d||!R())return;const t=Ye(d,a.players),n=k(d),o=JSON.stringify({fullState:n,publicState:t,consumedActionIds:e});o!==vt&&(vt=o,K({$:"publish_state",name:a.selfName,sessionId:P,fullState:n,publicState:t,consumedActionIds:e}))}function Ut(e){if(!a)return;const t=St();if(t){if(R()){if(!d)return;d=Xt(d,t,e),S(),g();return}K({$:"submit_move",name:a.selfName,sessionId:P,actorName:t,requestId:re(),corridorId:e})}}function an(e){if(!a||!e)return;const t=St();if(t){if(R()){if(!d)return;d=Yt(d,t,e),S(),g();return}K({$:"select_kill_target",name:a.selfName,sessionId:P,actorName:t,requestId:re(),targetName:e})}}function St(){return a?.publicState?.currentTurnName?cn()?a.selfName:se()?a.publicState.currentTurnName:null:null}function cn(){return a?.publicState?.currentTurnName?a.publicState.currentTurnName===a.selfName:!1}function se(){if(!R()||!a?.publicState?.currentTurnName)return!1;const e=a;return e.players.find(n=>n.name===e.publicState?.currentTurnName)?.connected===!1}function K(e){if(!M){U("Sem conexao com o VibiNet.");return}M.post(Me(e))}function ln(){q!==null&&window.clearInterval(q),V!==null&&window.clearInterval(V),q=window.setInterval(()=>{oe()},tn),V=window.setInterval(()=>{a&&K({$:"heartbeat",name:a.selfName,sessionId:P})},en)}function un(){q!==null&&(window.clearInterval(q),q=null),V!==null&&(window.clearInterval(V),V=null),M?.close(),M=null,Y="closed"}function dn(){const e=window.sessionStorage.getItem(ee);return e||ie()}function ie(){const e=typeof crypto.randomUUID=="function"?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;return window.sessionStorage.setItem(ee,e),e}function re(){return`req-${Date.now()}-${Math.random().toString(36).slice(2,10)}`}function g(){if(!a){B.innerHTML=_n();return}B.innerHTML=`
    <main class="app-shell">
      ${Rn()}
      <section class="main-column">
        ${fn()}
        ${mn()}
        ${pn()}
      </section>
      <aside class="right-column">
        ${$n()}
        ${Sn()}
        ${Nn()}
      </aside>
      ${Tn()}
    </main>
  `,En()}function _n(){return`
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
            <input name="room" value="${m(u.roomInput)}" maxlength="36" />
          </label>
          <label class="field">
            <span>Nome</span>
            <input name="name" value="${m(u.nameInput)}" maxlength="24" />
          </label>
          <button class="btn btn-primary" type="submit">
            ${Y==="connecting"?"Conectando...":"Entrar"}
          </button>
        </form>
        <p class="helper">
          Servidor VibiNet: <code>${m(Nt())}</code>
        </p>
        ${u.toast?`<p class="toast">${m(u.toast)}</p>`:""}
      </section>
    </main>
  `}function fn(){if(!a)return"";const t=rt()?.role??"player";return`
    <header class="header-card">
      <div>
        <p class="eyebrow">Open Info / UI Oculta</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Room <code>${m(a.room)}</code> • voce é
          <strong>${m(at(t))}</strong>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" data-action="copy-link" type="button">Copiar link</button>
        ${a.canClaimMaster?'<button class="btn btn-primary" data-action="claim-master" type="button">Virar mestre</button>':""}
      </div>
    </header>
  `}function mn(){if(!a)return"";const e=a,t=e.publicState?.currentTurnName?e.players.find(n=>n.name===e.publicState?.currentTurnName):null;return`
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${m(ce(e.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">VEZ</p>
        <strong style="${t?`color:${t.color}`:""}">
          ${m(t?.name??"Aguardando")}
        </strong>
      </div>
      <label class="follow-toggle">
        <input data-action="follow-toggle" type="checkbox" ${u.followTurn?"checked":""} />
        acompanhar a vez automaticamente
      </label>
    </section>
  `}function pn(){return a?a.phase==="lobby"?`
      <section class="phase-grid">
        <div class="panel spacious">
          ${R()?bn():hn()}
        </div>
        <div class="panel">
          ${gn()}
        </div>
      </section>
    `:`
    <section class="phase-grid running">
      <div class="panel spacious">
        ${An()?yn():wn()}
      </div>
      <div class="panel">
        ${In()}
      </div>
    </section>
  `:""}function hn(){return`
    <div class="empty-panel">
      <h2>Aguardando mestre</h2>
      <p>
        Quando alguem assumir o papel de mestre, essa pessoa vai editar o labirinto e escolher
        quem sera a raposa.
      </p>
    </div>
  `}function gn(){if(!a)return"";const e=a.players.filter(t=>!t.isMaster&&t.seat==="participant").sort((t,n)=>t.joinedAt-n.joinedAt).map(t=>`<option value="${m(t.name)}">${m(t.name)}</option>`).join("");return`
    <section class="stack">
      <h2 class="section-title">Sala</h2>
      <p class="metric"><strong>Jogadores ativos:</strong> ${a.players.filter(t=>t.seat==="participant").length}</p>
      <p class="metric"><strong>Mestre:</strong> ${m(a.masterName??"ninguem")}</p>
      ${R()?`
            <label class="field">
              <span>Raposa</span>
              <select data-action="fox-select">
                <option value="">Escolher depois</option>
                ${e}
              </select>
            </label>
            <div class="button-row">
              <button class="btn btn-secondary" data-action="shuffle-fox" type="button">Sortear raposa</button>
              <button class="btn btn-primary" data-action="start-game" type="button">Play</button>
            </div>
          `:`
            <p class="helper">Voce continua esperando no lobby enquanto o mestre desenha o mapa.</p>
          `}
    </section>
  `}function bn(){if(!d||!a)return"";const e=u.selectedRoomId?d.rooms[u.selectedRoomId]:null;return`
    <section class="editor-shell">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Editor do mestre</h2>
          <p class="helper">Arraste salas, conecte pares e monte o labirinto antes do inicio.</p>
        </div>
        <div class="button-row tight">
          <button class="btn btn-secondary" data-action="editor-add-room" type="button">Nova sala</button>
          <button class="btn btn-secondary" data-action="editor-default" type="button">Mapa 3x3</button>
        </div>
      </div>
      <svg class="editor-map" data-editor-svg viewBox="0 0 ${G} ${X}">
        ${ae(d,!0)}
      </svg>
      <div class="editor-toolbar">
        <div class="metric-block">
          <strong>Sala selecionada</strong>
          <span>${m(e?.id??"nenhuma")}</span>
        </div>
        <div class="metric-block">
          <strong>Tipo</strong>
          <span>${m(e?.type??"-")}</span>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary" data-action="editor-connect" type="button" ${e?"":"disabled"}>
            ${u.connectSourceRoomId?"Clique em outra sala":"Conectar"}
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
  `}function yn(){if(!d)return'<div class="empty-panel"><h2>Sem mapa completo</h2></div>';const e=R();return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${R()?"Mapa mestre":"Visao completa"}</h2>
          <p class="helper">
            ${R()?"Voce enxerga tudo o tempo todo.":"Agora voce pode assistir a partida inteira."}
          </p>
        </div>
        ${e?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${G} ${X}">
        ${ae(d,!1)}
      </svg>
      ${vn()}
    </section>
  `}function vn(){return a?`
    <div class="legend-grid">
      ${a.players.map(e=>`
          <div class="legend-chip">
            <span class="legend-color" style="background:${e.color}"></span>
            <strong>${m(e.name)}</strong>
            <span>${m(at(e.role))}</span>
          </div>
        `).join("")}
    </div>
  `:""}function wn(){if(!a?.publicState)return'<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';const e=u.watchName??a.selfName,t=a.publicState.screens[e]??null,n=a.fullState?.players[a.selfName],o=!!(n&&!n.alive&&n.seat==="participant"&&!u.revealFullMap);if(!t)return`
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${o?'<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
      </div>
    `;const i=St()===e,r=i&&a.publicState.pendingKillTargets.length===0,l=i&&a.publicState.pendingKillTargets.length>0;return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${m(t.name)}</h2>
          <p class="helper">
            ${m(t.roomType?`Sala ${ct(t.roomType)}`:"Sem posicao visivel")}
          </p>
        </div>
        ${o?'<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
      </div>
      ${xn(t,r)}
      ${l?kn(a.publicState.pendingKillTargets):`
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${r?"":"disabled"}>Passar</button>
            </div>
          `}
    </section>
  `}function kn(e){return`
    <div class="kill-picker">
      <strong>Raposa escolhe quem cai:</strong>
      <div class="button-row">
        ${e.map(t=>`
            <button class="btn btn-danger" data-action="kill-target" data-target-name="${m(t)}" type="button">
              ${m(t)}
            </button>
          `).join("")}
      </div>
    </div>
  `}function xn(e,t){const n=On(e.exits);return`
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${m(e.roomType?ct(e.roomType):"Sem sala")}</div>
        ${n.map((o,s)=>`
            <button
              class="exit-btn"
              style="left:${o.left}%;top:${o.top}%;"
              data-action="submit-move"
              data-corridor-id="${m(o.corridorId)}"
              type="button"
              ${t?"":"disabled"}
            >
              <span class="exit-arrow" style="transform:rotate(${o.angle}deg)">➜</span>
              <small>${o.angle}°</small>
            </button>
          `).join("")}
        <div class="stickman-row">
          ${e.playersHere.map(o=>Mn(o.name,o.color)).join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${e.playersHere.length||0}</p>
        <p><strong>Saidas:</strong> ${e.exits.map(o=>`${o.angle}°`).join(", ")||"nenhuma"}</p>
      </div>
    </section>
  `}function In(){if(!a)return"";const e=u.watchName??a.selfName,t=a.publicState?.currentTurnName??"Aguardando",n=rt(),o=se();return`
    <section class="stack">
      <h2 class="section-title">Partida</h2>
      <p class="metric"><strong>Rodada:</strong> ${a.publicState?.round??0}</p>
      <p class="metric"><strong>Na tela:</strong> ${m(e)}</p>
      <p class="metric"><strong>Turno atual:</strong> ${m(t)}</p>
      <p class="metric"><strong>Status:</strong> ${m(ce(a.phase))}</p>
      ${o?`<p class="notice">Jogador atual caiu. O mestre pode agir por <strong>${m(t)}</strong>.</p>`:""}
      ${n&&n.role==="spectator"?'<p class="helper">Voce entrou depois do inicio e esta vendo a partida como espectador total.</p>':""}
      ${u.toast?`<p class="toast">${m(u.toast)}</p>`:""}
    </section>
  `}function $n(){if(!a)return"";const e=a;return`
    <section class="panel stack">
      <h2 class="section-title">Jogadores</h2>
      <ul class="roster">
        ${e.players.map(t=>`
              <li class="roster-item ${t.name===e.selfName?"is-self":""}">
                <span class="legend-color" style="background:${t.color}"></span>
                <div>
                  <strong>${m(t.name)}</strong>
                  <div class="helper">${m(at(t.role))} • ${t.connected?"online":"offline"}</div>
                </div>
                <span class="tag">${t.alive?"vivo":t.seat==="spectator"?"spec":"fora"}</span>
              </li>
            `).join("")}
      </ul>
    </section>
  `}function Sn(){return a?`
    <section class="panel stack">
      <h2 class="section-title">Visoes</h2>
      <p class="helper">A barra da esquerda mostra as telas limitadas de cada jogador ativo.</p>
      <div class="button-row">
        <button class="btn btn-secondary" data-action="toggle-rail" type="button">
          ${u.sideRailOpen?"Fechar telas":"Abrir telas"}
        </button>
        <button class="btn btn-secondary" data-action="self-screen" type="button">
          Voltar para minha tela
        </button>
      </div>
      <p class="helper">Pressione <code>Esc</code> para voltar imediatamente para a propria tela.</p>
    </section>
  `:""}function Nn(){return a?`
    <section class="panel stack">
      <h2 class="section-title">Conexao</h2>
      <p class="metric"><strong>Servidor:</strong> ${m(Nt())}</p>
      <p class="metric"><strong>Estado:</strong> ${m(Y)}</p>
      <p class="metric"><strong>Ping:</strong> ${Math.round(M?.ping?.()??0)} ms</p>
      ${a.message?`<p class="notice">${m(a.message)}</p>`:""}
    </section>
  `:""}function Rn(){if(!a?.publicState)return`<aside class="side-rail ${u.sideRailOpen?"":"collapsed"}"></aside>`;const e=a,t=e.publicState,n=[e.selfName,...t.watchOrder.filter(o=>o!==e.selfName)];return`
    <aside class="side-rail ${u.sideRailOpen?"":"collapsed"}">
      <div class="side-rail-header">
        <strong>Telas</strong>
        <button class="ghost-btn" data-action="toggle-rail" type="button">${u.sideRailOpen?"←":"→"}</button>
      </div>
      ${n.map(o=>{const s=t.screens[o],i=e.players.find(r=>r.name===o);return`
            <button
              class="screen-card ${u.watchName===o?"active":""}"
              data-action="watch-screen"
              data-name="${m(o)}"
              type="button"
            >
              <div class="screen-card-header">
                <span class="legend-color" style="background:${i?.color??"#000"}"></span>
                <strong>${m(o)}</strong>
              </div>
              <div class="screen-card-body">
                <span>${m(at(i?.role??"player"))}</span>
                <span>${m(s?.roomType?ct(s.roomType):"sem sala")}</span>
                <span>${m(s?`${s.exits.length} saidas`:"-")}</span>
              </div>
            </button>
          `}).join("")}
    </aside>
  `}function Tn(){return""}function ae(e,t){const n=new Map;for(const o of Object.values(e.players))o.locationRoomId&&(n.has(o.locationRoomId)||n.set(o.locationRoomId,[]),n.get(o.locationRoomId)?.push({name:o.name,color:o.color,role:o.role}));return`
    ${Object.values(e.corridors).map(o=>{const s=e.rooms[o.fromRoomId],i=e.rooms[o.toRoomId];return!s||!i?"":s.id===i.id?`
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
    ${Object.values(e.rooms).map(o=>{const s=u.selectedRoomId===o.id,i=u.connectSourceRoomId===o.id,r=n.get(o.id)??[];return`
          <g
            data-room-node="${m(o.id)}"
            class="room-node ${s?"selected":""} ${i?"armed":""}"
            transform="translate(${o.x}, ${o.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${o.type}" />
            <text class="room-title" text-anchor="middle" y="4">${m(o.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${m(ct(o.type))}</text>
            ${r.map((l,c)=>`
                <circle cx="${-18+c*18}" cy="-12" r="6" fill="${l.color}" />
              `).join("")}
          </g>
        `}).join("")}
    ${t?`<rect class="drag-layer" x="0" y="0" width="${G}" height="${X}" fill="transparent" />`:""}
  `}function Mn(e,t){return`
    <div class="stickman">
      <svg viewBox="0 0 64 84" class="stickman-svg" aria-hidden="true">
        <circle cx="32" cy="14" r="10" fill="${t}" />
        <line x1="32" y1="24" x2="32" y2="52" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="16" y1="36" x2="48" y2="36" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="18" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="46" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
      </svg>
      <span>${m(e)}</span>
    </div>
  `}function En(){const e=B.querySelector("[data-editor-svg]");if(!e||!R()||a?.phase!=="lobby"||!d)return;const t=n=>{const o=e.getBoundingClientRect(),s=(n.clientX-o.left)/o.width*G,i=(n.clientY-o.top)/o.height*X;return{x:Math.max(60,Math.min(G-60,s)),y:Math.max(60,Math.min(X-60,i))}};e.onpointerdown=n=>{const o=n.target;if(!(o instanceof SVGElement))return;const i=o.closest("[data-room-node]")?.dataset.roomNode;if(i){if(u.connectSourceRoomId&&u.connectSourceRoomId!==i&&d){d=Be(d,u.connectSourceRoomId,i),u.connectSourceRoomId=null,S(),g();return}if(u.connectSourceRoomId===i){u.connectSourceRoomId=null,g();return}u.selectedRoomId=i,u.dragRoomId=i,g(),e.setPointerCapture(n.pointerId)}},e.onpointermove=n=>{if(!u.dragRoomId||u.connectSourceRoomId||!d)return;const o=t(n);d=Ke(d,u.dragRoomId,o.x,o.y),g()},e.onpointerup=()=>{u.dragRoomId&&(u.dragRoomId=null,S(),g())}}function An(){if(!a)return!1;if(R())return!0;const e=a.fullState?.players[a.selfName];return rt()?.seat==="spectator"&&a.phase!=="lobby"?!0:!!(e&&!e.alive&&u.revealFullMap)}function rt(){return a?.players.find(e=>e.name===a?.selfName)??null}function R(){return!!(a&&a.masterName===a.selfName)}function at(e){switch(e){case"master":return"mestre";case"fox":return"raposa";case"hen":return"galinha";case"spectator":return"espectador";default:return"jogador"}}function ce(e){switch(e){case"lobby":return"lobby";case"running":return"partida em andamento";case"paused_master_disconnect":return"pausado";case"game_over":return"fim da partida";default:return e}}function ct(e){return e==="shop"?"loja":"normal"}function On(e){const t=[...e].sort((s,i)=>s.angle-i.angle);let n=-999,o=0;return t.map(s=>{Math.abs(s.angle-n)<18?o+=1:o=0,n=s.angle;const i=s.angle*Math.PI/180,r=40+o*8,l=28+o*6,c=50+Math.cos(i)*r,_=50+Math.sin(i)*l;return{corridorId:s.corridorId,angle:s.angle,left:c,top:_}})}function Nt(){const e=pt.get("server")??void 0;return e||xt}async function jn(){if(!a)return;const e=new URL(window.location.href);e.searchParams.set("room",a.room);const t=e.toString();try{await navigator.clipboard.writeText(t),U("Link da room copiado.")}catch{U(t)}}function U(e){u.toast=e,g(),window.clearTimeout(U.timer),U.timer=window.setTimeout(()=>{u.toast="",g()},2600)}function m(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
