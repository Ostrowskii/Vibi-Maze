(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();var ve=Object.defineProperty,Ie=(e,t,n)=>t in e?ve(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,y=(e,t,n)=>Ie(e,typeof t!="symbol"?t+"":t,n),pt=53,ke=new TextDecoder,Ot=new WeakMap,jt=new WeakMap,Se=class{constructor(e){y(this,"buf"),y(this,"bit_pos"),this.buf=e,this.bit_pos=0}write_bit(e){const t=this.bit_pos>>>3,n=this.bit_pos&7;e&&(this.buf[t]|=1<<n),this.bit_pos++}write_bitsUnsigned(e,t){if(t!==0){if(typeof e=="number"){if(t<=32){if((this.bit_pos&7)===0&&(t&7)===0){let r=e>>>0,i=this.bit_pos>>>3;for(let a=0;a<t;a+=8)this.buf[i++]=r&255,r>>>=8;this.bit_pos+=t;return}let o=e>>>0;for(let r=0;r<t;r++)this.write_bit(o&1),o>>>=1;return}this.write_bitsBigint(BigInt(e),t);return}this.write_bitsBigint(e,t)}}write_bitsBigint(e,t){if(t===0)return;if((this.bit_pos&7)===0&&(t&7)===0){let r=e,i=this.bit_pos>>>3;for(let a=0;a<t;a+=8)this.buf[i++]=Number(r&0xffn),r>>=8n;this.bit_pos+=t;return}let o=e;for(let r=0;r<t;r++)this.write_bit((o&1n)===0n?0:1),o>>=1n}},xe=class{constructor(e){y(this,"buf"),y(this,"bit_pos"),this.buf=e,this.bit_pos=0}read_bit(){const e=this.bit_pos>>>3,t=this.bit_pos&7,n=this.buf[e]>>>t&1;return this.bit_pos++,n}read_bitsUnsigned(e){if(e===0)return 0;if(e<=32){if((this.bit_pos&7)===0&&(e&7)===0){let o=0,r=0,i=this.bit_pos>>>3;for(let a=0;a<e;a+=8)o|=this.buf[i++]<<r,r+=8;return this.bit_pos+=e,o>>>0}let n=0;for(let o=0;o<e;o++)this.read_bit()&&(n|=1<<o);return n>>>0}if(e<=pt){let t=0,n=1;for(let o=0;o<e;o++)this.read_bit()&&(t+=n),n*=2;return t}return this.read_bitsBigint(e)}read_bitsBigint(e){if(e===0)return 0n;if((this.bit_pos&7)===0&&(e&7)===0){let r=0n,i=0n,a=this.bit_pos>>>3;for(let c=0;c<e;c+=8)r|=BigInt(this.buf[a++])<<i,i+=8n;return this.bit_pos+=e,r}let n=0n,o=1n;for(let r=0;r<e;r++)this.read_bit()&&(n+=o),o<<=1n;return n}};function Y(e,t){if(!Number.isInteger(e))throw new TypeError(`${t} must be an integer`)}function K(e){if(Y(e,"size"),e<0)throw new RangeError("size must be >= 0")}function Vt(e,t){if(t!==e)throw new RangeError(`vector size mismatch: expected ${e}, got ${t}`)}function C(e,t){switch(e.$){case"UInt":case"Int":return K(e.size),e.size;case"Nat":{if(typeof t=="bigint"){if(t<0n)throw new RangeError("Nat must be >= 0");if(t>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Nat too large to size");return Number(t)+1}if(Y(t,"Nat"),t<0)throw new RangeError("Nat must be >= 0");return t+1}case"Tuple":{const n=e.fields,o=it(t,"Tuple");let r=0;for(let i=0;i<n.length;i++)r+=C(n[i],o[i]);return r}case"Vector":{K(e.size);const n=it(t,"Vector");Vt(e.size,n.length);let o=0;for(let r=0;r<e.size;r++)o+=C(e.type,n[r]);return o}case"Struct":{let n=0;const o=wt(e.fields);for(let r=0;r<o.length;r++){const i=o[r],a=Dt(t,i);n+=C(e.fields[i],a)}return n}case"List":{let n=1;return Wt(t,o=>{n+=1,n+=C(e.type,o)}),n}case"Map":{let n=1;return qt(t,(o,r)=>{n+=1,n+=C(e.key,o),n+=C(e.value,r)}),n}case"Union":{const n=xt(e),o=Kt(t),r=e.variants[o];if(!r)throw new RangeError(`Unknown union variant: ${o}`);const i=Ht(t,r);return n.tag_bits+C(r,i)}case"String":return 1+we(t)*9}}function B(e,t,n){switch(t.$){case"UInt":{if(K(t.size),t.size===0){if(n===0||n===0n)return;throw new RangeError("UInt out of range")}if(typeof n=="bigint"){if(n<0n)throw new RangeError("UInt must be >= 0");const r=1n<<BigInt(t.size);if(n>=r)throw new RangeError("UInt out of range");e.write_bitsUnsigned(n,t.size);return}if(Y(n,"UInt"),n<0)throw new RangeError("UInt must be >= 0");if(t.size>pt)throw new RangeError("UInt too large for number; use bigint");const o=2**t.size;if(n>=o)throw new RangeError("UInt out of range");e.write_bitsUnsigned(n,t.size);return}case"Int":{if(K(t.size),t.size===0){if(n===0||n===0n)return;throw new RangeError("Int out of range")}if(typeof n=="bigint"){const a=BigInt(t.size),c=-(1n<<a-1n),u=(1n<<a-1n)-1n;if(n<c||n>u)throw new RangeError("Int out of range");let f=n;n<0n&&(f=(1n<<a)+n),e.write_bitsUnsigned(f,t.size);return}if(Y(n,"Int"),t.size>pt)throw new RangeError("Int too large for number; use bigint");const o=-(2**(t.size-1)),r=2**(t.size-1)-1;if(n<o||n>r)throw new RangeError("Int out of range");let i=n;n<0&&(i=2**t.size+n),e.write_bitsUnsigned(i,t.size);return}case"Nat":{if(typeof n=="bigint"){if(n<0n)throw new RangeError("Nat must be >= 0");let o=n;for(;o>0n;)e.write_bit(1),o-=1n;e.write_bit(0);return}if(Y(n,"Nat"),n<0)throw new RangeError("Nat must be >= 0");for(let o=0;o<n;o++)e.write_bit(1);e.write_bit(0);return}case"Tuple":{const o=t.fields,r=it(n,"Tuple");for(let i=0;i<o.length;i++)B(e,o[i],r[i]);return}case"Vector":{K(t.size);const o=it(n,"Vector");Vt(t.size,o.length);for(let r=0;r<t.size;r++)B(e,t.type,o[r]);return}case"Struct":{const o=wt(t.fields);for(let r=0;r<o.length;r++){const i=o[r];B(e,t.fields[i],Dt(n,i))}return}case"List":{Wt(n,o=>{e.write_bit(1),B(e,t.type,o)}),e.write_bit(0);return}case"Map":{qt(n,(o,r)=>{e.write_bit(1),B(e,t.key,o),B(e,t.value,r)}),e.write_bit(0);return}case"Union":{const o=xt(t),r=Kt(n),i=o.index_by_tag.get(r);if(i===void 0)throw new RangeError(`Unknown union variant: ${r}`);o.tag_bits>0&&e.write_bitsUnsigned(i,o.tag_bits);const a=t.variants[r],c=Ht(n,a);B(e,a,c);return}case"String":{$e(e,n);return}}}function P(e,t){switch(t.$){case"UInt":return K(t.size),e.read_bitsUnsigned(t.size);case"Int":{if(K(t.size),t.size===0)return 0;const n=e.read_bitsUnsigned(t.size);if(typeof n=="bigint"){const r=1n<<BigInt(t.size-1);return n&r?n-(1n<<BigInt(t.size)):n}const o=2**(t.size-1);return n>=o?n-2**t.size:n}case"Nat":{let n=0,o=null;for(;e.read_bit();)o!==null?o+=1n:n===Number.MAX_SAFE_INTEGER?o=BigInt(n)+1n:n++;return o??n}case"Tuple":{const n=new Array(t.fields.length);for(let o=0;o<t.fields.length;o++)n[o]=P(e,t.fields[o]);return n}case"Vector":{const n=new Array(t.size);for(let o=0;o<t.size;o++)n[o]=P(e,t.type);return n}case"Struct":{const n={},o=wt(t.fields);for(let r=0;r<o.length;r++){const i=o[r];n[i]=P(e,t.fields[i])}return n}case"List":{const n=[];for(;e.read_bit();)n.push(P(e,t.type));return n}case"Map":{const n=new Map;for(;e.read_bit();){const o=P(e,t.key),r=P(e,t.value);n.set(o,r)}return n}case"Union":{const n=xt(t);let o=0;n.tag_bits>0&&(o=e.read_bitsUnsigned(n.tag_bits));let r;if(typeof o=="bigint"){if(o>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Union tag index too large");r=Number(o)}else r=o;if(r<0||r>=n.keys.length)throw new RangeError("Union tag index out of range");const i=n.keys[r],a=t.variants[i],c=P(e,a);return a.$==="Struct"&&c&&typeof c=="object"?(c.$=i,c):{$:i,value:c}}case"String":return Ne(e)}}function it(e,t){if(!Array.isArray(e))throw new TypeError(`${t} value must be an Array`);return e}function Dt(e,t){if(e&&typeof e=="object")return e[t];throw new TypeError("Struct value must be an object")}function xt(e){const t=Ot.get(e);if(t)return t;const n=Object.keys(e.variants).sort();if(n.length===0)throw new RangeError("Union must have at least one variant");const o=new Map;for(let a=0;a<n.length;a++)o.set(n[a],a);const r=n.length<=1?0:Math.ceil(Math.log2(n.length)),i={keys:n,index_by_tag:o,tag_bits:r};return Ot.set(e,i),i}function wt(e){const t=jt.get(e);if(t)return t;const n=Object.keys(e);return jt.set(e,n),n}function Kt(e){if(!e||typeof e!="object")throw new TypeError("Union value must be an object with a $ tag");const t=e.$;if(typeof t!="string")throw new TypeError("Union value must have a string $ tag");return t}function Ht(e,t){return t.$!=="Struct"&&e&&typeof e=="object"&&Object.prototype.hasOwnProperty.call(e,"value")?e.value:e}function Wt(e,t){if(!Array.isArray(e))throw new TypeError("List value must be an Array");for(let n=0;n<e.length;n++)t(e[n])}function qt(e,t){if(e!=null){if(e instanceof Map){for(const[n,o]of e)t(n,o);return}if(typeof e=="object"){for(const n of Object.keys(e))t(n,e[n]);return}throw new TypeError("Map value must be a Map or object")}}function we(e){if(typeof e!="string")throw new TypeError("String value must be a string");let t=0;for(let n=0;n<e.length;n++){const o=e.charCodeAt(n);if(o<128)t+=1;else if(o<2048)t+=2;else if(o>=55296&&o<=56319){const r=n+1<e.length?e.charCodeAt(n+1):0;r>=56320&&r<=57343?(n++,t+=4):t+=3}else o>=56320&&o<=57343,t+=3}return t}function $e(e,t){if(typeof t!="string")throw new TypeError("String value must be a string");for(let n=0;n<t.length;n++){let o=t.charCodeAt(n);if(o<128){e.write_bit(1),e.write_bitsUnsigned(o,8);continue}if(o<2048){e.write_bit(1),e.write_bitsUnsigned(192|o>>>6,8),e.write_bit(1),e.write_bitsUnsigned(128|o&63,8);continue}if(o>=55296&&o<=56319){const r=n+1<t.length?t.charCodeAt(n+1):0;if(r>=56320&&r<=57343){n++;const i=(o-55296<<10)+(r-56320)+65536;e.write_bit(1),e.write_bitsUnsigned(240|i>>>18,8),e.write_bit(1),e.write_bitsUnsigned(128|i>>>12&63,8),e.write_bit(1),e.write_bitsUnsigned(128|i>>>6&63,8),e.write_bit(1),e.write_bitsUnsigned(128|i&63,8);continue}o=65533}else o>=56320&&o<=57343&&(o=65533);e.write_bit(1),e.write_bitsUnsigned(224|o>>>12,8),e.write_bit(1),e.write_bitsUnsigned(128|o>>>6&63,8),e.write_bit(1),e.write_bitsUnsigned(128|o&63,8)}e.write_bit(0)}function Ne(e){let t=new Uint8Array(16),n=0;for(;e.read_bit();){const o=e.read_bitsUnsigned(8);if(n===t.length){const r=new Uint8Array(t.length*2);r.set(t),t=r}t[n++]=o}return ke.decode(t.subarray(0,n))}function Jt(e,t){const n=C(e,t),o=new Uint8Array(n+7>>>3),r=new Se(o);return B(r,e,t),o}function Gt(e,t){const n=new xe(t);return P(n,e)}var X=53,Ut={$:"List",type:{$:"UInt",size:8}},Xt={$:"Union",variants:{get_time:{$:"Struct",fields:{}},info_time:{$:"Struct",fields:{time:{$:"UInt",size:X}}},post:{$:"Struct",fields:{room:{$:"String"},time:{$:"UInt",size:X},name:{$:"String"},payload:Ut}},info_post:{$:"Struct",fields:{room:{$:"String"},index:{$:"UInt",size:32},server_time:{$:"UInt",size:X},client_time:{$:"UInt",size:X},name:{$:"String"},payload:Ut}},load:{$:"Struct",fields:{room:{$:"String"},from:{$:"UInt",size:32}}},watch:{$:"Struct",fields:{room:{$:"String"}}},unwatch:{$:"Struct",fields:{room:{$:"String"}}},get_latest_post_index:{$:"Struct",fields:{room:{$:"String"}}},info_latest_post_index:{$:"Struct",fields:{room:{$:"String"},latest_index:{$:"Int",size:32},server_time:{$:"UInt",size:X}}}}};function Lt(e){const t=new Array(e.length);for(let n=0;n<e.length;n++)t[n]=e[n];return t}function Ft(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e[n]&255;return t}function Re(e){switch(e.$){case"post":return{$:"post",room:e.room,time:e.time,name:e.name,payload:Lt(e.payload)};case"info_post":return{$:"info_post",room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,payload:Lt(e.payload)};default:return e}}function Te(e){switch(e.$){case"post":return{$:"post",room:e.room,time:e.time,name:e.name,payload:Ft(e.payload)};case"info_post":return{$:"info_post",room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,payload:Ft(e.payload)};default:return e}}function V(e){return Jt(Xt,Re(e))}function Me(e){const t=Gt(Xt,e);return Te(t)}var $t="wss://net.studiovibi.com";function Ee(e){let t=e;try{const n=new URL(e);n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),t=n.toString()}catch{t=e}if(typeof window<"u"&&window.location.protocol==="https:"&&t.startsWith("ws://")){const n=`wss://${t.slice(5)}`;return console.warn(`[VibiNet] Upgrading insecure WebSocket URL "${t}" to "${n}" because the page is HTTPS.`),n}return t}function _t(){return Math.floor(Date.now())}function Ae(){return $t}function Yt(){const e="_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",t=new Uint8Array(8);if(typeof crypto<"u"&&typeof crypto.getRandomValues=="function")crypto.getRandomValues(t);else for(let r=0;r<8;r++)t[r]=Math.floor(Math.random()*256);let o="";for(let r=0;r<8;r++)o+=e[t[r]%64];return o}function ze(e){const t={clock_offset:1/0,lowest_ping:1/0,request_sent_at:0,last_ping:1/0},n=new Map,o=new Set,r=[];let i=!1;const a=[];let c=null,u=null,f=0,v=!1,_=null;const d=[],T=Ee(e??Ae());function S(){if(!isFinite(t.clock_offset))throw new Error("server_time() called before initial sync");return Math.floor(_t()+t.clock_offset)}function h(){c!==null&&(clearInterval(c),c=null)}function g(){u!==null&&(clearTimeout(u),u=null)}function O(){const E=Math.min(8e3,500*Math.pow(2,f)),I=Math.floor(Math.random()*250);return E+I}function L(){if(!(!_||_.readyState!==WebSocket.OPEN))for(;d.length>0;){if(!_||_.readyState!==WebSocket.OPEN)return;const m=d[0];try{_.send(m),d.shift()}catch{G();return}}}function tt(){!_||_.readyState!==WebSocket.OPEN||(t.request_sent_at=_t(),_.send(V({$:"get_time"})))}function et(m){if(!_||_.readyState!==WebSocket.OPEN)return!1;try{return _.send(m),!0}catch{return!1}}function ft(m){et(m)||G()}function ge(m){d.push(m),G()}function zt(m,w,E){const I=n.get(m);if(I){if(I.packer!==w)throw new Error(`Packed schema already registered for room: ${m}`);E&&(I.handler=E);return}n.set(m,{handler:E,packer:w})}function ye(){if(v||u!==null)return;const m=O();u=setTimeout(()=>{u=null,f+=1,G()},m)}function G(){if(v||_&&(_.readyState===WebSocket.OPEN||_.readyState===WebSocket.CONNECTING))return;g();const m=new WebSocket(T);_=m,m.binaryType="arraybuffer",m.addEventListener("open",()=>{if(_===m){f=0,console.log("[WS] Connected"),tt(),h();for(const w of o.values())m.send(V({$:"watch",room:w}));L(),c=setInterval(tt,2e3)}}),m.addEventListener("message",w=>{const E=w.data instanceof ArrayBuffer?new Uint8Array(w.data):new Uint8Array(w.data),I=Me(E);switch(I.$){case"info_time":{const j=_t(),F=j-t.request_sent_at;if(t.last_ping=F,F<t.lowest_ping){const mt=Math.floor((t.request_sent_at+j)/2);t.clock_offset=I.time-mt,t.lowest_ping=F}if(!i){i=!0;for(const mt of a)mt();a.length=0}break}case"info_post":{const j=n.get(I.room);if(j&&j.handler){const F=Gt(j.packer,I.payload);j.handler({$:"info_post",room:I.room,index:I.index,server_time:I.server_time,client_time:I.client_time,name:I.name,data:F})}break}case"info_latest_post_index":{for(const j of r)j({room:I.room,latest_index:I.latest_index,server_time:I.server_time});break}}}),m.addEventListener("close",w=>{_===m&&(h(),_=null,!v&&(console.warn(`[WS] Disconnected (code=${w.code}); reconnecting...`),ye()))}),m.addEventListener("error",()=>{})}return G(),{on_sync:m=>{if(i){m();return}a.push(m)},watch:(m,w,E)=>{zt(m,w,E),o.add(m),ft(V({$:"watch",room:m}))},load:(m,w,E,I)=>{zt(m,E,I),ft(V({$:"load",room:m,from:w}))},get_latest_post_index:m=>{ft(V({$:"get_latest_post_index",room:m}))},on_latest_post_index:m=>{r.push(m)},post:(m,w,E)=>{const I=Yt(),j=Jt(E,w),F=V({$:"post",room:m,time:S(),name:I,payload:j});return d.length>0&&L(),et(F)||ge(F),I},server_time:S,ping:()=>t.last_ping,close:()=>{if(v=!0,g(),h(),_&&_.readyState===WebSocket.OPEN)for(const m of o.values())try{_.send(V({$:"unwatch",room:m}))}catch{break}_&&_.close(),_=null},debug_dump:()=>({ws_url:T,ws_ready_state:_?_.readyState:WebSocket.CLOSED,is_synced:i,reconnect_attempt:f,reconnect_scheduled:u!==null,pending_post_count:d.length,watched_rooms:Array.from(o.values()),room_watchers:Array.from(n.keys()),room_watcher_count:n.size,latest_post_index_listener_count:r.length,sync_listener_count:a.length,time_sync:{clock_offset:t.clock_offset,lowest_ping:t.lowest_ping,request_sent_at:t.request_sent_at,last_ping:t.last_ping}})}}var bt=class{constructor(t){y(this,"room"),y(this,"init"),y(this,"on_tick"),y(this,"on_post"),y(this,"packer"),y(this,"smooth"),y(this,"tick_rate"),y(this,"tolerance"),y(this,"client_api"),y(this,"remote_posts"),y(this,"local_posts"),y(this,"timeline"),y(this,"cache_enabled"),y(this,"snapshot_stride"),y(this,"snapshot_count"),y(this,"snapshots"),y(this,"snapshot_start_tick"),y(this,"initial_time_value"),y(this,"initial_tick_value"),y(this,"no_pending_posts_before_ms"),y(this,"max_contiguous_remote_index"),y(this,"cache_drop_guard_hits"),y(this,"latest_index_poll_interval_id"),y(this,"max_remote_index");const n=(u,f)=>u,o=t.smooth??n,r=t.cache??!0,i=t.snapshot_stride??8,a=t.snapshot_count??256,c=t.client??ze(t.server);this.room=t.room,this.init=t.initial,this.on_tick=t.on_tick,this.on_post=t.on_post,this.packer=t.packer,this.smooth=o,this.tick_rate=t.tick_rate,this.tolerance=t.tolerance,this.client_api=c,this.remote_posts=new Map,this.local_posts=new Map,this.timeline=new Map,this.cache_enabled=r,this.snapshot_stride=Math.max(1,Math.floor(i)),this.snapshot_count=Math.max(1,Math.floor(a)),this.snapshots=new Map,this.snapshot_start_tick=null,this.initial_time_value=null,this.initial_tick_value=null,this.no_pending_posts_before_ms=null,this.max_contiguous_remote_index=-1,this.cache_drop_guard_hits=0,this.latest_index_poll_interval_id=null,this.max_remote_index=-1,this.client_api.on_latest_post_index&&this.client_api.on_latest_post_index(u=>{this.on_latest_post_index_info(u)}),this.client_api.on_sync(()=>{console.log(`[VIBI] synced; loading+watching room=${this.room}`);const u=f=>{f.name&&this.remove_local_post(f.name),this.add_remote_post(f)};this.client_api.load(this.room,0,this.packer,u),this.client_api.watch(this.room,this.packer,u),this.request_latest_post_index(),this.latest_index_poll_interval_id!==null&&clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=setInterval(()=>{this.request_latest_post_index()},2e3)})}official_time(t){return t.client_time<=t.server_time-this.tolerance?t.server_time-this.tolerance:t.client_time}official_tick(t){return this.time_to_tick(this.official_time(t))}get_bucket(t){let n=this.timeline.get(t);return n||(n={remote:[],local:[]},this.timeline.set(t,n)),n}insert_remote_post(t,n){const o=this.get_bucket(n);o.remote.push(t),o.remote.sort((r,i)=>r.index-i.index)}invalidate_from_tick(t){if(!this.cache_enabled)return;const n=this.snapshot_start_tick;if(n!==null&&t<n||n===null||this.snapshots.size===0)return;const o=this.snapshot_stride,r=n+(this.snapshots.size-1)*o;if(!(t>r)){if(t<=n){this.snapshots.clear();return}for(let i=r;i>=t;i-=o)this.snapshots.delete(i)}}advance_state(t,n,o){let r=t;for(let i=n+1;i<=o;i++)r=this.apply_tick(r,i);return r}prune_before_tick(t){if(!this.cache_enabled)return;const n=this.safe_prune_tick();n!==null&&t>n&&(this.cache_drop_guard_hits+=1,t=n);for(const o of this.timeline.keys())o<t&&this.timeline.delete(o);for(const[o,r]of this.remote_posts.entries())this.official_tick(r)<t&&this.remote_posts.delete(o);for(const[o,r]of this.local_posts.entries())this.official_tick(r)<t&&this.local_posts.delete(o)}tick_ms(){return 1e3/this.tick_rate}cache_window_ticks(){return this.snapshot_stride*Math.max(0,this.snapshot_count-1)}safe_prune_tick(){return this.no_pending_posts_before_ms===null?null:this.time_to_tick(this.no_pending_posts_before_ms)}safe_compute_tick(t){if(!this.cache_enabled)return t;const n=this.safe_prune_tick();if(n===null)return t;const o=n+this.cache_window_ticks();return Math.min(t,o)}advance_no_pending_posts_before_ms(t){const n=Math.max(0,Math.floor(t));(this.no_pending_posts_before_ms===null||n>this.no_pending_posts_before_ms)&&(this.no_pending_posts_before_ms=n)}advance_contiguous_remote_frontier(){for(;;){const t=this.max_contiguous_remote_index+1,n=this.remote_posts.get(t);if(!n)break;this.max_contiguous_remote_index=t,this.advance_no_pending_posts_before_ms(this.official_time(n))}}on_latest_post_index_info(t){if(t.room!==this.room||t.latest_index>this.max_contiguous_remote_index)return;const n=this.tick_ms(),o=t.server_time-this.tolerance-n;this.advance_no_pending_posts_before_ms(o)}request_latest_post_index(){if(this.client_api.get_latest_post_index)try{this.client_api.get_latest_post_index(this.room)}catch{}}ensure_snapshots(t,n){if(!this.cache_enabled)return;this.snapshot_start_tick===null&&(this.snapshot_start_tick=n);let o=this.snapshot_start_tick;if(o===null||t<o)return;const r=this.snapshot_stride,i=o+Math.floor((t-o)/r)*r;let a,c;if(this.snapshots.size===0)a=this.init,c=o-1;else{const v=o+(this.snapshots.size-1)*r;a=this.snapshots.get(v),c=v}let u=c+r;for(this.snapshots.size===0&&(u=o);u<=i;u+=r)a=this.advance_state(a,c,u),this.snapshots.set(u,a),c=u;const f=this.snapshots.size;if(f>this.snapshot_count){const v=f-this.snapshot_count,_=o+v*r;for(let d=o;d<_;d+=r)this.snapshots.delete(d);o=_,this.snapshot_start_tick=o}this.prune_before_tick(o)}add_remote_post(t){const n=this.official_tick(t);if(t.index===0&&this.initial_time_value===null){const r=this.official_time(t);this.initial_time_value=r,this.initial_tick_value=this.time_to_tick(r)}if(this.remote_posts.has(t.index))return;this.cache_enabled&&this.snapshot_start_tick!==null&&n<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.remote_posts.set(t.index,t),t.index>this.max_remote_index&&(this.max_remote_index=t.index),this.advance_contiguous_remote_frontier(),this.insert_remote_post(t,n),this.invalidate_from_tick(n)}add_local_post(t,n){this.local_posts.has(t)&&this.remove_local_post(t);const o=this.official_tick(n);this.cache_enabled&&this.snapshot_start_tick!==null&&o<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.local_posts.set(t,n),this.get_bucket(o).local.push(n),this.invalidate_from_tick(o)}remove_local_post(t){const n=this.local_posts.get(t);if(!n)return;this.local_posts.delete(t);const o=this.official_tick(n),r=this.timeline.get(o);if(r){const i=r.local.indexOf(n);if(i!==-1)r.local.splice(i,1);else{const a=r.local.findIndex(c=>c.name===t);a!==-1&&r.local.splice(a,1)}r.remote.length===0&&r.local.length===0&&this.timeline.delete(o)}this.invalidate_from_tick(o)}apply_tick(t,n){let o=this.on_tick(t);const r=this.timeline.get(n);if(r){for(const i of r.remote)o=this.on_post(i.data,o);for(const i of r.local)o=this.on_post(i.data,o)}return o}compute_state_at_uncached(t,n){let o=this.init;for(let r=t;r<=n;r++)o=this.apply_tick(o,r);return o}post_to_debug_dump(t){return{room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,official_time:this.official_time(t),official_tick:this.official_tick(t),data:t.data}}timeline_tick_bounds(){let t=null,n=null;for(const o of this.timeline.keys())(t===null||o<t)&&(t=o),(n===null||o>n)&&(n=o);return{min:t,max:n}}snapshot_tick_bounds(){let t=null,n=null;for(const o of this.snapshots.keys())(t===null||o<t)&&(t=o),(n===null||o>n)&&(n=o);return{min:t,max:n}}time_to_tick(t){return Math.floor(t*this.tick_rate/1e3)}server_time(){return this.client_api.server_time()}server_tick(){return this.time_to_tick(this.server_time())}post_count(){return this.max_remote_index+1}compute_render_state(){const t=this.server_tick(),n=1e3/this.tick_rate,o=Math.ceil(this.tolerance/n),r=this.client_api.ping(),i=isFinite(r)?Math.ceil(r/2/n):0,a=Math.max(o,i+1),c=Math.max(0,t-a),u=this.compute_state_at(c),f=this.compute_state_at(t);return this.smooth(u,f)}initial_time(){if(this.initial_time_value!==null)return this.initial_time_value;const t=this.remote_posts.get(0);if(!t)return null;const n=this.official_time(t);return this.initial_time_value=n,this.initial_tick_value=this.time_to_tick(n),n}initial_tick(){if(this.initial_tick_value!==null)return this.initial_tick_value;const t=this.initial_time();return t===null?null:(this.initial_tick_value=this.time_to_tick(t),this.initial_tick_value)}compute_state_at(t){t=this.safe_compute_tick(t);const n=this.initial_tick();if(n===null)return this.init;if(t<n)return this.init;if(!this.cache_enabled)return this.compute_state_at_uncached(n,t);this.ensure_snapshots(t,n);const o=this.snapshot_start_tick;if(o===null||this.snapshots.size===0)return this.init;if(t<o)return this.snapshots.get(o)??this.init;const r=this.snapshot_stride,i=o+(this.snapshots.size-1)*r,a=Math.floor((i-o)/r),c=Math.floor((t-o)/r),u=Math.min(c,a),f=o+u*r,v=this.snapshots.get(f)??this.init;return this.advance_state(v,f,t)}debug_dump(){const t=Array.from(this.remote_posts.values()).sort((h,g)=>h.index-g.index).map(h=>this.post_to_debug_dump(h)),n=Array.from(this.local_posts.values()).sort((h,g)=>{const O=this.official_tick(h),L=this.official_tick(g);if(O!==L)return O-L;const tt=h.name??"",et=g.name??"";return tt.localeCompare(et)}).map(h=>this.post_to_debug_dump(h)),o=Array.from(this.timeline.entries()).sort((h,g)=>h[0]-g[0]).map(([h,g])=>({tick:h,remote_count:g.remote.length,local_count:g.local.length,remote_posts:g.remote.map(O=>this.post_to_debug_dump(O)),local_posts:g.local.map(O=>this.post_to_debug_dump(O))})),r=Array.from(this.snapshots.entries()).sort((h,g)=>h[0]-g[0]).map(([h,g])=>({tick:h,state:g})),i=this.initial_time(),a=this.initial_tick(),c=this.timeline_tick_bounds(),u=this.snapshot_tick_bounds(),f=a!==null&&c.min!==null&&c.min>a;let v=null,_=null;try{v=this.server_time(),_=this.server_tick()}catch{v=null,_=null}let d=null,T=null;for(const h of this.remote_posts.keys())(d===null||h<d)&&(d=h),(T===null||h>T)&&(T=h);const S=typeof this.client_api.debug_dump=="function"?this.client_api.debug_dump():null;return{room:this.room,tick_rate:this.tick_rate,tolerance:this.tolerance,cache_enabled:this.cache_enabled,snapshot_stride:this.snapshot_stride,snapshot_count:this.snapshot_count,snapshot_start_tick:this.snapshot_start_tick,no_pending_posts_before_ms:this.no_pending_posts_before_ms,max_contiguous_remote_index:this.max_contiguous_remote_index,initial_time:i,initial_tick:a,max_remote_index:this.max_remote_index,post_count:this.post_count(),server_time:v,server_tick:_,ping:this.ping(),history_truncated:f,cache_drop_guard_hits:this.cache_drop_guard_hits,counts:{remote_posts:this.remote_posts.size,local_posts:this.local_posts.size,timeline_ticks:this.timeline.size,snapshots:this.snapshots.size},ranges:{timeline_min_tick:c.min,timeline_max_tick:c.max,snapshot_min_tick:u.min,snapshot_max_tick:u.max,min_remote_index:d,max_remote_index:T},remote_posts:t,local_posts:n,timeline:o,snapshots:r,client_debug:S}}debug_recompute(t){const n=this.initial_tick(),o=this.timeline_tick_bounds(),r=n!==null&&o.min!==null&&o.min>n;let i=t;if(i===void 0)try{i=this.server_tick()}catch{i=void 0}i===void 0&&(i=n??0);const a=this.snapshots.size;this.snapshots.clear(),this.snapshot_start_tick=null;const c=[];if(r&&c.push("Local history before timeline_min_tick was pruned; full room replay may be impossible without reloading posts."),n===null||i<n)return c.push("No replayable post range available at target tick."),{target_tick:i,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:a,history_truncated:r,state:this.init,notes:c};const u=this.compute_state_at_uncached(n,i);return{target_tick:i,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:a,history_truncated:r,state:u,notes:c}}post(t){const n=this.client_api.post(this.room,t,this.packer),o=this.server_time(),r={room:this.room,index:-1,server_time:o,client_time:o,name:n,data:t};this.add_local_post(n,r)}compute_current_state(){return this.compute_state_at(this.server_tick())}on_sync(t){this.client_api.on_sync(t)}ping(){return this.client_api.ping()}close(){this.latest_index_poll_interval_id!==null&&(clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=null),this.client_api.close()}static gen_name(){return Yt()}};y(bt,"game",bt);var Oe=bt;const Ct=220,ht=["#f25f5c","#247ba0","#70c1b3","#f7b267","#8e6c88","#5c80bc","#9bc53d","#f18f01"],je=24,Bt=120,ot=[101,207,311,419,523,631,733,839,947,1051,1153,1259,1361,1471,1579,1681,1789,1891,1993,2099,2203,2309,2411,2521,2621,2729,2833,2939,3041,3149,3253,3359,3461,3571,3677,3779,3881,3989,4091,4201,4303,4409,4513,4621,4723,4831,4933,5039,5147,5251],Ue=[[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[1,4],[4,7],[2,5],[5,8],[3,6],[6,9],[1,5],[5,9],[2,4],[2,6],[4,8],[6,8],[3,5],[5,7]];function p(e){return`room-${e}`}function st(e,t){return`corridor:${e}:${t}`}function Zt(e,t){return e<t?[e,t]:[t,e]}function Qt(e,t){return`${t}-${e.feed.length+1}-${e.round}-${e.currentTurnName??"none"}`}function Le(e){e.feed.length>Bt&&(e.feed=e.feed.slice(-Bt))}function te(e,t){e.feed.push(t),Le(e)}function M(e,t,n){te(e,{id:Qt(e,"system"),kind:"system",actorName:t,text:n,createdAt:e.feed.length+1})}function Fe(e,t,n){te(e,{id:Qt(e,"chat"),kind:"chat",actorName:t,text:n,createdAt:e.feed.length+1})}function ee(e){return e.filter(t=>t.seat==="participant"&&t.connected)}function Ce(e,t){return e.filter(n=>n.seat==="participant"&&n.connected&&n.name!==t)}function Be(e,t){const n=`${e.clockTick}:${t}:${Object.keys(e.roster).join("|")}`;let o=2166136261;for(let r=0;r<n.length;r+=1)o^=n.charCodeAt(r),o=Math.imul(o,16777619);return o>>>0}function nt(e,t,n,o,r){return e.length===0?null:[...e].sort((a,c)=>{const u=n*(a[t]-c[t]);return u!==0?u:Math.abs(a[r]-o)-Math.abs(c[r]-o)})[0]??null}function Pe(e){const t=new Set,n=[];for(const o of e.values())for(const[r,i]of o){const[a,c]=Zt(r,i),u=`${a}:${c}`;t.has(u)||(t.add(u),n.push([a,c]))}return n}function gt(e,t){const n=[...e];for(let o=n.length-1;o>0;o-=1){const r=Math.floor(t()*(o+1)),i=n[o];n[o]=n[r],n[r]=i}return n}function ne(e){let t=e>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Ve(e,t){return t.activeSessionId?e.clockTick-t.lastSeenTick<=je:!1}function z(e,t,n){return e.roster[t]?.activeSessionId===n}function De(e,t){const n=e.fullState.players[t.name];return{name:t.name,color:n?.color??t.color,joinedAt:n?.joinedAt??t.joinedAt,connected:Ve(e,t),seat:n?.seat??t.seat,role:n?.role??"hen",alive:n?.alive??!1,ready:n?.ready??!1}}function Nt(e){return Object.values(e.roster).sort((t,n)=>t.joinedAt-n.joinedAt).map(t=>De(e,t))}function ut(e){e.masterName&&e.foxName===e.masterName&&(e.foxName=null);for(const t of Object.values(e.players)){if(t.alive=!1,t.locationRoomId=null,t.seat==="spectator"){t.role="spectator",t.ready=!1,t.hasFullInfo=!0;continue}if(e.masterName===t.name){t.role="master",t.hasFullInfo=!0;continue}t.role=e.foxName===t.name?"fox":"hen",t.hasFullInfo=!1}}function Ke(e){if(e.fullState.phase!=="lobby")return!1;const t=ee(Nt(e));return t.length>=2&&t.every(n=>n.ready)}function He(e,t){const n=e.fullState.players[t.name];if(n){n.color=t.color,n.joinedAt=t.joinedAt,n.seat=t.seat,t.seat==="spectator"&&(n.role="spectator",n.ready=!1,n.alive=!1,n.locationRoomId=null,n.hasFullInfo=!0);return}e.fullState.players[t.name]={name:t.name,color:t.color,joinedAt:t.joinedAt,seat:t.seat,role:t.seat==="spectator"?"spectator":"hen",alive:!1,locationRoomId:null,hasFullInfo:t.seat==="spectator",ready:!1}}function oe(e,t){const n=on(t);e.rooms=n.rooms,e.corridors=n.corridors;for(const o of Object.values(e.players))o.locationRoomId=null}function re(e,t){const n=t?e.players[t]:null;!n||n.seat!=="participant"||n.role==="master"?e.foxName=null:e.foxName=t,e.phase==="lobby"&&ut(e)}function ie(e,t,n){const o=x(e),r=Nt(o),i=Ce(r,o.fullState.masterName);if(i.length<2||i.length>8)return e;const a=Object.keys(o.fullState.rooms);if(a.length===0)return e;const c=ne(t),u=[...i].sort((d,T)=>d.joinedAt-T.joinedAt),f=o.fullState.foxName&&u.some(d=>d.name===o.fullState.foxName)?o.fullState.foxName:u[Math.floor(c()*u.length)]?.name??null;if(!f)return e;const v=gt(a,c),_=u.filter(d=>d.name!==f).map(d=>d.name);for(const d of Object.values(o.fullState.players)){if(d.seat==="spectator"){d.role="spectator",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!0,d.ready=!1;continue}if(d.name===o.fullState.masterName){d.role="master",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!0,d.ready=!1;continue}const T=u.findIndex(S=>S.name===d.name);if(T===-1){d.role="hen",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!1,d.ready=!1;continue}d.role=d.name===f?"fox":"hen",d.alive=!0,d.locationRoomId=v[T%v.length]??a[0]??null,d.hasFullInfo=!1,d.ready=!1}return o.fullState.phase="running",o.fullState.round=1,o.fullState.currentTurnName=_[0]??f,o.fullState.henOrder=_,o.fullState.pendingKillTargets=[],o.fullState.foxName=f,M(o.fullState,null,n),o}function We(e,t,n){const o=x(e);o.fullState.phase="lobby",o.fullState.round=0,o.fullState.currentTurnName=null,o.fullState.henOrder=[],o.fullState.pendingKillTargets=[],o.fullState.foxName=null;for(const r of Object.values(o.fullState.players))r.alive=!1,r.locationRoomId=null,r.ready=!1,r.seat==="spectator"?(r.role="spectator",r.hasFullInfo=!0):o.fullState.masterName===r.name?(r.role="master",r.hasFullInfo=!0):(r.role="hen",r.hasFullInfo=!1);return M(o.fullState,t,n),o}function qe(e,t){return t?Object.values(e.players).filter(n=>n.role==="hen"&&n.alive&&n.locationRoomId===t).map(n=>n.name):[]}function rt(e){const n=[...e.henOrder.filter(i=>e.players[i]?.alive),...e.foxName&&e.players[e.foxName]?.alive?[e.foxName]:[]];if(n.length===0)return e.phase="game_over",e.currentTurnName=null,M(e,null,"Partida encerrada."),e;const o=e.currentTurnName?n.indexOf(e.currentTurnName):-1,r=o+1;return o===-1||r>=n.length?(e.round=Math.max(1,e.round)+(o===-1?0:1),e.currentTurnName=n[0]??null):e.currentTurnName=n[r]??null,e.pendingKillTargets=[],e}function se(e,t){const n=e.players[t];return n?(n.alive=!1,n.hasFullInfo=!0,e.pendingKillTargets=[],M(e,e.foxName,`${t} foi capturada.`),Object.values(e.players).some(r=>r.role==="hen"&&r.alive)?rt(e):(e.phase="game_over",e.currentTurnName=null,M(e,e.foxName,"A raposa venceu a partida."),e)):e}function ae(e,t,n){return t===n?!0:e.fullState.masterName===t}function x(e){return JSON.parse(JSON.stringify(e))}function Je(e){return e.trim().replace(/\s+/g," ").slice(0,24)}function Ge(e){return e.trim().replace(/\s+/g,"-").slice(0,36).toLowerCase()}function Xe(e){return JSON.stringify(e)}function Ye(){return ot.length}function Ze(){return ot[Math.floor(Math.random()*ot.length)]??ot[0]}function Qe(e,t){const n=e.filter(o=>o.seat==="participant"&&o.connected&&o.name!==t);return n.length===0?null:n[Math.floor(Math.random()*n.length)]?.name??null}function at(e,t){const n=Math.atan2(t.y-e.y,t.x-e.x);return Math.round((n*180/Math.PI+360)%360)}function le(e,t,n,o="normal"){return{id:e,x:t,y:n,type:o}}function lt(e,t){return{id:st(e.id,t.id),fromRoomId:e.id,toRoomId:t.id,angleFrom:at(e,t),angleTo:at(t,e)}}function Rt(){const e={},t={};for(let o=0;o<3;o+=1)for(let r=0;r<3;r+=1){const i=o*3+r+1,a=p(i);e[a]=le(a,180+r*Ct,160+o*Ct)}const n=[[p(1),p(2)],[p(2),p(3)],[p(4),p(5)],[p(5),p(6)],[p(7),p(8)],[p(8),p(9)],[p(1),p(4)],[p(4),p(7)],[p(2),p(5)],[p(5),p(8)],[p(3),p(6)],[p(6),p(9)],[p(1),p(5)],[p(5),p(9)]];for(const[o,r]of n){const i=lt(e[o],e[r]);t[i.id]=i}return{rooms:e,corridors:t}}function tn(e=null){const{rooms:t,corridors:n}=Rt();return{phase:"lobby",masterName:e,foxName:null,round:0,currentTurnName:null,players:{},rooms:t,corridors:n,henOrder:[],pendingKillTargets:[],feed:[]}}function Tt(e,t){const n=x(e);switch(t.type){case"add_room":{const o=Object.keys(n.rooms).map(i=>Number(i.split("-")[1]??0)),r=p((Math.max(0,...o)||0)+1);return n.rooms[r]=le(r,320,320,"normal"),n}case"set_default_map":{const o=Rt();n.rooms=o.rooms,n.corridors=o.corridors;for(const r of Object.values(n.players))r.locationRoomId=null;return n}case"set_random_map":return oe(n,t.seed),n;case"toggle_corridor":{const[o,r]=Zt(t.leftRoomId,t.rightRoomId),i=st(o,r);if(n.corridors[i])return delete n.corridors[i],n;const a=n.rooms[t.leftRoomId],c=n.rooms[t.rightRoomId];return!a||!c?e:(n.corridors[i]=lt(a,c),n)}case"cycle_room_type":{const o=n.rooms[t.roomId];return o?(o.type=o.type==="normal"?"shop":"normal",n):e}case"remove_room":{delete n.rooms[t.roomId];for(const o of Object.keys(n.corridors)){const r=n.corridors[o];(r.fromRoomId===t.roomId||r.toRoomId===t.roomId)&&delete n.corridors[o]}for(const o of Object.values(n.players))o.locationRoomId===t.roomId&&(o.locationRoomId=null);return n}case"toggle_loop":{const o=st(t.roomId,t.roomId);return n.corridors[o]?(delete n.corridors[o],n):(n.corridors[o]={id:o,fromRoomId:t.roomId,toRoomId:t.roomId,angleFrom:0,angleTo:0},n)}case"move_room":{const o=n.rooms[t.roomId];if(!o)return e;o.x=t.x,o.y=t.y;for(const r of Object.values(n.corridors))if(r.fromRoomId===t.roomId||r.toRoomId===t.roomId){const i=n.rooms[r.fromRoomId],a=n.rooms[r.toRoomId];if(!i||!a)continue;r.angleFrom=at(i,a),r.angleTo=at(a,i)}return n}default:return n}}function en(e){const t=Object.values(e);if(t.length<2)return[];const n=t.reduce((f,v)=>f+v.x,0)/t.length,o=t.reduce((f,v)=>f+v.y,0)/t.length,r=nt(t,"x",1,o,"y"),i=nt(t,"x",-1,o,"y"),a=nt(t,"y",1,n,"x"),c=nt(t,"y",-1,n,"x"),u=[];return r&&i&&r.id!==i.id&&u.push([r.id,i.id]),a&&c&&a.id!==c.id&&u.push([a.id,c.id]),u}function nn(e){const t=new Map,n=[...Ue.map(([o,r])=>[p(o),p(r)]),...en(e)];for(const[o,r]of n)t.set(o,[...t.get(o)??[],[o,r]]),t.set(r,[...t.get(r)??[],[r,o]]);return t}function on(e){const t=ne(e),n=Rt().rooms,o={},r=Object.keys(n).sort(),i=new Set,a=[],c=nn(n),u=p(1+Math.floor(t()*r.length));for(i.add(u),a.push(...c.get(u)??[]);i.size<r.length&&a.length>0;){const S=Math.floor(t()*a.length),[h,g]=a.splice(S,1)[0]??[];if(!h||!g||i.has(g))continue;i.add(g);const O=lt(n[h],n[g]);o[O.id]=O;for(const L of c.get(g)??[])i.has(L[1])||a.push(L)}const f=gt(Pe(c),t),v=3+Math.floor(t()*5);for(const[S,h]of f){if(Object.keys(o).length>=r.length-1+v)break;const g=lt(n[S],n[h]);o[g.id]=g}const _=1+Math.floor(t()*3),d=gt(r,t);for(let S=0;S<_;S+=1){const h=d[S];h&&(n[h].type="shop")}const T=Math.floor(t()*2);for(let S=0;S<T;S+=1){const h=d[_+S];if(!h)continue;const g=st(h,h);o[g]={id:g,fromRoomId:h,toRoomId:h,angleFrom:0,angleTo:0}}return{rooms:n,corridors:o}}function rn(){return{roster:{},fullState:tn(),clockTick:0,nextJoinOrder:0}}function sn(e){return{...e,clockTick:e.clockTick+1}}function an(e,t){const n=x(e),o=n.roster[t.name];if(o)return o.activeSessionId=t.sessionId,o.lastSeenTick=n.clockTick,n;const r=n.nextJoinOrder+1,i=n.fullState.phase==="lobby"?"participant":"spectator",a={name:t.name,color:ht[n.nextJoinOrder%ht.length]??ht[0],joinedAt:r,seat:i,activeSessionId:t.sessionId,lastSeenTick:n.clockTick};return n.nextJoinOrder+=1,n.roster[a.name]=a,He(n,a),n.fullState.phase==="lobby"?ut(n.fullState):M(n.fullState,t.name,`${t.name} entrou como espectador.`),n}function ln(e,t){if(!z(e,t.name,t.sessionId))return e;const n=x(e),o=n.roster[t.name];return o?(o.lastSeenTick=n.clockTick,n):e}function cn(e,t){if(e.fullState.phase!=="lobby"||e.fullState.masterName||!z(e,t.name,t.sessionId))return e;const n=e.fullState.players[t.name];if(!n||n.seat!=="participant")return e;const o=x(e);return o.fullState.masterName=t.name,ut(o.fullState),M(o.fullState,t.name,`${t.name} virou mestre.`),o}function un(e,t){if(e.fullState.phase!=="lobby"||e.fullState.masterName!==t.name||!z(e,t.name,t.sessionId))return e;const n=x(e);return n.fullState.masterName=null,ut(n.fullState),M(n.fullState,t.name,`${t.name} deixou de ser mestre.`),n}function dn(e,t){if(e.fullState.phase!=="lobby"||!z(e,t.name,t.sessionId))return e;const n=e.fullState.players[t.name];if(!n||n.seat!=="participant")return e;const o=x(e);return o.fullState.players[t.name].ready=!o.fullState.players[t.name].ready,M(o.fullState,t.name,o.fullState.players[t.name].ready?`${t.name} ficou ready.`:`${t.name} removeu o ready.`),Ke(o)?ie(o,Be(o,t.name),"Todos ficaram ready. Partida iniciada."):o}function fn(e,t){if(e.fullState.phase!=="lobby"||!z(e,t.name,t.sessionId))return e;const n=e.fullState.players[t.name];if(!n||n.seat!=="participant")return e;const o=x(e);return oe(o.fullState,t.seed),M(o.fullState,t.name,`${t.name} aplicou um mapa aleatorio.`),o}function mn(e,t){if(e.fullState.phase!=="lobby"||!z(e,t.name,t.sessionId))return e;const n=e.fullState.players[t.name];if(!n||n.seat!=="participant")return e;const o=x(e);return re(o.fullState,t.foxName),o.fullState.foxName?M(o.fullState,t.name,`${o.fullState.foxName} virou a raposa.`):M(o.fullState,t.name,"A raposa foi removida."),o}function _n(e,t){if(e.fullState.phase!=="lobby"||!z(e,t.name,t.sessionId))return e;const n=e.fullState.players[t.name];if(!n||n.seat!=="participant"||n.role==="master")return e;const o=x(e),r=o.fullState.foxName===t.name?null:t.name;return re(o.fullState,r),M(o.fullState,t.name,r?`${t.name} virou a raposa.`:`${t.name} deixou de ser raposa.`),o}function hn(e,t){return e.fullState.phase!=="lobby"||e.fullState.masterName!==t.name||!z(e,t.name,t.sessionId)?e:ie(e,t.seed,`${t.name} iniciou a partida.`)}function pn(e,t){if(!z(e,t.name,t.sessionId))return e;const n=t.text.trim().slice(0,280);if(!n)return e;const o=x(e);return Fe(o.fullState,t.name,n),o}function bn(e,t){if(e.fullState.phase!=="lobby"||e.fullState.masterName!==t.name||!z(e,t.name,t.sessionId))return e;const n=x(e);return n.fullState=Tt(n.fullState,t.action),M(n.fullState,t.name,"Mapa atualizado pelo mestre."),n}function gn(e,t){return e.fullState.phase!=="running"||!z(e,t.name,t.sessionId)||!ae(e,t.name,t.actorName)?e:$n(e,t.actorName,t.corridorId)}function yn(e,t){return e.fullState.phase!=="running"||!z(e,t.name,t.sessionId)||!ae(e,t.name,t.actorName)?e:Nn(e,t.actorName,t.targetName)}function vn(e,t){return e.fullState.phase!=="game_over"||!z(e,t.name,t.sessionId)?e:We(e,t.name,`${t.name} voltou a sala para o lobby.`)}function In(e,t){let n;try{n=JSON.parse(e)}catch{return t}switch(n.$){case"join_room":return an(t,n);case"heartbeat":return ln(t,n);case"claim_master":return cn(t,n);case"unclaim_master":return un(t,n);case"toggle_ready":return dn(t,n);case"set_random_map":return fn(t,n);case"set_random_fox":return mn(t,n);case"toggle_self_fox":return _n(t,n);case"start_game":return hn(t,n);case"lobby_chat_message":return pn(t,n);case"map_edit":return bn(t,n);case"submit_move":return gn(t,n);case"select_kill_target":return yn(t,n);case"return_to_lobby":return vn(t,n);default:return t}}function kn(e,t){const n=ee(e),o=e.filter(r=>r.seat==="participant").length;return{readyCount:n.filter(r=>r.ready).length,connectedParticipantCount:n.length,totalParticipantCount:o,allConnectedReady:n.length>=2&&n.every(r=>r.ready),foxName:t.foxName}}function Sn(e,t,n){const o=Nt(n);return{room:e,selfName:t,phase:n.fullState.phase,masterName:n.fullState.masterName,players:o,lobbyState:n.fullState.phase==="lobby"?kn(o,n.fullState):null,publicState:n.fullState.phase==="lobby"?null:xn(n.fullState,o),fullState:x(n.fullState),feed:[...n.fullState.feed]}}function xn(e,t){const n={},o=Object.values(e.players).filter(r=>r.role==="hen"||r.role==="fox").sort((r,i)=>r.joinedAt-i.joinedAt).map(r=>r.name);for(const r of o){const i=e.players[r],a=i.locationRoomId,c=a?e.rooms[a]:null,u=a?Object.values(e.players).filter(f=>f.locationRoomId===a&&f.alive).map(f=>{const v=t.find(_=>_.name===f.name);return{name:f.name,color:f.color,role:f.role,alive:f.alive,connected:v?.connected??!1}}):[];n[r]={name:r,roomId:a,roomType:c?.type??null,playersHere:u,exits:a?wn(e,a):[],alive:i.alive,connected:t.find(f=>f.name===r)?.connected??!1,canAct:e.currentTurnName===r}}return{phase:e.phase,round:e.round,currentTurnName:e.currentTurnName,screens:n,watchOrder:o,pendingKillTargets:[...e.pendingKillTargets]}}function wn(e,t){return Object.values(e.corridors).flatMap(n=>n.fromRoomId===t&&n.toRoomId===t?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!0}]:n.fromRoomId===t?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!1}]:n.toRoomId===t?[{corridorId:n.id,angle:n.angleTo,leadsToSelf:!1}]:[]).sort((n,o)=>n.angle-o.angle)}function $n(e,t,n){if(e.fullState.phase!=="running"||e.fullState.currentTurnName!==t||e.fullState.pendingKillTargets.length>0)return e;const o=x(e),r=o.fullState.players[t];if(!r||!r.alive)return e;if(n===null)return o.fullState=rt(o.fullState),o;const i=o.fullState.corridors[n];if(!i||!r.locationRoomId)return e;if(i.fromRoomId===r.locationRoomId&&i.toRoomId===r.locationRoomId)r.locationRoomId=i.toRoomId;else if(i.fromRoomId===r.locationRoomId)r.locationRoomId=i.toRoomId;else if(i.toRoomId===r.locationRoomId)r.locationRoomId=i.fromRoomId;else return e;if(r.role==="fox"){const a=qe(o.fullState,r.locationRoomId);return a.length===0?(o.fullState=rt(o.fullState),o):a.length===1?(o.fullState=se(o.fullState,a[0]??""),o):(o.fullState.pendingKillTargets=a,o)}return o.fullState=rt(o.fullState),o}function Nn(e,t,n){if(e.fullState.phase!=="running"||e.fullState.currentTurnName!==t||e.fullState.pendingKillTargets.length===0||!e.fullState.pendingKillTargets.includes(n))return e;const o=x(e);return o.fullState=se(o.fullState,n),o}const ce="vibi-maze-name",ue="vibi-maze-room",de="vibi-maze-session",Z=900,Q=660,Rn=200,Tn=2500,Mn={$:"String"},yt=new URLSearchParams(window.location.search),l={roomInput:yt.get("room")??window.localStorage.getItem(ue)??"galinheiro-1",nameInput:yt.get("name")??window.localStorage.getItem(ce)??"",chatInput:"",followTurn:!0,watchName:null,revealFullMap:!1,selectedRoomId:null,connectSourceRoomId:null,dragRoomId:null,editorOpen:!1,toast:""};let U=null,ct="idle",vt=null,It=null,R=jn(),W=null,q=null,kt=null,s=null,St="",$=null;const fe=document.querySelector("#app");if(!fe)throw new Error("Elemento #app nao encontrado.");const J=fe;J.addEventListener("submit",e=>{const t=e.target;if(t instanceof HTMLFormElement){if(t.dataset.form==="join"){e.preventDefault(),En();return}t.dataset.form==="chat"&&(e.preventDefault(),to())}});J.addEventListener("input",e=>{const t=e.target;(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)&&(t.name==="room"&&(l.roomInput=t.value),t.name==="name"&&(l.nameInput=t.value),t.name==="chat"&&(l.chatInput=t.value))});J.addEventListener("click",async e=>{const t=e.target;if(!(t instanceof HTMLElement))return;const n=t.closest("[data-action]");if(!n)return;const o=n.dataset.action;if(o)switch(o){case"claim-master":if(!s)return;A(N()?{$:"unclaim_master",name:s.selfName,sessionId:R}:{$:"claim_master",name:s.selfName,sessionId:R});break;case"toggle-ready":if(!s)return;A({$:"toggle_ready",name:s.selfName,sessionId:R});break;case"copy-link":await lo();break;case"toggle-follow-turn":l.followTurn=!l.followTurn,l.followTurn&&(l.watchName=s?.publicState?.currentTurnName??s?.selfName??null),k();break;case"watch-screen":l.watchName=n.dataset.name??s?.selfName??null,l.followTurn=!1,k();break;case"reveal-full-map":l.revealFullMap=!0,k();break;case"random-map":if(!s)return;A({$:"set_random_map",name:s.selfName,sessionId:R,seed:Ze()}),H(`Mapa aleatorio aplicado. Biblioteca: ${Ye()} mapas.`);break;case"shuffle-fox":if(!s)return;A({$:"set_random_fox",name:s.selfName,sessionId:R,foxName:Qe(s.players,s.masterName)});break;case"toggle-self-fox":if(!s)return;A({$:"toggle_self_fox",name:s.selfName,sessionId:R});break;case"start-game":if(!s)return;A({$:"start_game",name:s.selfName,sessionId:R,seed:Un()});break;case"back-to-lobby":if(!s)return;A({$:"return_to_lobby",name:s.selfName,sessionId:R});break;case"open-editor":he();break;case"close-modal":pe();break;case"editor-add-room":D({type:"add_room"});break;case"editor-default":D({type:"set_default_map"});break;case"editor-connect":l.connectSourceRoomId=l.selectedRoomId,k();break;case"editor-cycle-type":if(!l.selectedRoomId)return;D({type:"cycle_room_type",roomId:l.selectedRoomId});break;case"editor-remove-room":if(!l.selectedRoomId)return;{const r=l.selectedRoomId;l.selectedRoomId=null,l.connectSourceRoomId=null,D({type:"remove_room",roomId:r})}break;case"editor-loop":if(!l.selectedRoomId)return;D({type:"toggle_loop",roomId:l.selectedRoomId});break;case"submit-pass":Pt(null);break;case"submit-move":Pt(n.dataset.corridorId??null);break;case"kill-target":eo(n.dataset.targetName??"");break}});window.addEventListener("keydown",e=>{const t=e.target,n=t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement;if(e.key==="Escape"){if(l.editorOpen){pe();return}s&&(l.watchName=s.selfName,l.followTurn=!1,k());return}!n&&e.key.toLowerCase()==="m"&&s?.phase==="lobby"&&N()&&(e.preventDefault(),he())});k();function En(){const e=Ge(l.roomInput),t=Je(l.nameInput);if(!e||!t){H("Informe room e nome.");return}l.roomInput=e,l.nameInput=t,window.localStorage.setItem(ue,e),window.localStorage.setItem(ce,t),vt=e,It=t,R=_e(),On(),s=null,St="",kt=null,$=null,l.watchName=null,l.revealFullMap=!1,l.editorOpen=!1,l.selectedRoomId=null,l.connectSourceRoomId=null,l.dragRoomId=null,ct="connecting";const n={room:e,initial:rn(),on_tick:sn,on_post:In,packer:Mn,tick_rate:6,tolerance:300},o=ao();o!==$t&&(n.server=o),U=new Oe.game(n),U.on_sync(()=>{ct="connected",A({$:"join_room",name:t,sessionId:R}),zn(),me(),k()}),k()}function me(){if(!U||!vt||!It)return;kt=U.compute_render_state(),s=Sn(vt,It,kt),An();const e=JSON.stringify(s);e!==St&&(St=e,k())}function An(){if(!s)return;const e=dt();e&&e.seat==="spectator"&&s.phase!=="lobby"&&(l.revealFullMap=!0),s.phase==="lobby"&&(l.revealFullMap=!1),s.phase!=="lobby"?l.followTurn?l.watchName=s.publicState?.currentTurnName??s.selfName:l.watchName||(l.watchName=s.selfName):l.watchName=s.selfName,l.editorOpen&&s.phase==="lobby"&&!l.dragRoomId&&($=x(s.fullState)),s.phase!=="lobby"&&(l.editorOpen=!1,$=null)}function A(e){if(!U){H("Sem conexao com o VibiNet.");return}U.post(Xe(e))}function zn(){W!==null&&window.clearInterval(W),q!==null&&window.clearInterval(q),W=window.setInterval(()=>{me()},Rn),q=window.setInterval(()=>{s&&A({$:"heartbeat",name:s.selfName,sessionId:R})},Tn)}function On(){W!==null&&(window.clearInterval(W),W=null),q!==null&&(window.clearInterval(q),q=null),U?.close(),U=null,ct="closed"}function jn(){const e=window.sessionStorage.getItem(de);return e||_e()}function _e(){const e=typeof crypto.randomUUID=="function"?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;return window.sessionStorage.setItem(de,e),e}function Un(){return Math.floor(Math.random()*4294967295)}function k(){if(!s){J.innerHTML=Ln();return}J.innerHTML=`
    <main class="app-shell phase-${s.phase}">
      ${Cn()}
      <section class="main-column">
        ${Fn()}
        ${s.phase==="lobby"?Pn():Vn()}
      </section>
      <aside class="right-column">
        ${Jn()}
        ${Gn()}
      </aside>
      ${Yn()}
    </main>
  `,Qn()}function Ln(){return`
    <main class="join-shell">
      <section class="join-card">
        <p class="eyebrow">Room + Nome</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Entre numa sala, escolha seus papeis no lobby e prepare o labirinto antes da raposa sair cacando.
        </p>
        <form data-form="join" class="join-form">
          <label class="field">
            <span>Room</span>
            <input name="room" value="${b(l.roomInput)}" maxlength="36" />
          </label>
          <label class="field">
            <span>Nome</span>
            <input name="name" value="${b(l.nameInput)}" maxlength="24" />
          </label>
          <button class="btn btn-primary" type="submit">
            ${ct==="connecting"?"Conectando...":"Entrar"}
          </button>
        </form>
        ${l.toast?`<p class="toast">${b(l.toast)}</p>`:""}
      </section>
    </main>
  `}function Fn(){if(!s)return"";const e=s,t=e.lobbyState?`${e.lobbyState.readyCount}/${e.lobbyState.connectedParticipantCount} ready`:`Rodada ${e.publicState?.round??0}`,n=e.publicState?.currentTurnName?e.players.find(o=>o.name===e.publicState?.currentTurnName):null;return`
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${b(io(e.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">${e.phase==="lobby"?"PRONTOS":"VEZ"}</p>
        <strong style="${n?`color:${n.color}`:""}">
          ${b(e.phase==="lobby"?t:n?.name??"Aguardando")}
        </strong>
      </div>
    </section>
  `}function Cn(){if(!s)return"";const e=dt(),t=l.watchName??s.selfName;return`
    <aside class="left-sidebar">
      <section class="panel compact-stack">
        <div class="mini-metric">
          <span>Ping</span>
          <strong>${Math.round(U?.ping?.()??0)} ms</strong>
        </div>
        <button class="btn btn-secondary btn-block" data-action="copy-link" type="button">Copiar link</button>
        ${s.phase==="lobby"?`
              <button
                class="btn ${e?.ready?"btn-danger":"btn-primary"} btn-block"
                data-action="toggle-ready"
                type="button"
                ${e?.seat==="participant"?"":"disabled"}
              >
                ${e?.ready?"Remover ready":"Ready"}
              </button>
            `:`
              <div class="mini-metric">
                <span>Visao</span>
                <strong>${b(t)}</strong>
              </div>
            `}
      </section>
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Pessoas na sala</h2>
          <span class="tag">${s.players.length}</span>
        </div>
        <ul class="roster">
          ${s.players.map(n=>Bn(n,t)).join("")}
        </ul>
      </section>
    </aside>
  `}function Bn(e,t){const n=e.name===s?.selfName,o=e.name===t,r=!!(s?.phase!=="lobby"&&s?.publicState?.screens[e.name]),i=`
    <span class="legend-color" style="background:${e.color}"></span>
    <div class="roster-copy">
      <strong>${b(e.name)}</strong>
      <div class="helper">
        ${b(be(e.role))} • ${e.connected?"online":"offline"}
      </div>
    </div>
    <span class="tag">${e.ready&&s?.phase==="lobby"?"ready":e.alive?"vivo":e.seat==="spectator"?"spec":"fora"}</span>
  `;return r?`
    <li>
      <button
        class="roster-item roster-button ${n?"is-self":""} ${o?"is-active":""}"
        data-action="watch-screen"
        data-name="${b(e.name)}"
        type="button"
      >
        ${i}
      </button>
    </li>
  `:`<li class="roster-item ${n?"is-self":""} ${o?"is-active":""}">${i}</li>`}function Pn(){return s?`
    <section class="lobby-layout">
      <section class="panel stack spacious">
        <div class="panel-header">
          <div>
            <h2 class="section-title">Lobby da sala</h2>
            <p class="helper">
              ${b(s.room)} • ${s.lobbyState?.readyCount??0}/${s.lobbyState?.connectedParticipantCount??0} ready
            </p>
          </div>
          <span class="tag">${b(s.masterName??"sem mestre")}</span>
        </div>
        <div class="lobby-summary-grid">
          <div class="metric-card">
            <span>Mestre</span>
            <strong>${b(s.masterName??"ninguem")}</strong>
          </div>
          <div class="metric-card">
            <span>Raposa</span>
            <strong>${b(s.fullState.foxName??"nao escolhida")}</strong>
          </div>
          <div class="metric-card">
            <span>Participantes</span>
            <strong>${s.lobbyState?.connectedParticipantCount??0}</strong>
          </div>
          <div class="metric-card">
            <span>Inicio</span>
            <strong>${s.lobbyState?.allConnectedReady?"automatico":"aguardando"}</strong>
          </div>
        </div>
        <div class="panel-note">
          ${N()?"Voce e o mestre. Use o botao ou aperte M para abrir o editor do mapa.":"O lobby nao mostra telas para assistir. Aqui voce organiza papeis, ready e conversa antes da partida."}
        </div>
        <svg class="editor-map readonly" viewBox="0 0 ${Z} ${Q}">
          ${Mt(s.fullState,!1)}
        </svg>
      </section>
    </section>
  `:""}function Vn(){return`
    <section class="game-layout">
      <section class="panel spacious">
        ${oo()?Dn():Hn()}
      </section>
    </section>
  `}function Dn(){return s?`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${N()?"Mapa completo":"Visao completa"}</h2>
          <p class="helper">
            ${N()?"Como mestre, voce enxerga o labirinto inteiro.":"Voce liberou o mapa completo para assistir."}
          </p>
        </div>
        ${s.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${Z} ${Q}">
        ${Mt(s.fullState,!1)}
      </svg>
      ${Kn()}
    </section>
  `:'<div class="empty-panel"><h2>Sem mapa completo</h2></div>'}function Kn(){return s?`
    <div class="legend-grid">
      ${s.players.map(e=>`
          <div class="legend-chip">
            <span class="legend-color" style="background:${e.color}"></span>
            <strong>${b(e.name)}</strong>
            <span>${b(be(e.role))}</span>
          </div>
        `).join("")}
    </div>
  `:""}function Hn(){if(!s?.publicState)return'<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';const e=l.watchName??s.selfName,t=s.publicState.screens[e]??null,n=s.fullState.players[s.selfName],o=!!(n&&!n.alive&&n.seat==="participant"&&!l.revealFullMap);if(!t)return`
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${o?'<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
        ${s.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
    `;const i=Et()===e,a=i&&s.publicState.pendingKillTargets.length===0,c=i&&s.publicState.pendingKillTargets.length>0;return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${b(t.name)}</h2>
          <p class="helper">
            ${b(t.roomType?`Sala ${At(t.roomType)}`:"Sem posicao visivel")}
          </p>
        </div>
        <div class="button-row tight">
          ${o?'<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
          ${s.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
        </div>
      </div>
      ${qn(t,a)}
      ${c?Wn(s.publicState.pendingKillTargets):`
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${a?"":"disabled"}>Passar</button>
            </div>
          `}
    </section>
  `}function Wn(e){return`
    <div class="kill-picker">
      <strong>Raposa escolhe quem cai:</strong>
      <div class="button-row">
        ${e.map(t=>`
            <button class="btn btn-danger" data-action="kill-target" data-target-name="${b(t)}" type="button">
              ${b(t)}
            </button>
          `).join("")}
      </div>
    </div>
  `}function qn(e,t){const n=so(e.exits);return`
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${b(e.roomType?At(e.roomType):"Sem sala")}</div>
        ${n.map(o=>`
            <button
              class="exit-btn"
              style="left:${o.left}%;top:${o.top}%;"
              data-action="submit-move"
              data-corridor-id="${b(o.corridorId)}"
              type="button"
              ${t?"":"disabled"}
            >
              <span class="exit-arrow" style="transform:rotate(${o.angle}deg)">➜</span>
              <small>${o.angle}°</small>
            </button>
          `).join("")}
        <div class="stickman-row">
          ${e.playersHere.map(o=>Zn(o.name,o.color)).join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${e.playersHere.length||0}</p>
        <p><strong>Saidas:</strong> ${e.exits.map(o=>`${o.angle}°`).join(", ")||"nenhuma"}</p>
      </div>
    </section>
  `}function Jn(){if(!s)return"";const e=dt(),t=e?.role==="fox"?"Deixar de ser raposa":"Ser raposa";return s.phase==="lobby"?`
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Acoes do lobby</h2>
          <span class="tag">${s.lobbyState?.allConnectedReady?"auto start":"manual"}</span>
        </div>
        <div class="action-stack">
          <button class="btn ${N()?"btn-danger":"btn-primary"} btn-block" data-action="claim-master" type="button">
            ${N()?"Deixar de ser mestre":"Virar mestre"}
          </button>
          <button class="btn btn-secondary btn-block" data-action="random-map" type="button" ${e?.seat==="participant"?"":"disabled"}>
            Mapa aleatorio
          </button>
          <button class="btn btn-secondary btn-block" data-action="shuffle-fox" type="button" ${e?.seat==="participant"?"":"disabled"}>
            Sortear raposa
          </button>
          <button class="btn btn-secondary btn-block" data-action="toggle-self-fox" type="button" ${e?.seat==="participant"&&!N()?"":"disabled"}>
            ${t}
          </button>
          <button class="btn btn-secondary btn-block" data-action="open-editor" type="button" ${N()?"":"disabled"}>
            Abrir editor
          </button>
          <button class="btn btn-primary btn-block" data-action="start-game" type="button" ${N()?"":"disabled"}>
            Play
          </button>
        </div>
      </section>
    `:`
    <section class="panel stack">
      <div class="panel-header">
        <h2 class="section-title">Partida</h2>
        <span class="tag">${s.publicState?.round??0}</span>
      </div>
      <p class="metric"><strong>Na tela:</strong> ${b(l.watchName??s.selfName)}</p>
      <p class="metric"><strong>Turno:</strong> ${b(s.publicState?.currentTurnName??"Aguardando")}</p>
      <div class="action-stack">
        <button class="btn btn-secondary btn-block" data-action="toggle-follow-turn" type="button">
          ${l.followTurn?"Parar de acompanhar a vez":"Acompanhar a vez"}
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="reveal-full-map"
          type="button"
          ${ro()?"":"disabled"}
        >
          Ficar de espectador
        </button>
        ${s.phase==="game_over"?'<button class="btn btn-primary btn-block" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      ${l.toast?`<p class="toast">${b(l.toast)}</p>`:""}
    </section>
  `}function Gn(){return s?`
    <section class="panel stack feed-panel">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Chat e log</h2>
          <p class="helper">Mensagens digitadas e avisos do sistema ficam juntos, com estilos diferentes.</p>
        </div>
      </div>
      <div class="feed-list">
        ${s.feed.length>0?s.feed.map(e=>Xn(e)).join(""):'<div class="empty-panel feed-empty">Sem mensagens ainda.</div>'}
      </div>
      <form data-form="chat" class="chat-form">
        <textarea
          name="chat"
          rows="3"
          maxlength="280"
          placeholder="Digite algo para a sala..."
        >${b(l.chatInput)}</textarea>
        <button class="btn btn-primary btn-block" type="submit">Enviar</button>
      </form>
    </section>
  `:""}function Xn(e){const t=e.actorName&&e.actorName===s?.selfName;return`
    <article class="feed-entry ${e.kind} ${t?"is-self":""}">
      <header>
        <strong>${b(e.kind==="chat"?e.actorName??"anon":"sistema")}</strong>
        <span>${e.kind==="chat"?"fala":"acao"}</span>
      </header>
      <p>${b(e.text)}</p>
    </article>
  `}function Yn(){if(!l.editorOpen||!$||!s||!N())return"";const e=l.selectedRoomId?$.rooms[l.selectedRoomId]:null;return`
    <div class="modal-backdrop">
      <section class="modal-card modal-wide">
        <div class="panel-header">
          <div>
            <h2 class="section-title">Editor do mestre</h2>
            <p class="helper">Use o mouse para arrastar salas e conectar corredores.</p>
          </div>
          <button class="btn btn-secondary" data-action="close-modal" type="button">Fechar</button>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary" data-action="editor-add-room" type="button">Nova sala</button>
          <button class="btn btn-secondary" data-action="editor-default" type="button">Mapa 3x3</button>
        </div>
        <svg class="editor-map" data-editor-svg viewBox="0 0 ${Z} ${Q}">
          ${Mt($,!0)}
        </svg>
        <div class="editor-toolbar">
          <div class="metric-block">
            <strong>Sala selecionada</strong>
            <span>${b(e?.id??"nenhuma")}</span>
          </div>
          <div class="metric-block">
            <strong>Tipo</strong>
            <span>${b(e?.type??"-")}</span>
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
    </div>
  `}function Mt(e,t){const n=new Map;for(const o of Object.values(e.players))o.locationRoomId&&(n.has(o.locationRoomId)||n.set(o.locationRoomId,[]),n.get(o.locationRoomId)?.push({name:o.name,color:o.color}));return`
    ${Object.values(e.corridors).map(o=>{const r=e.rooms[o.fromRoomId],i=e.rooms[o.toRoomId];return!r||!i?"":r.id===i.id?`
            <path
              class="corridor-loop"
              d="M ${r.x} ${r.y-44} C ${r.x+48} ${r.y-120}, ${r.x-48} ${r.y-120}, ${r.x} ${r.y-44}"
            />
          `:`
          <line
            class="corridor-line"
            x1="${r.x}"
            y1="${r.y}"
            x2="${i.x}"
            y2="${i.y}"
          />
        `}).join("")}
    ${Object.values(e.rooms).map(o=>{const r=t&&l.selectedRoomId===o.id,i=t&&l.connectSourceRoomId===o.id,a=n.get(o.id)??[];return`
          <g
            ${t?`data-room-node="${b(o.id)}"`:""}
            class="room-node ${r?"selected":""} ${i?"armed":""}"
            transform="translate(${o.x}, ${o.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${o.type}" />
            <text class="room-title" text-anchor="middle" y="4">${b(o.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${b(At(o.type))}</text>
            ${a.map((c,u)=>`
                <circle cx="${-18+u*18}" cy="-12" r="6" fill="${c.color}" />
              `).join("")}
          </g>
        `}).join("")}
  `}function Zn(e,t){return`
    <div class="stickman">
      <svg viewBox="0 0 64 84" class="stickman-svg" aria-hidden="true">
        <circle cx="32" cy="14" r="10" fill="${t}" />
        <line x1="32" y1="24" x2="32" y2="52" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="16" y1="36" x2="48" y2="36" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="18" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="46" y2="74" stroke="${t}" stroke-width="6" stroke-linecap="round" />
      </svg>
      <span>${b(e)}</span>
    </div>
  `}function Qn(){const e=J.querySelector("[data-editor-svg]");if(!e||!l.editorOpen||!$||!s||s.phase!=="lobby"||!N())return;const t=n=>{const o=e.getBoundingClientRect(),r=(n.clientX-o.left)/o.width*Z,i=(n.clientY-o.top)/o.height*Q;return{x:Math.max(60,Math.min(Z-60,r)),y:Math.max(60,Math.min(Q-60,i))}};e.onpointerdown=n=>{const o=n.target;if(!(o instanceof SVGElement))return;const i=o.closest("[data-room-node]")?.dataset.roomNode;if(i){if(l.connectSourceRoomId&&l.connectSourceRoomId!==i){const a=l.connectSourceRoomId;l.connectSourceRoomId=null,D({type:"toggle_corridor",leftRoomId:a,rightRoomId:i});return}if(l.connectSourceRoomId===i){l.connectSourceRoomId=null,k();return}l.selectedRoomId=i,l.dragRoomId=i,k(),e.setPointerCapture(n.pointerId)}},e.onpointermove=n=>{if(!l.dragRoomId||l.connectSourceRoomId||!$)return;const o=t(n);$=Tt($,{type:"move_room",roomId:l.dragRoomId,x:o.x,y:o.y}),k()},e.onpointerup=()=>{if(!l.dragRoomId||!$)return;const n=$.rooms[l.dragRoomId],o=l.dragRoomId;l.dragRoomId=null,n?D({type:"move_room",roomId:o,x:n.x,y:n.y}):k()}}function he(){!s||s.phase!=="lobby"||!N()||(l.editorOpen=!0,l.selectedRoomId=null,l.connectSourceRoomId=null,$=x(s.fullState),k())}function pe(){l.editorOpen=!1,l.dragRoomId=null,l.selectedRoomId=null,l.connectSourceRoomId=null,$=null,k()}function D(e,t=!0){!s||s.phase!=="lobby"||!N()||!$||($=Tt($,e),A({$:"map_edit",name:s.selfName,sessionId:R,action:e}),t&&k())}function to(){if(!s)return;const e=l.chatInput.trim();e&&(A({$:"lobby_chat_message",name:s.selfName,sessionId:R,text:e}),l.chatInput="",k())}function Pt(e){if(!s)return;const t=Et();t&&A({$:"submit_move",name:s.selfName,sessionId:R,actorName:t,corridorId:e})}function eo(e){if(!s||!e)return;const t=Et();t&&A({$:"select_kill_target",name:s.selfName,sessionId:R,actorName:t,targetName:e})}function Et(){return s?.publicState?.currentTurnName?no()?s.selfName:N()?s.publicState.currentTurnName:null:null}function no(){return s?.publicState?.currentTurnName?s.publicState.currentTurnName===s.selfName:!1}function oo(){if(!s)return!1;if(N())return!0;const e=s.fullState.players[s.selfName];return dt()?.seat==="spectator"&&s.phase!=="lobby"?!0:!!(e&&!e.alive&&l.revealFullMap)}function ro(){if(!s)return!1;const e=s.fullState.players[s.selfName];return!!(e&&!e.alive&&e.seat==="participant"&&!l.revealFullMap)}function dt(){return s?.players.find(e=>e.name===s?.selfName)??null}function N(){return!!(s&&s.masterName===s.selfName)}function be(e){switch(e){case"master":return"mestre";case"fox":return"raposa";case"hen":return"galinha";case"spectator":return"espectador";default:return"galinha"}}function io(e){switch(e){case"lobby":return"lobby";case"running":return"partida";case"game_over":return"fim da partida";default:return e}}function At(e){return e==="shop"?"loja":"normal"}function so(e){const t=[...e].sort((r,i)=>r.angle-i.angle);let n=-999,o=0;return t.map(r=>{Math.abs(r.angle-n)<18?o+=1:o=0,n=r.angle;const i=r.angle*Math.PI/180,a=40+o*9,c=28+o*7,u=50+Math.cos(i)*a,f=50+Math.sin(i)*c;return{corridorId:r.corridorId,angle:r.angle,left:u,top:f}})}function ao(){const e=yt.get("server")??void 0;return e||$t}async function lo(){if(!s)return;const e=new URL(window.location.href);e.searchParams.set("room",s.room);const t=e.toString();try{await navigator.clipboard.writeText(t),H("Link da room copiado.")}catch{H(t)}}function H(e){l.toast=e,k(),window.clearTimeout(H.timer),H.timer=window.setTimeout(()=>{l.toast="",k()},2600)}function b(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
