(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();var Rt=Object.defineProperty,Tt=(t,e,n)=>e in t?Rt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,y=(t,e,n)=>Tt(t,typeof e!="symbol"?e+"":e,n),ve=53,Mt=new TextDecoder,Fe=new WeakMap,Pe=new WeakMap,Et=class{constructor(t){y(this,"buf"),y(this,"bit_pos"),this.buf=t,this.bit_pos=0}write_bit(t){const e=this.bit_pos>>>3,n=this.bit_pos&7;t&&(this.buf[e]|=1<<n),this.bit_pos++}write_bitsUnsigned(t,e){if(e!==0){if(typeof t=="number"){if(e<=32){if((this.bit_pos&7)===0&&(e&7)===0){let r=t>>>0,i=this.bit_pos>>>3;for(let a=0;a<e;a+=8)this.buf[i++]=r&255,r>>>=8;this.bit_pos+=e;return}let o=t>>>0;for(let r=0;r<e;r++)this.write_bit(o&1),o>>>=1;return}this.write_bitsBigint(BigInt(t),e);return}this.write_bitsBigint(t,e)}}write_bitsBigint(t,e){if(e===0)return;if((this.bit_pos&7)===0&&(e&7)===0){let r=t,i=this.bit_pos>>>3;for(let a=0;a<e;a+=8)this.buf[i++]=Number(r&0xffn),r>>=8n;this.bit_pos+=e;return}let o=t;for(let r=0;r<e;r++)this.write_bit((o&1n)===0n?0:1),o>>=1n}},At=class{constructor(t){y(this,"buf"),y(this,"bit_pos"),this.buf=t,this.bit_pos=0}read_bit(){const t=this.bit_pos>>>3,e=this.bit_pos&7,n=this.buf[t]>>>e&1;return this.bit_pos++,n}read_bitsUnsigned(t){if(t===0)return 0;if(t<=32){if((this.bit_pos&7)===0&&(t&7)===0){let o=0,r=0,i=this.bit_pos>>>3;for(let a=0;a<t;a+=8)o|=this.buf[i++]<<r,r+=8;return this.bit_pos+=t,o>>>0}let n=0;for(let o=0;o<t;o++)this.read_bit()&&(n|=1<<o);return n>>>0}if(t<=ve){let e=0,n=1;for(let o=0;o<t;o++)this.read_bit()&&(e+=n),n*=2;return e}return this.read_bitsBigint(t)}read_bitsBigint(t){if(t===0)return 0n;if((this.bit_pos&7)===0&&(t&7)===0){let r=0n,i=0n,a=this.bit_pos>>>3;for(let c=0;c<t;c+=8)r|=BigInt(this.buf[a++])<<i,i+=8n;return this.bit_pos+=t,r}let n=0n,o=1n;for(let r=0;r<t;r++)this.read_bit()&&(n+=o),o<<=1n;return n}};function Z(t,e){if(!Number.isInteger(t))throw new TypeError(`${e} must be an integer`)}function D(t){if(Z(t,"size"),t<0)throw new RangeError("size must be >= 0")}function Ge(t,e){if(e!==t)throw new RangeError(`vector size mismatch: expected ${t}, got ${e}`)}function F(t,e){switch(t.$){case"UInt":case"Int":return D(t.size),t.size;case"Nat":{if(typeof e=="bigint"){if(e<0n)throw new RangeError("Nat must be >= 0");if(e>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Nat too large to size");return Number(e)+1}if(Z(e,"Nat"),e<0)throw new RangeError("Nat must be >= 0");return e+1}case"Tuple":{const n=t.fields,o=ae(e,"Tuple");let r=0;for(let i=0;i<n.length;i++)r+=F(n[i],o[i]);return r}case"Vector":{D(t.size);const n=ae(e,"Vector");Ge(t.size,n.length);let o=0;for(let r=0;r<t.size;r++)o+=F(t.type,n[r]);return o}case"Struct":{let n=0;const o=Te(t.fields);for(let r=0;r<o.length;r++){const i=o[r],a=Je(e,i);n+=F(t.fields[i],a)}return n}case"List":{let n=1;return Ze(e,o=>{n+=1,n+=F(t.type,o)}),n}case"Map":{let n=1;return Qe(e,(o,r)=>{n+=1,n+=F(t.key,o),n+=F(t.value,r)}),n}case"Union":{const n=Re(t),o=Xe(e),r=t.variants[o];if(!r)throw new RangeError(`Unknown union variant: ${o}`);const i=Ye(e,r);return n.tag_bits+F(r,i)}case"String":return 1+Ot(e)*9}}function P(t,e,n){switch(e.$){case"UInt":{if(D(e.size),e.size===0){if(n===0||n===0n)return;throw new RangeError("UInt out of range")}if(typeof n=="bigint"){if(n<0n)throw new RangeError("UInt must be >= 0");const r=1n<<BigInt(e.size);if(n>=r)throw new RangeError("UInt out of range");t.write_bitsUnsigned(n,e.size);return}if(Z(n,"UInt"),n<0)throw new RangeError("UInt must be >= 0");if(e.size>ve)throw new RangeError("UInt too large for number; use bigint");const o=2**e.size;if(n>=o)throw new RangeError("UInt out of range");t.write_bitsUnsigned(n,e.size);return}case"Int":{if(D(e.size),e.size===0){if(n===0||n===0n)return;throw new RangeError("Int out of range")}if(typeof n=="bigint"){const a=BigInt(e.size),c=-(1n<<a-1n),u=(1n<<a-1n)-1n;if(n<c||n>u)throw new RangeError("Int out of range");let f=n;n<0n&&(f=(1n<<a)+n),t.write_bitsUnsigned(f,e.size);return}if(Z(n,"Int"),e.size>ve)throw new RangeError("Int too large for number; use bigint");const o=-(2**(e.size-1)),r=2**(e.size-1)-1;if(n<o||n>r)throw new RangeError("Int out of range");let i=n;n<0&&(i=2**e.size+n),t.write_bitsUnsigned(i,e.size);return}case"Nat":{if(typeof n=="bigint"){if(n<0n)throw new RangeError("Nat must be >= 0");let o=n;for(;o>0n;)t.write_bit(1),o-=1n;t.write_bit(0);return}if(Z(n,"Nat"),n<0)throw new RangeError("Nat must be >= 0");for(let o=0;o<n;o++)t.write_bit(1);t.write_bit(0);return}case"Tuple":{const o=e.fields,r=ae(n,"Tuple");for(let i=0;i<o.length;i++)P(t,o[i],r[i]);return}case"Vector":{D(e.size);const o=ae(n,"Vector");Ge(e.size,o.length);for(let r=0;r<e.size;r++)P(t,e.type,o[r]);return}case"Struct":{const o=Te(e.fields);for(let r=0;r<o.length;r++){const i=o[r];P(t,e.fields[i],Je(n,i))}return}case"List":{Ze(n,o=>{t.write_bit(1),P(t,e.type,o)}),t.write_bit(0);return}case"Map":{Qe(n,(o,r)=>{t.write_bit(1),P(t,e.key,o),P(t,e.value,r)}),t.write_bit(0);return}case"Union":{const o=Re(e),r=Xe(n),i=o.index_by_tag.get(r);if(i===void 0)throw new RangeError(`Unknown union variant: ${r}`);o.tag_bits>0&&t.write_bitsUnsigned(i,o.tag_bits);const a=e.variants[r],c=Ye(n,a);P(t,a,c);return}case"String":{zt(t,n);return}}}function B(t,e){switch(e.$){case"UInt":return D(e.size),t.read_bitsUnsigned(e.size);case"Int":{if(D(e.size),e.size===0)return 0;const n=t.read_bitsUnsigned(e.size);if(typeof n=="bigint"){const r=1n<<BigInt(e.size-1);return n&r?n-(1n<<BigInt(e.size)):n}const o=2**(e.size-1);return n>=o?n-2**e.size:n}case"Nat":{let n=0,o=null;for(;t.read_bit();)o!==null?o+=1n:n===Number.MAX_SAFE_INTEGER?o=BigInt(n)+1n:n++;return o??n}case"Tuple":{const n=new Array(e.fields.length);for(let o=0;o<e.fields.length;o++)n[o]=B(t,e.fields[o]);return n}case"Vector":{const n=new Array(e.size);for(let o=0;o<e.size;o++)n[o]=B(t,e.type);return n}case"Struct":{const n={},o=Te(e.fields);for(let r=0;r<o.length;r++){const i=o[r];n[i]=B(t,e.fields[i])}return n}case"List":{const n=[];for(;t.read_bit();)n.push(B(t,e.type));return n}case"Map":{const n=new Map;for(;t.read_bit();){const o=B(t,e.key),r=B(t,e.value);n.set(o,r)}return n}case"Union":{const n=Re(e);let o=0;n.tag_bits>0&&(o=t.read_bitsUnsigned(n.tag_bits));let r;if(typeof o=="bigint"){if(o>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Union tag index too large");r=Number(o)}else r=o;if(r<0||r>=n.keys.length)throw new RangeError("Union tag index out of range");const i=n.keys[r],a=e.variants[i],c=B(t,a);return a.$==="Struct"&&c&&typeof c=="object"?(c.$=i,c):{$:i,value:c}}case"String":return jt(t)}}function ae(t,e){if(!Array.isArray(t))throw new TypeError(`${e} value must be an Array`);return t}function Je(t,e){if(t&&typeof t=="object")return t[e];throw new TypeError("Struct value must be an object")}function Re(t){const e=Fe.get(t);if(e)return e;const n=Object.keys(t.variants).sort();if(n.length===0)throw new RangeError("Union must have at least one variant");const o=new Map;for(let a=0;a<n.length;a++)o.set(n[a],a);const r=n.length<=1?0:Math.ceil(Math.log2(n.length)),i={keys:n,index_by_tag:o,tag_bits:r};return Fe.set(t,i),i}function Te(t){const e=Pe.get(t);if(e)return e;const n=Object.keys(t);return Pe.set(t,n),n}function Xe(t){if(!t||typeof t!="object")throw new TypeError("Union value must be an object with a $ tag");const e=t.$;if(typeof e!="string")throw new TypeError("Union value must have a string $ tag");return e}function Ye(t,e){return e.$!=="Struct"&&t&&typeof t=="object"&&Object.prototype.hasOwnProperty.call(t,"value")?t.value:t}function Ze(t,e){if(!Array.isArray(t))throw new TypeError("List value must be an Array");for(let n=0;n<t.length;n++)e(t[n])}function Qe(t,e){if(t!=null){if(t instanceof Map){for(const[n,o]of t)e(n,o);return}if(typeof t=="object"){for(const n of Object.keys(t))e(n,t[n]);return}throw new TypeError("Map value must be a Map or object")}}function Ot(t){if(typeof t!="string")throw new TypeError("String value must be a string");let e=0;for(let n=0;n<t.length;n++){const o=t.charCodeAt(n);if(o<128)e+=1;else if(o<2048)e+=2;else if(o>=55296&&o<=56319){const r=n+1<t.length?t.charCodeAt(n+1):0;r>=56320&&r<=57343?(n++,e+=4):e+=3}else o>=56320&&o<=57343,e+=3}return e}function zt(t,e){if(typeof e!="string")throw new TypeError("String value must be a string");for(let n=0;n<e.length;n++){let o=e.charCodeAt(n);if(o<128){t.write_bit(1),t.write_bitsUnsigned(o,8);continue}if(o<2048){t.write_bit(1),t.write_bitsUnsigned(192|o>>>6,8),t.write_bit(1),t.write_bitsUnsigned(128|o&63,8);continue}if(o>=55296&&o<=56319){const r=n+1<e.length?e.charCodeAt(n+1):0;if(r>=56320&&r<=57343){n++;const i=(o-55296<<10)+(r-56320)+65536;t.write_bit(1),t.write_bitsUnsigned(240|i>>>18,8),t.write_bit(1),t.write_bitsUnsigned(128|i>>>12&63,8),t.write_bit(1),t.write_bitsUnsigned(128|i>>>6&63,8),t.write_bit(1),t.write_bitsUnsigned(128|i&63,8);continue}o=65533}else o>=56320&&o<=57343&&(o=65533);t.write_bit(1),t.write_bitsUnsigned(224|o>>>12,8),t.write_bit(1),t.write_bitsUnsigned(128|o>>>6&63,8),t.write_bit(1),t.write_bitsUnsigned(128|o&63,8)}t.write_bit(0)}function jt(t){let e=new Uint8Array(16),n=0;for(;t.read_bit();){const o=t.read_bitsUnsigned(8);if(n===e.length){const r=new Uint8Array(e.length*2);r.set(e),e=r}e[n++]=o}return Mt.decode(e.subarray(0,n))}function et(t,e){const n=F(t,e),o=new Uint8Array(n+7>>>3),r=new Et(o);return P(r,t,e),o}function tt(t,e){const n=new At(e);return B(n,t)}var Y=53,Be={$:"List",type:{$:"UInt",size:8}},nt={$:"Union",variants:{get_time:{$:"Struct",fields:{}},info_time:{$:"Struct",fields:{time:{$:"UInt",size:Y}}},post:{$:"Struct",fields:{room:{$:"String"},time:{$:"UInt",size:Y},name:{$:"String"},payload:Be}},info_post:{$:"Struct",fields:{room:{$:"String"},index:{$:"UInt",size:32},server_time:{$:"UInt",size:Y},client_time:{$:"UInt",size:Y},name:{$:"String"},payload:Be}},load:{$:"Struct",fields:{room:{$:"String"},from:{$:"UInt",size:32}}},watch:{$:"Struct",fields:{room:{$:"String"}}},unwatch:{$:"Struct",fields:{room:{$:"String"}}},get_latest_post_index:{$:"Struct",fields:{room:{$:"String"}}},info_latest_post_index:{$:"Struct",fields:{room:{$:"String"},latest_index:{$:"Int",size:32},server_time:{$:"UInt",size:Y}}}}};function Ve(t){const e=new Array(t.length);for(let n=0;n<t.length;n++)e[n]=t[n];return e}function Ke(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t[n]&255;return e}function Ut(t){switch(t.$){case"post":return{$:"post",room:t.room,time:t.time,name:t.name,payload:Ve(t.payload)};case"info_post":return{$:"info_post",room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,payload:Ve(t.payload)};default:return t}}function Lt(t){switch(t.$){case"post":return{$:"post",room:t.room,time:t.time,name:t.name,payload:Ke(t.payload)};case"info_post":return{$:"info_post",room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,payload:Ke(t.payload)};default:return t}}function V(t){return et(nt,Ut(t))}function Ct(t){const e=tt(nt,t);return Lt(e)}var Me="wss://net.studiovibi.com";function Ft(t){let e=t;try{const n=new URL(t);n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),e=n.toString()}catch{e=t}if(typeof window<"u"&&window.location.protocol==="https:"&&e.startsWith("ws://")){const n=`wss://${e.slice(5)}`;return console.warn(`[VibiNet] Upgrading insecure WebSocket URL "${e}" to "${n}" because the page is HTTPS.`),n}return e}function be(){return Math.floor(Date.now())}function Pt(){return Me}function ot(){const t="_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",e=new Uint8Array(8);if(typeof crypto<"u"&&typeof crypto.getRandomValues=="function")crypto.getRandomValues(e);else for(let r=0;r<8;r++)e[r]=Math.floor(Math.random()*256);let o="";for(let r=0;r<8;r++)o+=t[e[r]%64];return o}function Bt(t){const e={clock_offset:1/0,lowest_ping:1/0,request_sent_at:0,last_ping:1/0},n=new Map,o=new Set,r=[];let i=!1;const a=[];let c=null,u=null,f=0,v=!1,_=null;const d=[],T=Ft(t??Pt());function x(){if(!isFinite(e.clock_offset))throw new Error("server_time() called before initial sync");return Math.floor(be()+e.clock_offset)}function h(){c!==null&&(clearInterval(c),c=null)}function g(){u!==null&&(clearTimeout(u),u=null)}function z(){const A=Math.min(8e3,500*Math.pow(2,f)),S=Math.floor(Math.random()*250);return A+S}function L(){if(!(!_||_.readyState!==WebSocket.OPEN))for(;d.length>0;){if(!_||_.readyState!==WebSocket.OPEN)return;const m=d[0];try{_.send(m),d.shift()}catch{X();return}}}function ne(){!_||_.readyState!==WebSocket.OPEN||(e.request_sent_at=be(),_.send(V({$:"get_time"})))}function oe(m){if(!_||_.readyState!==WebSocket.OPEN)return!1;try{return _.send(m),!0}catch{return!1}}function he(m){oe(m)||X()}function $t(m){d.push(m),X()}function Ce(m,k,A){const S=n.get(m);if(S){if(S.packer!==k)throw new Error(`Packed schema already registered for room: ${m}`);A&&(S.handler=A);return}n.set(m,{handler:A,packer:k})}function Nt(){if(v||u!==null)return;const m=z();u=setTimeout(()=>{u=null,f+=1,X()},m)}function X(){if(v||_&&(_.readyState===WebSocket.OPEN||_.readyState===WebSocket.CONNECTING))return;g();const m=new WebSocket(T);_=m,m.binaryType="arraybuffer",m.addEventListener("open",()=>{if(_===m){f=0,console.log("[WS] Connected"),ne(),h();for(const k of o.values())m.send(V({$:"watch",room:k}));L(),c=setInterval(ne,2e3)}}),m.addEventListener("message",k=>{const A=k.data instanceof ArrayBuffer?new Uint8Array(k.data):new Uint8Array(k.data),S=Ct(A);switch(S.$){case"info_time":{const j=be(),C=j-e.request_sent_at;if(e.last_ping=C,C<e.lowest_ping){const pe=Math.floor((e.request_sent_at+j)/2);e.clock_offset=S.time-pe,e.lowest_ping=C}if(!i){i=!0;for(const pe of a)pe();a.length=0}break}case"info_post":{const j=n.get(S.room);if(j&&j.handler){const C=tt(j.packer,S.payload);j.handler({$:"info_post",room:S.room,index:S.index,server_time:S.server_time,client_time:S.client_time,name:S.name,data:C})}break}case"info_latest_post_index":{for(const j of r)j({room:S.room,latest_index:S.latest_index,server_time:S.server_time});break}}}),m.addEventListener("close",k=>{_===m&&(h(),_=null,!v&&(console.warn(`[WS] Disconnected (code=${k.code}); reconnecting...`),Nt()))}),m.addEventListener("error",()=>{})}return X(),{on_sync:m=>{if(i){m();return}a.push(m)},watch:(m,k,A)=>{Ce(m,k,A),o.add(m),he(V({$:"watch",room:m}))},load:(m,k,A,S)=>{Ce(m,A,S),he(V({$:"load",room:m,from:k}))},get_latest_post_index:m=>{he(V({$:"get_latest_post_index",room:m}))},on_latest_post_index:m=>{r.push(m)},post:(m,k,A)=>{const S=ot(),j=et(A,k),C=V({$:"post",room:m,time:x(),name:S,payload:j});return d.length>0&&L(),oe(C)||$t(C),S},server_time:x,ping:()=>e.last_ping,close:()=>{if(v=!0,g(),h(),_&&_.readyState===WebSocket.OPEN)for(const m of o.values())try{_.send(V({$:"unwatch",room:m}))}catch{break}_&&_.close(),_=null},debug_dump:()=>({ws_url:T,ws_ready_state:_?_.readyState:WebSocket.CLOSED,is_synced:i,reconnect_attempt:f,reconnect_scheduled:u!==null,pending_post_count:d.length,watched_rooms:Array.from(o.values()),room_watchers:Array.from(n.keys()),room_watcher_count:n.size,latest_post_index_listener_count:r.length,sync_listener_count:a.length,time_sync:{clock_offset:e.clock_offset,lowest_ping:e.lowest_ping,request_sent_at:e.request_sent_at,last_ping:e.last_ping}})}}var Se=class{constructor(e){y(this,"room"),y(this,"init"),y(this,"on_tick"),y(this,"on_post"),y(this,"packer"),y(this,"smooth"),y(this,"tick_rate"),y(this,"tolerance"),y(this,"client_api"),y(this,"remote_posts"),y(this,"local_posts"),y(this,"timeline"),y(this,"cache_enabled"),y(this,"snapshot_stride"),y(this,"snapshot_count"),y(this,"snapshots"),y(this,"snapshot_start_tick"),y(this,"initial_time_value"),y(this,"initial_tick_value"),y(this,"no_pending_posts_before_ms"),y(this,"max_contiguous_remote_index"),y(this,"cache_drop_guard_hits"),y(this,"latest_index_poll_interval_id"),y(this,"max_remote_index");const n=(u,f)=>u,o=e.smooth??n,r=e.cache??!0,i=e.snapshot_stride??8,a=e.snapshot_count??256,c=e.client??Bt(e.server);this.room=e.room,this.init=e.initial,this.on_tick=e.on_tick,this.on_post=e.on_post,this.packer=e.packer,this.smooth=o,this.tick_rate=e.tick_rate,this.tolerance=e.tolerance,this.client_api=c,this.remote_posts=new Map,this.local_posts=new Map,this.timeline=new Map,this.cache_enabled=r,this.snapshot_stride=Math.max(1,Math.floor(i)),this.snapshot_count=Math.max(1,Math.floor(a)),this.snapshots=new Map,this.snapshot_start_tick=null,this.initial_time_value=null,this.initial_tick_value=null,this.no_pending_posts_before_ms=null,this.max_contiguous_remote_index=-1,this.cache_drop_guard_hits=0,this.latest_index_poll_interval_id=null,this.max_remote_index=-1,this.client_api.on_latest_post_index&&this.client_api.on_latest_post_index(u=>{this.on_latest_post_index_info(u)}),this.client_api.on_sync(()=>{console.log(`[VIBI] synced; loading+watching room=${this.room}`);const u=f=>{f.name&&this.remove_local_post(f.name),this.add_remote_post(f)};this.client_api.load(this.room,0,this.packer,u),this.client_api.watch(this.room,this.packer,u),this.request_latest_post_index(),this.latest_index_poll_interval_id!==null&&clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=setInterval(()=>{this.request_latest_post_index()},2e3)})}official_time(e){return e.client_time<=e.server_time-this.tolerance?e.server_time-this.tolerance:e.client_time}official_tick(e){return this.time_to_tick(this.official_time(e))}get_bucket(e){let n=this.timeline.get(e);return n||(n={remote:[],local:[]},this.timeline.set(e,n)),n}insert_remote_post(e,n){const o=this.get_bucket(n);o.remote.push(e),o.remote.sort((r,i)=>r.index-i.index)}invalidate_from_tick(e){if(!this.cache_enabled)return;const n=this.snapshot_start_tick;if(n!==null&&e<n||n===null||this.snapshots.size===0)return;const o=this.snapshot_stride,r=n+(this.snapshots.size-1)*o;if(!(e>r)){if(e<=n){this.snapshots.clear();return}for(let i=r;i>=e;i-=o)this.snapshots.delete(i)}}advance_state(e,n,o){let r=e;for(let i=n+1;i<=o;i++)r=this.apply_tick(r,i);return r}prune_before_tick(e){if(!this.cache_enabled)return;const n=this.safe_prune_tick();n!==null&&e>n&&(this.cache_drop_guard_hits+=1,e=n);for(const o of this.timeline.keys())o<e&&this.timeline.delete(o);for(const[o,r]of this.remote_posts.entries())this.official_tick(r)<e&&this.remote_posts.delete(o);for(const[o,r]of this.local_posts.entries())this.official_tick(r)<e&&this.local_posts.delete(o)}tick_ms(){return 1e3/this.tick_rate}cache_window_ticks(){return this.snapshot_stride*Math.max(0,this.snapshot_count-1)}safe_prune_tick(){return this.no_pending_posts_before_ms===null?null:this.time_to_tick(this.no_pending_posts_before_ms)}safe_compute_tick(e){if(!this.cache_enabled)return e;const n=this.safe_prune_tick();if(n===null)return e;const o=n+this.cache_window_ticks();return Math.min(e,o)}advance_no_pending_posts_before_ms(e){const n=Math.max(0,Math.floor(e));(this.no_pending_posts_before_ms===null||n>this.no_pending_posts_before_ms)&&(this.no_pending_posts_before_ms=n)}advance_contiguous_remote_frontier(){for(;;){const e=this.max_contiguous_remote_index+1,n=this.remote_posts.get(e);if(!n)break;this.max_contiguous_remote_index=e,this.advance_no_pending_posts_before_ms(this.official_time(n))}}on_latest_post_index_info(e){if(e.room!==this.room||e.latest_index>this.max_contiguous_remote_index)return;const n=this.tick_ms(),o=e.server_time-this.tolerance-n;this.advance_no_pending_posts_before_ms(o)}request_latest_post_index(){if(this.client_api.get_latest_post_index)try{this.client_api.get_latest_post_index(this.room)}catch{}}ensure_snapshots(e,n){if(!this.cache_enabled)return;this.snapshot_start_tick===null&&(this.snapshot_start_tick=n);let o=this.snapshot_start_tick;if(o===null||e<o)return;const r=this.snapshot_stride,i=o+Math.floor((e-o)/r)*r;let a,c;if(this.snapshots.size===0)a=this.init,c=o-1;else{const v=o+(this.snapshots.size-1)*r;a=this.snapshots.get(v),c=v}let u=c+r;for(this.snapshots.size===0&&(u=o);u<=i;u+=r)a=this.advance_state(a,c,u),this.snapshots.set(u,a),c=u;const f=this.snapshots.size;if(f>this.snapshot_count){const v=f-this.snapshot_count,_=o+v*r;for(let d=o;d<_;d+=r)this.snapshots.delete(d);o=_,this.snapshot_start_tick=o}this.prune_before_tick(o)}add_remote_post(e){const n=this.official_tick(e);if(e.index===0&&this.initial_time_value===null){const r=this.official_time(e);this.initial_time_value=r,this.initial_tick_value=this.time_to_tick(r)}if(this.remote_posts.has(e.index))return;this.cache_enabled&&this.snapshot_start_tick!==null&&n<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.remote_posts.set(e.index,e),e.index>this.max_remote_index&&(this.max_remote_index=e.index),this.advance_contiguous_remote_frontier(),this.insert_remote_post(e,n),this.invalidate_from_tick(n)}add_local_post(e,n){this.local_posts.has(e)&&this.remove_local_post(e);const o=this.official_tick(n);this.cache_enabled&&this.snapshot_start_tick!==null&&o<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.local_posts.set(e,n),this.get_bucket(o).local.push(n),this.invalidate_from_tick(o)}remove_local_post(e){const n=this.local_posts.get(e);if(!n)return;this.local_posts.delete(e);const o=this.official_tick(n),r=this.timeline.get(o);if(r){const i=r.local.indexOf(n);if(i!==-1)r.local.splice(i,1);else{const a=r.local.findIndex(c=>c.name===e);a!==-1&&r.local.splice(a,1)}r.remote.length===0&&r.local.length===0&&this.timeline.delete(o)}this.invalidate_from_tick(o)}apply_tick(e,n){let o=this.on_tick(e);const r=this.timeline.get(n);if(r){for(const i of r.remote)o=this.on_post(i.data,o);for(const i of r.local)o=this.on_post(i.data,o)}return o}compute_state_at_uncached(e,n){let o=this.init;for(let r=e;r<=n;r++)o=this.apply_tick(o,r);return o}post_to_debug_dump(e){return{room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,official_time:this.official_time(e),official_tick:this.official_tick(e),data:e.data}}timeline_tick_bounds(){let e=null,n=null;for(const o of this.timeline.keys())(e===null||o<e)&&(e=o),(n===null||o>n)&&(n=o);return{min:e,max:n}}snapshot_tick_bounds(){let e=null,n=null;for(const o of this.snapshots.keys())(e===null||o<e)&&(e=o),(n===null||o>n)&&(n=o);return{min:e,max:n}}time_to_tick(e){return Math.floor(e*this.tick_rate/1e3)}server_time(){return this.client_api.server_time()}server_tick(){return this.time_to_tick(this.server_time())}post_count(){return this.max_remote_index+1}compute_render_state(){const e=this.server_tick(),n=1e3/this.tick_rate,o=Math.ceil(this.tolerance/n),r=this.client_api.ping(),i=isFinite(r)?Math.ceil(r/2/n):0,a=Math.max(o,i+1),c=Math.max(0,e-a),u=this.compute_state_at(c),f=this.compute_state_at(e);return this.smooth(u,f)}initial_time(){if(this.initial_time_value!==null)return this.initial_time_value;const e=this.remote_posts.get(0);if(!e)return null;const n=this.official_time(e);return this.initial_time_value=n,this.initial_tick_value=this.time_to_tick(n),n}initial_tick(){if(this.initial_tick_value!==null)return this.initial_tick_value;const e=this.initial_time();return e===null?null:(this.initial_tick_value=this.time_to_tick(e),this.initial_tick_value)}compute_state_at(e){e=this.safe_compute_tick(e);const n=this.initial_tick();if(n===null)return this.init;if(e<n)return this.init;if(!this.cache_enabled)return this.compute_state_at_uncached(n,e);this.ensure_snapshots(e,n);const o=this.snapshot_start_tick;if(o===null||this.snapshots.size===0)return this.init;if(e<o)return this.snapshots.get(o)??this.init;const r=this.snapshot_stride,i=o+(this.snapshots.size-1)*r,a=Math.floor((i-o)/r),c=Math.floor((e-o)/r),u=Math.min(c,a),f=o+u*r,v=this.snapshots.get(f)??this.init;return this.advance_state(v,f,e)}debug_dump(){const e=Array.from(this.remote_posts.values()).sort((h,g)=>h.index-g.index).map(h=>this.post_to_debug_dump(h)),n=Array.from(this.local_posts.values()).sort((h,g)=>{const z=this.official_tick(h),L=this.official_tick(g);if(z!==L)return z-L;const ne=h.name??"",oe=g.name??"";return ne.localeCompare(oe)}).map(h=>this.post_to_debug_dump(h)),o=Array.from(this.timeline.entries()).sort((h,g)=>h[0]-g[0]).map(([h,g])=>({tick:h,remote_count:g.remote.length,local_count:g.local.length,remote_posts:g.remote.map(z=>this.post_to_debug_dump(z)),local_posts:g.local.map(z=>this.post_to_debug_dump(z))})),r=Array.from(this.snapshots.entries()).sort((h,g)=>h[0]-g[0]).map(([h,g])=>({tick:h,state:g})),i=this.initial_time(),a=this.initial_tick(),c=this.timeline_tick_bounds(),u=this.snapshot_tick_bounds(),f=a!==null&&c.min!==null&&c.min>a;let v=null,_=null;try{v=this.server_time(),_=this.server_tick()}catch{v=null,_=null}let d=null,T=null;for(const h of this.remote_posts.keys())(d===null||h<d)&&(d=h),(T===null||h>T)&&(T=h);const x=typeof this.client_api.debug_dump=="function"?this.client_api.debug_dump():null;return{room:this.room,tick_rate:this.tick_rate,tolerance:this.tolerance,cache_enabled:this.cache_enabled,snapshot_stride:this.snapshot_stride,snapshot_count:this.snapshot_count,snapshot_start_tick:this.snapshot_start_tick,no_pending_posts_before_ms:this.no_pending_posts_before_ms,max_contiguous_remote_index:this.max_contiguous_remote_index,initial_time:i,initial_tick:a,max_remote_index:this.max_remote_index,post_count:this.post_count(),server_time:v,server_tick:_,ping:this.ping(),history_truncated:f,cache_drop_guard_hits:this.cache_drop_guard_hits,counts:{remote_posts:this.remote_posts.size,local_posts:this.local_posts.size,timeline_ticks:this.timeline.size,snapshots:this.snapshots.size},ranges:{timeline_min_tick:c.min,timeline_max_tick:c.max,snapshot_min_tick:u.min,snapshot_max_tick:u.max,min_remote_index:d,max_remote_index:T},remote_posts:e,local_posts:n,timeline:o,snapshots:r,client_debug:x}}debug_recompute(e){const n=this.initial_tick(),o=this.timeline_tick_bounds(),r=n!==null&&o.min!==null&&o.min>n;let i=e;if(i===void 0)try{i=this.server_tick()}catch{i=void 0}i===void 0&&(i=n??0);const a=this.snapshots.size;this.snapshots.clear(),this.snapshot_start_tick=null;const c=[];if(r&&c.push("Local history before timeline_min_tick was pruned; full room replay may be impossible without reloading posts."),n===null||i<n)return c.push("No replayable post range available at target tick."),{target_tick:i,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:a,history_truncated:r,state:this.init,notes:c};const u=this.compute_state_at_uncached(n,i);return{target_tick:i,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:a,history_truncated:r,state:u,notes:c}}post(e){const n=this.client_api.post(this.room,e,this.packer),o=this.server_time(),r={room:this.room,index:-1,server_time:o,client_time:o,name:n,data:e};this.add_local_post(n,r)}compute_current_state(){return this.compute_state_at(this.server_tick())}on_sync(e){this.client_api.on_sync(e)}ping(){return this.client_api.ping()}close(){this.latest_index_poll_interval_id!==null&&(clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=null),this.client_api.close()}static gen_name(){return ot()}};y(Se,"game",Se);var Vt=Se;const De=220,ge=["#f25f5c","#247ba0","#70c1b3","#f7b267","#8e6c88","#5c80bc","#9bc53d","#f18f01"],Kt=24,He=120,ie=[101,207,311,419,523,631,733,839,947,1051,1153,1259,1361,1471,1579,1681,1789,1891,1993,2099,2203,2309,2411,2521,2621,2729,2833,2939,3041,3149,3253,3359,3461,3571,3677,3779,3881,3989,4091,4201,4303,4409,4513,4621,4723,4831,4933,5039,5147,5251],Dt=[[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[1,4],[4,7],[2,5],[5,8],[3,6],[6,9],[1,5],[5,9],[2,4],[2,6],[4,8],[6,8],[3,5],[5,7]];function b(t){return`room-${t}`}function le(t,e){return`corridor:${t}:${e}`}function rt(t,e){return t<e?[t,e]:[e,t]}function it(t,e){return`${e}-${t.feed.length+1}-${t.round}-${t.currentTurnName??"none"}`}function Ht(t){t.feed.length>He&&(t.feed=t.feed.slice(-He))}function st(t,e){t.feed.push(e),Ht(t)}function E(t,e,n){st(t,{id:it(t,"system"),kind:"system",actorName:e,text:n,createdAt:t.feed.length+1})}function Wt(t,e,n){st(t,{id:it(t,"chat"),kind:"chat",actorName:e,text:n,createdAt:t.feed.length+1})}function at(t){return t.filter(e=>e.seat==="participant"&&e.connected)}function qt(t,e){return t.filter(n=>n.seat==="participant"&&n.connected&&n.name!==e)}function Gt(t,e){const n=`${t.clockTick}:${e}:${Object.keys(t.roster).join("|")}`;let o=2166136261;for(let r=0;r<n.length;r+=1)o^=n.charCodeAt(r),o=Math.imul(o,16777619);return o>>>0}function re(t,e,n,o,r){return t.length===0?null:[...t].sort((a,c)=>{const u=n*(a[e]-c[e]);return u!==0?u:Math.abs(a[r]-o)-Math.abs(c[r]-o)})[0]??null}function Jt(t){const e=new Set,n=[];for(const o of t.values())for(const[r,i]of o){const[a,c]=rt(r,i),u=`${a}:${c}`;e.has(u)||(e.add(u),n.push([a,c]))}return n}function we(t,e){const n=[...t];for(let o=n.length-1;o>0;o-=1){const r=Math.floor(e()*(o+1)),i=n[o];n[o]=n[r],n[r]=i}return n}function lt(t){let e=t>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function Xt(t,e){return e.activeSessionId?t.clockTick-e.lastSeenTick<=Kt:!1}function O(t,e,n){return t.roster[e]?.activeSessionId===n}function Yt(t,e){const n=t.fullState.players[e.name];return{name:e.name,color:n?.color??e.color,joinedAt:n?.joinedAt??e.joinedAt,connected:Xt(t,e),seat:n?.seat??e.seat,role:n?.role??"hen",alive:n?.alive??!1,ready:n?.ready??!1}}function Ee(t){return Object.values(t.roster).sort((e,n)=>e.joinedAt-n.joinedAt).map(e=>Yt(t,e))}function me(t){t.masterName&&t.foxName===t.masterName&&(t.foxName=null);for(const e of Object.values(t.players)){if(e.alive=!1,e.locationRoomId=null,e.seat==="spectator"){e.role="spectator",e.ready=!1,e.hasFullInfo=!0;continue}if(t.masterName===e.name){e.role="master",e.hasFullInfo=!0;continue}e.role=t.foxName===e.name?"fox":"hen",e.hasFullInfo=!1}}function Zt(t){if(t.fullState.phase!=="lobby")return!1;const e=at(Ee(t));return e.length>=2&&e.every(n=>n.ready)}function Qt(t,e){const n=t.fullState.players[e.name];if(n){n.color=e.color,n.joinedAt=e.joinedAt,n.seat=e.seat,e.seat==="spectator"&&(n.role="spectator",n.ready=!1,n.alive=!1,n.locationRoomId=null,n.hasFullInfo=!0);return}t.fullState.players[e.name]={name:e.name,color:e.color,joinedAt:e.joinedAt,seat:e.seat,role:e.seat==="spectator"?"spectator":"hen",alive:!1,locationRoomId:null,hasFullInfo:e.seat==="spectator",ready:!1}}function ct(t,e){const n=fn(e);t.rooms=n.rooms,t.corridors=n.corridors;for(const o of Object.values(t.players))o.locationRoomId=null}function ut(t,e){const n=e?t.players[e]:null;!n||n.seat!=="participant"||n.role==="master"?t.foxName=null:t.foxName=e,t.phase==="lobby"&&me(t)}function dt(t,e,n){const o=I(t),r=Ee(o),i=qt(r,o.fullState.masterName);if(i.length<2||i.length>8)return t;const a=Object.keys(o.fullState.rooms);if(a.length===0)return t;const c=lt(e),u=[...i].sort((d,T)=>d.joinedAt-T.joinedAt),f=o.fullState.foxName&&u.some(d=>d.name===o.fullState.foxName)?o.fullState.foxName:u[Math.floor(c()*u.length)]?.name??null;if(!f)return t;const v=we(a,c),_=u.filter(d=>d.name!==f).map(d=>d.name);for(const d of Object.values(o.fullState.players)){if(d.seat==="spectator"){d.role="spectator",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!0,d.ready=!1;continue}if(d.name===o.fullState.masterName){d.role="master",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!0,d.ready=!1;continue}const T=u.findIndex(x=>x.name===d.name);if(T===-1){d.role="hen",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!1,d.ready=!1;continue}d.role=d.name===f?"fox":"hen",d.alive=!0,d.locationRoomId=v[T%v.length]??a[0]??null,d.hasFullInfo=!1,d.ready=!1}return o.fullState.phase="running",o.fullState.winner=null,o.fullState.round=1,o.fullState.currentTurnName=_[0]??f,o.fullState.henOrder=_,o.fullState.pendingKillTargets=[],o.fullState.foxName=f,E(o.fullState,null,n),o}function en(t,e,n){const o=I(t);o.fullState.phase="lobby",o.fullState.winner=null,o.fullState.round=0,o.fullState.currentTurnName=null,o.fullState.henOrder=[],o.fullState.pendingKillTargets=[],o.fullState.foxName=null;for(const r of Object.values(o.fullState.players))r.alive=!1,r.locationRoomId=null,r.ready=!1,r.seat==="spectator"?(r.role="spectator",r.hasFullInfo=!0):o.fullState.masterName===r.name?(r.role="master",r.hasFullInfo=!0):(r.role="hen",r.hasFullInfo=!1);return E(o.fullState,e,n),o}function tn(t,e){return e?Object.values(t.players).filter(n=>n.role==="hen"&&n.alive&&n.locationRoomId===e).map(n=>n.name):[]}function We(t){return Math.max(1,t.henOrder.length)*10}function ft(t,e,n){return t.phase="game_over",t.winner=e,t.currentTurnName=null,t.pendingKillTargets=[],E(t,t.foxName,n),t}function se(t){const n=[...t.henOrder.filter(i=>t.players[i]?.alive),...t.foxName&&t.players[t.foxName]?.alive?[t.foxName]:[]];if(n.length===0)return t.phase="game_over",t.winner=null,t.currentTurnName=null,E(t,null,"Partida encerrada."),t;const o=t.currentTurnName?n.indexOf(t.currentTurnName):-1,r=o+1;if(o===-1||r>=n.length){if(t.round=Math.max(1,t.round)+(o===-1?0:1),t.round>We(t))return ft(t,"hens",`As galinhas sobreviveram por mais de ${We(t)} rodadas e venceram.`);t.currentTurnName=n[0]??null}else t.currentTurnName=n[r]??null;return t.pendingKillTargets=[],t}function mt(t,e){const n=t.players[e];return n?(n.alive=!1,n.hasFullInfo=!0,t.pendingKillTargets=[],E(t,t.foxName,`${e} foi capturada.`),Object.values(t.players).some(r=>r.role==="hen"&&r.alive)?se(t):ft(t,"fox","A raposa eliminou todas as galinhas e venceu a partida.")):t}function _t(t,e,n){return e===n?!0:t.fullState.masterName===e}function I(t){return JSON.parse(JSON.stringify(t))}function nn(t){return t.trim().replace(/\s+/g," ").slice(0,24)}function on(t){return t.trim().replace(/\s+/g,"-").slice(0,36).toLowerCase()}function rn(t){return JSON.stringify(t)}function sn(){return ie.length}function an(){return ie[Math.floor(Math.random()*ie.length)]??ie[0]}function ln(t,e){const n=t.filter(o=>o.seat==="participant"&&o.connected&&o.name!==e);return n.length===0?null:n[Math.floor(Math.random()*n.length)]?.name??null}function ce(t,e){const n=Math.atan2(e.y-t.y,e.x-t.x);return Math.round((n*180/Math.PI+360)%360)}function ht(t,e,n,o="normal"){return{id:t,x:e,y:n,type:o}}function ue(t,e){return{id:le(t.id,e.id),fromRoomId:t.id,toRoomId:e.id,angleFrom:ce(t,e),angleTo:ce(e,t)}}function Ae(){const t={},e={};for(let o=0;o<3;o+=1)for(let r=0;r<3;r+=1){const i=o*3+r+1,a=b(i);t[a]=ht(a,180+r*De,160+o*De)}const n=[[b(1),b(2)],[b(2),b(3)],[b(4),b(5)],[b(5),b(6)],[b(7),b(8)],[b(8),b(9)],[b(1),b(4)],[b(4),b(7)],[b(2),b(5)],[b(5),b(8)],[b(3),b(6)],[b(6),b(9)],[b(1),b(5)],[b(5),b(9)]];for(const[o,r]of n){const i=ue(t[o],t[r]);e[i.id]=i}return{rooms:t,corridors:e}}function cn(t=null){const{rooms:e,corridors:n}=Ae();return{phase:"lobby",masterName:t,foxName:null,winner:null,round:0,currentTurnName:null,players:{},rooms:e,corridors:n,henOrder:[],pendingKillTargets:[],feed:[]}}function Oe(t,e){const n=I(t);switch(e.type){case"add_room":{const o=Object.keys(n.rooms).map(i=>Number(i.split("-")[1]??0)),r=b((Math.max(0,...o)||0)+1);return n.rooms[r]=ht(r,320,320,"normal"),n}case"set_default_map":{const o=Ae();n.rooms=o.rooms,n.corridors=o.corridors;for(const r of Object.values(n.players))r.locationRoomId=null;return n}case"set_random_map":return ct(n,e.seed),n;case"toggle_corridor":{const[o,r]=rt(e.leftRoomId,e.rightRoomId),i=le(o,r);if(n.corridors[i])return delete n.corridors[i],n;const a=n.rooms[e.leftRoomId],c=n.rooms[e.rightRoomId];return!a||!c?t:(n.corridors[i]=ue(a,c),n)}case"cycle_room_type":{const o=n.rooms[e.roomId];return o?(o.type=o.type==="normal"?"shop":"normal",n):t}case"remove_room":{delete n.rooms[e.roomId];for(const o of Object.keys(n.corridors)){const r=n.corridors[o];(r.fromRoomId===e.roomId||r.toRoomId===e.roomId)&&delete n.corridors[o]}for(const o of Object.values(n.players))o.locationRoomId===e.roomId&&(o.locationRoomId=null);return n}case"toggle_loop":{const o=le(e.roomId,e.roomId);return n.corridors[o]?(delete n.corridors[o],n):(n.corridors[o]={id:o,fromRoomId:e.roomId,toRoomId:e.roomId,angleFrom:0,angleTo:0},n)}case"move_room":{const o=n.rooms[e.roomId];if(!o)return t;o.x=e.x,o.y=e.y;for(const r of Object.values(n.corridors))if(r.fromRoomId===e.roomId||r.toRoomId===e.roomId){const i=n.rooms[r.fromRoomId],a=n.rooms[r.toRoomId];if(!i||!a)continue;r.angleFrom=ce(i,a),r.angleTo=ce(a,i)}return n}default:return n}}function un(t){const e=Object.values(t);if(e.length<2)return[];const n=e.reduce((f,v)=>f+v.x,0)/e.length,o=e.reduce((f,v)=>f+v.y,0)/e.length,r=re(e,"x",1,o,"y"),i=re(e,"x",-1,o,"y"),a=re(e,"y",1,n,"x"),c=re(e,"y",-1,n,"x"),u=[];return r&&i&&r.id!==i.id&&u.push([r.id,i.id]),a&&c&&a.id!==c.id&&u.push([a.id,c.id]),u}function dn(t){const e=new Map,n=[...Dt.map(([o,r])=>[b(o),b(r)]),...un(t)];for(const[o,r]of n)e.set(o,[...e.get(o)??[],[o,r]]),e.set(r,[...e.get(r)??[],[r,o]]);return e}function fn(t){const e=lt(t),n=Ae().rooms,o={},r=Object.keys(n).sort(),i=new Set,a=[],c=dn(n),u=b(1+Math.floor(e()*r.length));for(i.add(u),a.push(...c.get(u)??[]);i.size<r.length&&a.length>0;){const x=Math.floor(e()*a.length),[h,g]=a.splice(x,1)[0]??[];if(!h||!g||i.has(g))continue;i.add(g);const z=ue(n[h],n[g]);o[z.id]=z;for(const L of c.get(g)??[])i.has(L[1])||a.push(L)}const f=we(Jt(c),e),v=3+Math.floor(e()*5);for(const[x,h]of f){if(Object.keys(o).length>=r.length-1+v)break;const g=ue(n[x],n[h]);o[g.id]=g}const _=1+Math.floor(e()*3),d=we(r,e);for(let x=0;x<_;x+=1){const h=d[x];h&&(n[h].type="shop")}const T=Math.floor(e()*2);for(let x=0;x<T;x+=1){const h=d[_+x];if(!h)continue;const g=le(h,h);o[g]={id:g,fromRoomId:h,toRoomId:h,angleFrom:0,angleTo:0}}return{rooms:n,corridors:o}}function mn(){return{roster:{},fullState:cn(),clockTick:0,nextJoinOrder:0}}function _n(t){return{...t,clockTick:t.clockTick+1}}function hn(t,e){const n=I(t),o=n.roster[e.name];if(o)return o.activeSessionId=e.sessionId,o.lastSeenTick=n.clockTick,n;const r=n.nextJoinOrder+1,i=n.fullState.phase==="lobby"?"participant":"spectator",a={name:e.name,color:ge[n.nextJoinOrder%ge.length]??ge[0],joinedAt:r,seat:i,activeSessionId:e.sessionId,lastSeenTick:n.clockTick};return n.nextJoinOrder+=1,n.roster[a.name]=a,Qt(n,a),n.fullState.phase==="lobby"?me(n.fullState):E(n.fullState,e.name,`${e.name} entrou como espectador.`),n}function pn(t,e){if(!O(t,e.name,e.sessionId))return t;const n=I(t),o=n.roster[e.name];return o?(o.lastSeenTick=n.clockTick,n):t}function bn(t,e){if(t.fullState.phase!=="lobby"||t.fullState.masterName||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return o.fullState.masterName=e.name,me(o.fullState),E(o.fullState,e.name,`${e.name} virou mestre.`),o}function gn(t,e){if(t.fullState.phase!=="lobby"||t.fullState.masterName!==e.name||!O(t,e.name,e.sessionId))return t;const n=I(t);return n.fullState.masterName=null,me(n.fullState),E(n.fullState,e.name,`${e.name} deixou de ser mestre.`),n}function yn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return o.fullState.players[e.name].ready=!o.fullState.players[e.name].ready,E(o.fullState,e.name,o.fullState.players[e.name].ready?`${e.name} ficou ready.`:`${e.name} removeu o ready.`),Zt(o)?dt(o,Gt(o,e.name),"Todos ficaram ready. Partida iniciada."):o}function vn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return ct(o.fullState,e.seed),E(o.fullState,e.name,`${e.name} aplicou um mapa aleatorio.`),o}function Sn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return ut(o.fullState,e.foxName),o.fullState.foxName?E(o.fullState,e.name,`${o.fullState.foxName} virou a raposa.`):E(o.fullState,e.name,"A raposa foi removida."),o}function wn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant"||n.role==="master")return t;const o=I(t),r=o.fullState.foxName===e.name?null:e.name;return ut(o.fullState,r),E(o.fullState,e.name,r?`${e.name} virou a raposa.`:`${e.name} deixou de ser raposa.`),o}function xn(t,e){return t.fullState.phase!=="lobby"||t.fullState.masterName!==e.name||!O(t,e.name,e.sessionId)?t:dt(t,e.seed,`${e.name} iniciou a partida.`)}function In(t,e){if(!O(t,e.name,e.sessionId))return t;const n=e.text.trim().slice(0,280);if(!n)return t;const o=I(t);return Wt(o.fullState,e.name,n),o}function kn(t,e){if(t.fullState.phase!=="lobby"||t.fullState.masterName!==e.name||!O(t,e.name,e.sessionId))return t;const n=I(t);return n.fullState=Oe(n.fullState,e.action),E(n.fullState,e.name,"Mapa atualizado pelo mestre."),n}function $n(t,e){return t.fullState.phase!=="running"||!O(t,e.name,e.sessionId)||!_t(t,e.name,e.actorName)?t:zn(t,e.actorName,e.corridorId)}function Nn(t,e){return t.fullState.phase!=="running"||!O(t,e.name,e.sessionId)||!_t(t,e.name,e.actorName)?t:jn(t,e.actorName,e.targetName)}function Rn(t,e){return t.fullState.phase!=="game_over"||!O(t,e.name,e.sessionId)?t:en(t,e.name,`${e.name} voltou a sala para o lobby.`)}function Tn(t,e){let n;try{n=JSON.parse(t)}catch{return e}switch(n.$){case"join_room":return hn(e,n);case"heartbeat":return pn(e,n);case"claim_master":return bn(e,n);case"unclaim_master":return gn(e,n);case"toggle_ready":return yn(e,n);case"set_random_map":return vn(e,n);case"set_random_fox":return Sn(e,n);case"toggle_self_fox":return wn(e,n);case"start_game":return xn(e,n);case"lobby_chat_message":return In(e,n);case"map_edit":return kn(e,n);case"submit_move":return $n(e,n);case"select_kill_target":return Nn(e,n);case"return_to_lobby":return Rn(e,n);default:return e}}function Mn(t,e){const n=at(t),o=t.filter(r=>r.seat==="participant").length;return{readyCount:n.filter(r=>r.ready).length,connectedParticipantCount:n.length,totalParticipantCount:o,allConnectedReady:n.length>=2&&n.every(r=>r.ready),foxName:e.foxName}}function En(t,e,n){const o=Ee(n);return{room:t,selfName:e,phase:n.fullState.phase,masterName:n.fullState.masterName,players:o,lobbyState:n.fullState.phase==="lobby"?Mn(o,n.fullState):null,publicState:n.fullState.phase==="lobby"?null:An(n.fullState,o),fullState:I(n.fullState),feed:[...n.fullState.feed]}}function An(t,e){const n={},o=Object.values(t.players).filter(r=>r.role==="hen"||r.role==="fox").sort((r,i)=>r.joinedAt-i.joinedAt).map(r=>r.name);for(const r of o){const i=t.players[r],a=i.locationRoomId,c=a?t.rooms[a]:null,u=a?Object.values(t.players).filter(f=>f.locationRoomId===a&&f.alive).map(f=>{const v=e.find(_=>_.name===f.name);return{name:f.name,color:f.color,role:f.role,alive:f.alive,connected:v?.connected??!1}}):[];n[r]={name:r,roomId:a,roomType:c?.type??null,playersHere:u,exits:a?On(t,a):[],alive:i.alive,connected:e.find(f=>f.name===r)?.connected??!1,canAct:t.currentTurnName===r}}return{phase:t.phase,round:t.round,currentTurnName:t.currentTurnName,screens:n,watchOrder:o,pendingKillTargets:[...t.pendingKillTargets]}}function On(t,e){return Object.values(t.corridors).flatMap(n=>n.fromRoomId===e&&n.toRoomId===e?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!0}]:n.fromRoomId===e?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!1}]:n.toRoomId===e?[{corridorId:n.id,angle:n.angleTo,leadsToSelf:!1}]:[]).sort((n,o)=>n.angle-o.angle)}function zn(t,e,n){if(t.fullState.phase!=="running"||t.fullState.currentTurnName!==e||t.fullState.pendingKillTargets.length>0)return t;const o=I(t),r=o.fullState.players[e];if(!r||!r.alive)return t;if(n===null)return o.fullState=se(o.fullState),o;const i=o.fullState.corridors[n];if(!i||!r.locationRoomId)return t;if(i.fromRoomId===r.locationRoomId&&i.toRoomId===r.locationRoomId)r.locationRoomId=i.toRoomId;else if(i.fromRoomId===r.locationRoomId)r.locationRoomId=i.toRoomId;else if(i.toRoomId===r.locationRoomId)r.locationRoomId=i.fromRoomId;else return t;if(r.role==="fox"){const a=tn(o.fullState,r.locationRoomId);return a.length===0?(o.fullState=se(o.fullState),o):a.length===1?(o.fullState=mt(o.fullState,a[0]??""),o):(o.fullState.pendingKillTargets=a,o)}return o.fullState=se(o.fullState),o}function jn(t,e,n){if(t.fullState.phase!=="running"||t.fullState.currentTurnName!==e||t.fullState.pendingKillTargets.length===0||!t.fullState.pendingKillTargets.includes(n))return t;const o=I(t);return o.fullState=mt(o.fullState,n),o}const pt="vibi-maze-name",bt="vibi-maze-room",gt="vibi-maze-session",ee=900,te=660,Un=200,Ln=2500,Cn=4200,Fn=1800,Pn={$:"String"},xe=new URLSearchParams(window.location.search),l={roomInput:xe.get("room")??window.localStorage.getItem(bt)??"galinheiro-1",nameInput:xe.get("name")??window.localStorage.getItem(pt)??"",chatInput:"",followTurn:!0,watchName:null,revealFullMap:!1,selectedRoomId:null,connectSourceRoomId:null,dragRoomId:null,editorOpen:!1,turnNotice:"",toast:""};let U=null,de="idle",Ie=null,ke=null,R=qn(),W=null,q=null,G=null,Q=null,$e=null,s=null,Ne="",ye="",$=null;const yt=document.querySelector("#app");if(!yt)throw new Error("Elemento #app nao encontrado.");const J=yt;J.addEventListener("submit",t=>{const e=t.target;if(e instanceof HTMLFormElement){if(e.dataset.form==="join"){t.preventDefault(),Bn();return}e.dataset.form==="chat"&&(t.preventDefault(),ho())}});J.addEventListener("input",t=>{const e=t.target;(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&(e.name==="room"&&(l.roomInput=e.value),e.name==="name"&&(l.nameInput=e.value),e.name==="chat"&&(l.chatInput=e.value))});J.addEventListener("click",async t=>{const e=t.target;if(!(e instanceof HTMLElement))return;const n=e.closest("[data-action]");if(!n)return;const o=n.dataset.action;if(o)switch(o){case"claim-master":if(!s)return;M(N()?{$:"unclaim_master",name:s.selfName,sessionId:R}:{$:"claim_master",name:s.selfName,sessionId:R});break;case"toggle-ready":if(!s)return;M({$:"toggle_ready",name:s.selfName,sessionId:R});break;case"copy-link":await wo();break;case"toggle-follow-turn":l.followTurn=!l.followTurn,l.followTurn&&(l.watchName=s?.publicState?.currentTurnName??s?.selfName??null),w();break;case"watch-screen":l.watchName=n.dataset.name??s?.selfName??null,l.followTurn=!1,w();break;case"reveal-full-map":l.revealFullMap=!0,w();break;case"random-map":if(!s)return;M({$:"set_random_map",name:s.selfName,sessionId:R,seed:an()}),H(`Mapa aleatorio aplicado. Biblioteca: ${sn()} mapas.`);break;case"shuffle-fox":if(!s)return;M({$:"set_random_fox",name:s.selfName,sessionId:R,foxName:ln(s.players,s.masterName)});break;case"toggle-self-fox":if(!s)return;M({$:"toggle_self_fox",name:s.selfName,sessionId:R});break;case"start-game":if(!s)return;M({$:"start_game",name:s.selfName,sessionId:R,seed:Gn()});break;case"back-to-lobby":if(!s)return;M({$:"return_to_lobby",name:s.selfName,sessionId:R});break;case"open-editor":wt();break;case"close-modal":xt();break;case"editor-add-room":K({type:"add_room"});break;case"editor-default":K({type:"set_default_map"});break;case"editor-connect":l.connectSourceRoomId=l.selectedRoomId,w();break;case"editor-cycle-type":if(!l.selectedRoomId)return;K({type:"cycle_room_type",roomId:l.selectedRoomId});break;case"editor-remove-room":if(!l.selectedRoomId)return;{const r=l.selectedRoomId;l.selectedRoomId=null,l.connectSourceRoomId=null,K({type:"remove_room",roomId:r})}break;case"editor-loop":if(!l.selectedRoomId)return;K({type:"toggle_loop",roomId:l.selectedRoomId});break;case"submit-pass":qe(null);break;case"submit-move":qe(n.dataset.corridorId??null);break;case"kill-target":po(n.dataset.targetName??"");break}});window.addEventListener("keydown",t=>{const e=t.target,n=e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement||e instanceof HTMLSelectElement;if(t.key==="Escape"){if(l.editorOpen){xt();return}s&&(l.watchName=s.selfName,l.followTurn=!1,w());return}!n&&t.key.toLowerCase()==="m"&&s?.phase==="lobby"&&N()&&(t.preventDefault(),wt())});w();function Bn(){const t=on(l.roomInput),e=nn(l.nameInput);if(!t||!e){H("Informe room e nome.");return}l.roomInput=t,l.nameInput=e,window.localStorage.setItem(bt,t),window.localStorage.setItem(pt,e),Ie=t,ke=e,R=St(),Hn(),s=null,Ne="",$e=null,$=null,ze(),fe(),l.watchName=null,l.revealFullMap=!1,l.editorOpen=!1,l.selectedRoomId=null,l.connectSourceRoomId=null,l.dragRoomId=null,de="connecting";const n={room:t,initial:mn(),on_tick:_n,on_post:Tn,packer:Pn,tick_rate:6,tolerance:300},o=So();o!==Me&&(n.server=o),U=new Vt.game(n),U.on_sync(()=>{de="connected",M({$:"join_room",name:e,sessionId:R}),Dn(),vt(),w()}),w()}function vt(){if(!U||!Ie||!ke)return;$e=U.compute_render_state(),s=En(Ie,ke,$e),Vn();const t=JSON.stringify(s);t!==Ne&&(Ne=t,w())}function Vn(){if(!s)return;Kn();const t=_e();t&&t.seat==="spectator"&&s.phase!=="lobby"&&(l.revealFullMap=!0),s.phase==="lobby"&&(l.revealFullMap=!1),s.phase!=="lobby"?l.followTurn?l.watchName=s.publicState?.currentTurnName??s.selfName:l.watchName||(l.watchName=s.selfName):l.watchName=s.selfName,l.editorOpen&&s.phase==="lobby"&&!l.dragRoomId&&($=I(s.fullState)),s.phase!=="lobby"&&(l.editorOpen=!1,$=null),s.phase==="game_over"?Wn():ze()}function Kn(){if(!s||s.phase!=="running"){ye="",l.turnNotice="",fe();return}const t=s.publicState?.currentTurnName;if(!t)return;const e=`${s.phase}:${s.publicState?.round??0}:${t}`;e!==ye&&(ye=e,l.turnNotice=`Turno de ${t}`,fe(),Q=window.setTimeout(()=>{l.turnNotice="",Q=null,w()},Fn))}function M(t){if(!U){H("Sem conexao com o VibiNet.");return}U.post(rn(t))}function Dn(){W!==null&&window.clearInterval(W),q!==null&&window.clearInterval(q),W=window.setInterval(()=>{vt()},Un),q=window.setInterval(()=>{s&&M({$:"heartbeat",name:s.selfName,sessionId:R})},Ln)}function Hn(){W!==null&&(window.clearInterval(W),W=null),q!==null&&(window.clearInterval(q),q=null),U?.close(),U=null,de="closed",ze(),fe()}function Wn(){G!==null||!s||(G=window.setTimeout(()=>{G=null,!(!s||s.phase!=="game_over")&&M({$:"return_to_lobby",name:s.selfName,sessionId:R})},Cn))}function ze(){G!==null&&(window.clearTimeout(G),G=null)}function fe(){Q!==null&&(window.clearTimeout(Q),Q=null)}function qn(){const t=window.sessionStorage.getItem(gt);return t||St()}function St(){const t=typeof crypto.randomUUID=="function"?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;return window.sessionStorage.setItem(gt,t),t}function Gn(){return Math.floor(Math.random()*4294967295)}function w(){if(!s){J.innerHTML=Jn();return}J.innerHTML=`
    <main class="app-shell phase-${s.phase}">
      ${Zn()}
      <section class="main-column">
        ${s.phase==="lobby"?"":Xn()}
        ${s.phase==="lobby"?eo():to()}
      </section>
      <aside class="right-column">
        ${lo()}
        ${co()}
      </aside>
      ${Yn()}
      ${fo()}
    </main>
  `,_o()}function Jn(){return`
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
            <input name="room" value="${p(l.roomInput)}" maxlength="36" />
          </label>
          <label class="field">
            <span>Nome</span>
            <input name="name" value="${p(l.nameInput)}" maxlength="24" />
          </label>
          <button class="btn btn-primary" type="submit">
            ${de==="connecting"?"Conectando...":"Entrar"}
          </button>
        </form>
        ${l.toast?`<p class="toast">${p(l.toast)}</p>`:""}
      </section>
    </main>
  `}function Xn(){if(!s)return"";const t=s,e=t.lobbyState?`${t.lobbyState.readyCount}/${t.lobbyState.connectedParticipantCount} ready`:`Rodada ${t.publicState?.round??0}`,n=t.publicState?.currentTurnName?t.players.find(o=>o.name===t.publicState?.currentTurnName):null;return`
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${p(kt(t.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">${t.phase==="lobby"?"PRONTOS":"VEZ"}</p>
        <strong style="${n?`color:${n.color}`:""}">
          ${p(t.phase==="lobby"?e:n?.name??"Aguardando")}
        </strong>
      </div>
    </section>
  `}function Yn(){return!l.turnNotice||!s||s.phase!=="running"?"":`
    <div class="turn-notice" aria-live="polite">
      <span>${p(l.turnNotice)}</span>
    </div>
  `}function Zn(){if(!s)return"";const t=_e(),e=l.watchName??s.selfName,n=`${s.lobbyState?.readyCount??0}/${s.lobbyState?.connectedParticipantCount??0} ready`;return`
    <aside class="left-sidebar">
      <section class="panel compact-stack">
        <div class="mini-metric">
          <span>Ping</span>
          <strong>${Math.round(U?.ping?.()??0)} ms</strong>
        </div>
        ${s.phase==="lobby"?`
              <div class="mini-metric">
                <span>Fase</span>
                <strong>${p(kt(s.phase))}</strong>
              </div>
              <div class="mini-metric">
                <span>Prontos</span>
                <strong>${p(n)}</strong>
              </div>
            `:""}
        <button class="btn btn-secondary btn-block" data-action="copy-link" type="button">Copiar link</button>
        ${s.phase==="lobby"?`
              <button
                class="btn ${t?.ready?"btn-danger":"btn-primary"} btn-block"
                data-action="toggle-ready"
                type="button"
                ${t?.seat==="participant"?"":"disabled"}
              >
                ${t?.ready?"Remover ready":"Ready"}
              </button>
            `:`
              <div class="mini-metric">
                <span>Visao</span>
                <strong>${p(e)}</strong>
              </div>
            `}
      </section>
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Pessoas na sala</h2>
          <span class="tag">${s.players.length}</span>
        </div>
        <ul class="roster">
          ${s.players.map(o=>Qn(o,e)).join("")}
        </ul>
      </section>
    </aside>
  `}function Qn(t,e){const n=t.name===s?.selfName,o=t.name===e,r=!!(s?.phase!=="lobby"&&s?.publicState?.screens[t.name]),i=`
    <span class="legend-color" style="background:${t.color}"></span>
    <div class="roster-copy">
      <strong>${p(t.name)}</strong>
      <div class="helper">
        ${p(It(t.role))} • ${t.connected?"online":"offline"}
      </div>
    </div>
    <span class="tag">${t.ready&&s?.phase==="lobby"?"ready":t.alive?"vivo":t.seat==="spectator"?"spec":"fora"}</span>
  `;return r?`
    <li>
      <button
        class="roster-item roster-button ${n?"is-self":""} ${o?"is-active":""}"
        data-action="watch-screen"
        data-name="${p(t.name)}"
        type="button"
      >
        ${i}
      </button>
    </li>
  `:`<li class="roster-item ${n?"is-self":""} ${o?"is-active":""}">${i}</li>`}function eo(){if(!s)return"";const t=N();return`
    <section class="lobby-layout">
      <section class="panel stack spacious">
        <div class="panel-header">
          <div>
            <h2 class="section-title">Lobby da sala</h2>
            <p class="helper">
              ${p(s.room)} • ${s.lobbyState?.readyCount??0}/${s.lobbyState?.connectedParticipantCount??0} ready
            </p>
          </div>
          <span class="tag">${p(s.masterName??"sem mestre")}</span>
        </div>
        <div class="lobby-summary-grid">
          <div class="metric-card">
            <span>Mestre</span>
            <strong>${p(s.masterName??"ninguem")}</strong>
          </div>
          <div class="metric-card">
            <span>Raposa</span>
            <strong>${p(s.fullState.foxName??"nao escolhida")}</strong>
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
          ${N()?"Voce e o mestre. Use o botao ou aperte M para abrir o editor do mapa.":"O mapa fica oculto no lobby para jogadores normais. Aqui voce organiza papeis, ready e conversa antes da partida."}
        </div>
        ${t?`
              <svg class="editor-map readonly" viewBox="0 0 ${ee} ${te}">
                ${je(s.fullState,!1)}
              </svg>
            `:`
              <div class="fog-card">
                <div class="fog-copy">
                  <h3>Mapa oculto</h3>
                  <p class="helper">So o mestre enxerga a pre-visualizacao do labirinto no lobby.</p>
                </div>
              </div>
            `}
      </section>
    </section>
  `}function to(){return`
    <section class="game-layout">
      ${s?.phase==="game_over"?no():""}
      <section class="panel spacious">
        ${go()?oo():io()}
      </section>
    </section>
  `}function no(){if(!s||s.phase!=="game_over")return"";const t=s.fullState.winner,e=t==="fox"?"A raposa venceu":t==="hens"?"As galinhas venceram":"Partida encerrada",n=t==="fox"?"fox":t==="hens"?"hens":"neutral",o=t==="fox"?"Todas as galinhas foram capturadas.":t==="hens"?`O limite de ${s.fullState.henOrder.length*10} rodadas foi ultrapassado.`:"A partida foi encerrada.";return`
    <section class="panel result-panel ${n}">
      <div class="result-copy">
        <p class="eyebrow">Fim da partida</p>
        <h2 class="result-title">${p(e)}</h2>
        <p class="result-text">${p(o)}</p>
        <p class="helper">Voltando para o lobby da sala em instantes.</p>
      </div>
      <button class="btn btn-primary" data-action="back-to-lobby" type="button">Voltar agora</button>
    </section>
  `}function oo(){return s?`
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
      <svg class="editor-map readonly" viewBox="0 0 ${ee} ${te}">
        ${je(s.fullState,!1)}
      </svg>
      ${ro()}
    </section>
  `:'<div class="empty-panel"><h2>Sem mapa completo</h2></div>'}function ro(){return s?`
    <div class="legend-grid">
      ${s.players.map(t=>`
          <div class="legend-chip">
            <span class="legend-color" style="background:${t.color}"></span>
            <strong>${p(t.name)}</strong>
            <span>${p(It(t.role))}</span>
          </div>
        `).join("")}
    </div>
  `:""}function io(){if(!s?.publicState)return'<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';const t=l.watchName??s.selfName,e=s.publicState.screens[t]??null,n=s.fullState.players[s.selfName],o=!!(n&&!n.alive&&n.seat==="participant"&&!l.revealFullMap);if(!e)return`
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${o?'<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
        ${s.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
    `;const i=Ue()===t,a=i&&s.publicState.pendingKillTargets.length===0,c=i&&s.publicState.pendingKillTargets.length>0;return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${p(e.name)}</h2>
          <p class="helper">
            ${p(e.roomType?`Sala ${Le(e.roomType)}`:"Sem posicao visivel")}
          </p>
        </div>
        <div class="button-row tight">
          ${o?'<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
          ${s.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
        </div>
      </div>
      ${ao(e,a)}
      ${c?so(s.publicState.pendingKillTargets):`
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${a?"":"disabled"}>Passar</button>
            </div>
          `}
    </section>
  `}function so(t){return`
    <div class="kill-picker">
      <strong>Raposa escolhe quem cai:</strong>
      <div class="button-row">
        ${t.map(e=>`
            <button class="btn btn-danger" data-action="kill-target" data-target-name="${p(e)}" type="button">
              ${p(e)}
            </button>
          `).join("")}
      </div>
    </div>
  `}function ao(t,e){const n=vo(t.exits);return`
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${p(t.roomType?Le(t.roomType):"Sem sala")}</div>
        ${n.map(o=>`
            <button
              class="exit-btn"
              style="left:${o.left}%;top:${o.top}%;"
              data-action="submit-move"
              data-corridor-id="${p(o.corridorId)}"
              type="button"
              ${e?"":"disabled"}
            >
              <span class="exit-arrow" style="transform:rotate(${o.angle}deg)">➜</span>
              <small>${o.angle}°</small>
            </button>
          `).join("")}
        <div class="stickman-row">
          ${t.playersHere.map(o=>mo(o.name,o.color)).join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${t.playersHere.length||0}</p>
        <p><strong>Saidas:</strong> ${t.exits.map(o=>`${o.angle}°`).join(", ")||"nenhuma"}</p>
      </div>
    </section>
  `}function lo(){if(!s)return"";const t=_e(),e=t?.role==="fox"?"Deixar de ser raposa":"Ser raposa";return s.phase==="lobby"?`
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Acoes do lobby</h2>
          <span class="tag">${s.lobbyState?.allConnectedReady?"auto start":"manual"}</span>
        </div>
        <div class="action-stack">
          <button class="btn ${N()?"btn-danger":"btn-primary"} btn-block" data-action="claim-master" type="button">
            ${N()?"Deixar de ser mestre":"Virar mestre"}
          </button>
          <button class="btn btn-secondary btn-block" data-action="random-map" type="button" ${t?.seat==="participant"?"":"disabled"}>
            Mapa aleatorio
          </button>
          <button class="btn btn-secondary btn-block" data-action="shuffle-fox" type="button" ${t?.seat==="participant"?"":"disabled"}>
            Sortear raposa
          </button>
          <button class="btn btn-secondary btn-block" data-action="toggle-self-fox" type="button" ${t?.seat==="participant"&&!N()?"":"disabled"}>
            ${e}
          </button>
          <div class="action-split">
            <button class="btn btn-secondary btn-block" data-action="open-editor" type="button" ${N()?"":"disabled"}>
              Abrir editor
            </button>
            <button class="btn btn-primary btn-block" data-action="start-game" type="button" ${N()?"":"disabled"}>
              Play
            </button>
          </div>
        </div>
      </section>
    `:`
    <section class="panel stack">
      <div class="panel-header">
        <h2 class="section-title">Partida</h2>
        <span class="tag">${s.publicState?.round??0}</span>
      </div>
      <p class="metric"><strong>Na tela:</strong> ${p(l.watchName??s.selfName)}</p>
      <p class="metric"><strong>Turno:</strong> ${p(s.publicState?.currentTurnName??"Aguardando")}</p>
      <div class="action-stack">
        <button class="btn btn-secondary btn-block" data-action="toggle-follow-turn" type="button">
          ${l.followTurn?"Parar de acompanhar a vez":"Acompanhar a vez"}
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="reveal-full-map"
          type="button"
          ${yo()?"":"disabled"}
        >
          Ficar de espectador
        </button>
        ${s.phase==="game_over"?'<button class="btn btn-primary btn-block" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      ${l.toast?`<p class="toast">${p(l.toast)}</p>`:""}
    </section>
  `}function co(){return s?`
    <section class="panel stack feed-panel">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Chat e log</h2>
          <p class="helper">Mensagens digitadas e avisos do sistema ficam juntos, com estilos diferentes.</p>
        </div>
      </div>
      <div class="feed-list">
        ${s.feed.length>0?s.feed.map(t=>uo(t)).join(""):'<div class="empty-panel feed-empty">Sem mensagens ainda.</div>'}
      </div>
      <form data-form="chat" class="chat-form">
        <textarea
          name="chat"
          rows="3"
          maxlength="280"
          placeholder="Digite algo para a sala..."
        >${p(l.chatInput)}</textarea>
        <button class="btn btn-primary btn-block" type="submit">Enviar</button>
      </form>
    </section>
  `:""}function uo(t){const e=t.kind==="chat"&&t.actorName&&t.actorName===s?.selfName;return t.kind==="system"?`
      <article class="feed-entry system">
        <p class="feed-line"><strong>sistema</strong> - ${p(t.text)}</p>
      </article>
    `:`
    <article class="feed-entry chat ${e?"is-self":""}">
      <p class="feed-line"><strong>${p(t.actorName??"anon")}</strong> - ${p(t.text)}</p>
    </article>
  `}function fo(){if(!l.editorOpen||!$||!s||!N())return"";const t=l.selectedRoomId?$.rooms[l.selectedRoomId]:null;return`
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
        <svg class="editor-map" data-editor-svg viewBox="0 0 ${ee} ${te}">
          ${je($,!0)}
        </svg>
        <div class="editor-toolbar">
          <div class="metric-block">
            <strong>Sala selecionada</strong>
            <span>${p(t?.id??"nenhuma")}</span>
          </div>
          <div class="metric-block">
            <strong>Tipo</strong>
            <span>${p(t?.type??"-")}</span>
          </div>
          <div class="button-row">
            <button class="btn btn-secondary" data-action="editor-connect" type="button" ${t?"":"disabled"}>
              ${l.connectSourceRoomId?"Clique em outra sala":"Conectar"}
            </button>
            <button class="btn btn-secondary" data-action="editor-cycle-type" type="button" ${t?"":"disabled"}>
              Alternar tipo
            </button>
            <button class="btn btn-secondary" data-action="editor-loop" type="button" ${t?"":"disabled"}>
              Loop
            </button>
            <button class="btn btn-danger" data-action="editor-remove-room" type="button" ${t?"":"disabled"}>
              Remover
            </button>
          </div>
        </div>
      </section>
    </div>
  `}function je(t,e){const n=new Map;for(const o of Object.values(t.players))o.locationRoomId&&(n.has(o.locationRoomId)||n.set(o.locationRoomId,[]),n.get(o.locationRoomId)?.push({name:o.name,color:o.color}));return`
    ${Object.values(t.corridors).map(o=>{const r=t.rooms[o.fromRoomId],i=t.rooms[o.toRoomId];return!r||!i?"":r.id===i.id?`
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
    ${Object.values(t.rooms).map(o=>{const r=e&&l.selectedRoomId===o.id,i=e&&l.connectSourceRoomId===o.id,a=n.get(o.id)??[];return`
          <g
            ${e?`data-room-node="${p(o.id)}"`:""}
            class="room-node ${r?"selected":""} ${i?"armed":""}"
            transform="translate(${o.x}, ${o.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${o.type}" />
            <text class="room-title" text-anchor="middle" y="4">${p(o.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${p(Le(o.type))}</text>
            ${a.map((c,u)=>`
                <circle cx="${-18+u*18}" cy="-12" r="6" fill="${c.color}" />
              `).join("")}
          </g>
        `}).join("")}
  `}function mo(t,e){return`
    <div class="stickman">
      <svg viewBox="0 0 64 84" class="stickman-svg" aria-hidden="true">
        <circle cx="32" cy="14" r="10" fill="${e}" />
        <line x1="32" y1="24" x2="32" y2="52" stroke="${e}" stroke-width="6" stroke-linecap="round" />
        <line x1="16" y1="36" x2="48" y2="36" stroke="${e}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="18" y2="74" stroke="${e}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="46" y2="74" stroke="${e}" stroke-width="6" stroke-linecap="round" />
      </svg>
      <span>${p(t)}</span>
    </div>
  `}function _o(){const t=J.querySelector("[data-editor-svg]");if(!t||!l.editorOpen||!$||!s||s.phase!=="lobby"||!N())return;const e=n=>{const o=t.getBoundingClientRect(),r=(n.clientX-o.left)/o.width*ee,i=(n.clientY-o.top)/o.height*te;return{x:Math.max(60,Math.min(ee-60,r)),y:Math.max(60,Math.min(te-60,i))}};t.onpointerdown=n=>{const o=n.target;if(!(o instanceof SVGElement))return;const i=o.closest("[data-room-node]")?.dataset.roomNode;if(i){if(l.connectSourceRoomId&&l.connectSourceRoomId!==i){const a=l.connectSourceRoomId;l.connectSourceRoomId=null,K({type:"toggle_corridor",leftRoomId:a,rightRoomId:i});return}if(l.connectSourceRoomId===i){l.connectSourceRoomId=null,w();return}l.selectedRoomId=i,l.dragRoomId=i,w(),t.setPointerCapture(n.pointerId)}},t.onpointermove=n=>{if(!l.dragRoomId||l.connectSourceRoomId||!$)return;const o=e(n);$=Oe($,{type:"move_room",roomId:l.dragRoomId,x:o.x,y:o.y}),w()},t.onpointerup=()=>{if(!l.dragRoomId||!$)return;const n=$.rooms[l.dragRoomId],o=l.dragRoomId;l.dragRoomId=null,n?K({type:"move_room",roomId:o,x:n.x,y:n.y}):w()}}function wt(){!s||s.phase!=="lobby"||!N()||(l.editorOpen=!0,l.selectedRoomId=null,l.connectSourceRoomId=null,$=I(s.fullState),w())}function xt(){l.editorOpen=!1,l.dragRoomId=null,l.selectedRoomId=null,l.connectSourceRoomId=null,$=null,w()}function K(t,e=!0){!s||s.phase!=="lobby"||!N()||!$||($=Oe($,t),M({$:"map_edit",name:s.selfName,sessionId:R,action:t}),e&&w())}function ho(){if(!s)return;const t=l.chatInput.trim();t&&(M({$:"lobby_chat_message",name:s.selfName,sessionId:R,text:t}),l.chatInput="",w())}function qe(t){if(!s)return;const e=Ue();e&&M({$:"submit_move",name:s.selfName,sessionId:R,actorName:e,corridorId:t})}function po(t){if(!s||!t)return;const e=Ue();e&&M({$:"select_kill_target",name:s.selfName,sessionId:R,actorName:e,targetName:t})}function Ue(){return s?.publicState?.currentTurnName?bo()?s.selfName:N()?s.publicState.currentTurnName:null:null}function bo(){return s?.publicState?.currentTurnName?s.publicState.currentTurnName===s.selfName:!1}function go(){if(!s)return!1;if(N())return!0;const t=s.fullState.players[s.selfName];return _e()?.seat==="spectator"&&s.phase!=="lobby"?!0:!!(t&&!t.alive&&l.revealFullMap)}function yo(){if(!s)return!1;const t=s.fullState.players[s.selfName];return!!(t&&!t.alive&&t.seat==="participant"&&!l.revealFullMap)}function _e(){return s?.players.find(t=>t.name===s?.selfName)??null}function N(){return!!(s&&s.masterName===s.selfName)}function It(t){switch(t){case"master":return"mestre";case"fox":return"raposa";case"hen":return"galinha";case"spectator":return"espectador";default:return"galinha"}}function kt(t){switch(t){case"lobby":return"lobby";case"running":return"partida";case"game_over":return"fim da partida";default:return t}}function Le(t){return t==="shop"?"loja":"normal"}function vo(t){const e=[...t].sort((r,i)=>r.angle-i.angle);let n=-999,o=0;return e.map(r=>{Math.abs(r.angle-n)<18?o+=1:o=0,n=r.angle;const i=r.angle*Math.PI/180,a=40+o*9,c=28+o*7,u=50+Math.cos(i)*a,f=50+Math.sin(i)*c;return{corridorId:r.corridorId,angle:r.angle,left:u,top:f}})}function So(){const t=xe.get("server")??void 0;return t||Me}async function wo(){if(!s)return;const t=new URL(window.location.href);t.searchParams.set("room",s.room);const e=t.toString();try{await navigator.clipboard.writeText(e),H("Link da room copiado.")}catch{H(e)}}function H(t){l.toast=t,w(),window.clearTimeout(H.timer),H.timer=window.setTimeout(()=>{l.toast="",w()},2600)}function p(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
