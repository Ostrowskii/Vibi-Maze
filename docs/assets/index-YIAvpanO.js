(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();var It=Object.defineProperty,kt=(t,e,n)=>e in t?It(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,y=(t,e,n)=>kt(t,typeof e!="symbol"?e+"":e,n),be=53,$t=new TextDecoder,Ue=new WeakMap,Le=new WeakMap,Nt=class{constructor(t){y(this,"buf"),y(this,"bit_pos"),this.buf=t,this.bit_pos=0}write_bit(t){const e=this.bit_pos>>>3,n=this.bit_pos&7;t&&(this.buf[e]|=1<<n),this.bit_pos++}write_bitsUnsigned(t,e){if(e!==0){if(typeof t=="number"){if(e<=32){if((this.bit_pos&7)===0&&(e&7)===0){let r=t>>>0,s=this.bit_pos>>>3;for(let a=0;a<e;a+=8)this.buf[s++]=r&255,r>>>=8;this.bit_pos+=e;return}let o=t>>>0;for(let r=0;r<e;r++)this.write_bit(o&1),o>>>=1;return}this.write_bitsBigint(BigInt(t),e);return}this.write_bitsBigint(t,e)}}write_bitsBigint(t,e){if(e===0)return;if((this.bit_pos&7)===0&&(e&7)===0){let r=t,s=this.bit_pos>>>3;for(let a=0;a<e;a+=8)this.buf[s++]=Number(r&0xffn),r>>=8n;this.bit_pos+=e;return}let o=t;for(let r=0;r<e;r++)this.write_bit((o&1n)===0n?0:1),o>>=1n}},Rt=class{constructor(t){y(this,"buf"),y(this,"bit_pos"),this.buf=t,this.bit_pos=0}read_bit(){const t=this.bit_pos>>>3,e=this.bit_pos&7,n=this.buf[t]>>>e&1;return this.bit_pos++,n}read_bitsUnsigned(t){if(t===0)return 0;if(t<=32){if((this.bit_pos&7)===0&&(t&7)===0){let o=0,r=0,s=this.bit_pos>>>3;for(let a=0;a<t;a+=8)o|=this.buf[s++]<<r,r+=8;return this.bit_pos+=t,o>>>0}let n=0;for(let o=0;o<t;o++)this.read_bit()&&(n|=1<<o);return n>>>0}if(t<=be){let e=0,n=1;for(let o=0;o<t;o++)this.read_bit()&&(e+=n),n*=2;return e}return this.read_bitsBigint(t)}read_bitsBigint(t){if(t===0)return 0n;if((this.bit_pos&7)===0&&(t&7)===0){let r=0n,s=0n,a=this.bit_pos>>>3;for(let c=0;c<t;c+=8)r|=BigInt(this.buf[a++])<<s,s+=8n;return this.bit_pos+=t,r}let n=0n,o=1n;for(let r=0;r<t;r++)this.read_bit()&&(n+=o),o<<=1n;return n}};function Z(t,e){if(!Number.isInteger(t))throw new TypeError(`${e} must be an integer`)}function D(t){if(Z(t,"size"),t<0)throw new RangeError("size must be >= 0")}function He(t,e){if(e!==t)throw new RangeError(`vector size mismatch: expected ${t}, got ${e}`)}function C(t,e){switch(t.$){case"UInt":case"Int":return D(t.size),t.size;case"Nat":{if(typeof e=="bigint"){if(e<0n)throw new RangeError("Nat must be >= 0");if(e>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Nat too large to size");return Number(e)+1}if(Z(e,"Nat"),e<0)throw new RangeError("Nat must be >= 0");return e+1}case"Tuple":{const n=t.fields,o=ie(e,"Tuple");let r=0;for(let s=0;s<n.length;s++)r+=C(n[s],o[s]);return r}case"Vector":{D(t.size);const n=ie(e,"Vector");He(t.size,n.length);let o=0;for(let r=0;r<t.size;r++)o+=C(t.type,n[r]);return o}case"Struct":{let n=0;const o=$e(t.fields);for(let r=0;r<o.length;r++){const s=o[r],a=We(e,s);n+=C(t.fields[s],a)}return n}case"List":{let n=1;return Je(e,o=>{n+=1,n+=C(t.type,o)}),n}case"Map":{let n=1;return Xe(e,(o,r)=>{n+=1,n+=C(t.key,o),n+=C(t.value,r)}),n}case"Union":{const n=ke(t),o=qe(e),r=t.variants[o];if(!r)throw new RangeError(`Unknown union variant: ${o}`);const s=Ge(e,r);return n.tag_bits+C(r,s)}case"String":return 1+Tt(e)*9}}function B(t,e,n){switch(e.$){case"UInt":{if(D(e.size),e.size===0){if(n===0||n===0n)return;throw new RangeError("UInt out of range")}if(typeof n=="bigint"){if(n<0n)throw new RangeError("UInt must be >= 0");const r=1n<<BigInt(e.size);if(n>=r)throw new RangeError("UInt out of range");t.write_bitsUnsigned(n,e.size);return}if(Z(n,"UInt"),n<0)throw new RangeError("UInt must be >= 0");if(e.size>be)throw new RangeError("UInt too large for number; use bigint");const o=2**e.size;if(n>=o)throw new RangeError("UInt out of range");t.write_bitsUnsigned(n,e.size);return}case"Int":{if(D(e.size),e.size===0){if(n===0||n===0n)return;throw new RangeError("Int out of range")}if(typeof n=="bigint"){const a=BigInt(e.size),c=-(1n<<a-1n),u=(1n<<a-1n)-1n;if(n<c||n>u)throw new RangeError("Int out of range");let f=n;n<0n&&(f=(1n<<a)+n),t.write_bitsUnsigned(f,e.size);return}if(Z(n,"Int"),e.size>be)throw new RangeError("Int too large for number; use bigint");const o=-(2**(e.size-1)),r=2**(e.size-1)-1;if(n<o||n>r)throw new RangeError("Int out of range");let s=n;n<0&&(s=2**e.size+n),t.write_bitsUnsigned(s,e.size);return}case"Nat":{if(typeof n=="bigint"){if(n<0n)throw new RangeError("Nat must be >= 0");let o=n;for(;o>0n;)t.write_bit(1),o-=1n;t.write_bit(0);return}if(Z(n,"Nat"),n<0)throw new RangeError("Nat must be >= 0");for(let o=0;o<n;o++)t.write_bit(1);t.write_bit(0);return}case"Tuple":{const o=e.fields,r=ie(n,"Tuple");for(let s=0;s<o.length;s++)B(t,o[s],r[s]);return}case"Vector":{D(e.size);const o=ie(n,"Vector");He(e.size,o.length);for(let r=0;r<e.size;r++)B(t,e.type,o[r]);return}case"Struct":{const o=$e(e.fields);for(let r=0;r<o.length;r++){const s=o[r];B(t,e.fields[s],We(n,s))}return}case"List":{Je(n,o=>{t.write_bit(1),B(t,e.type,o)}),t.write_bit(0);return}case"Map":{Xe(n,(o,r)=>{t.write_bit(1),B(t,e.key,o),B(t,e.value,r)}),t.write_bit(0);return}case"Union":{const o=ke(e),r=qe(n),s=o.index_by_tag.get(r);if(s===void 0)throw new RangeError(`Unknown union variant: ${r}`);o.tag_bits>0&&t.write_bitsUnsigned(s,o.tag_bits);const a=e.variants[r],c=Ge(n,a);B(t,a,c);return}case"String":{Mt(t,n);return}}}function P(t,e){switch(e.$){case"UInt":return D(e.size),t.read_bitsUnsigned(e.size);case"Int":{if(D(e.size),e.size===0)return 0;const n=t.read_bitsUnsigned(e.size);if(typeof n=="bigint"){const r=1n<<BigInt(e.size-1);return n&r?n-(1n<<BigInt(e.size)):n}const o=2**(e.size-1);return n>=o?n-2**e.size:n}case"Nat":{let n=0,o=null;for(;t.read_bit();)o!==null?o+=1n:n===Number.MAX_SAFE_INTEGER?o=BigInt(n)+1n:n++;return o??n}case"Tuple":{const n=new Array(e.fields.length);for(let o=0;o<e.fields.length;o++)n[o]=P(t,e.fields[o]);return n}case"Vector":{const n=new Array(e.size);for(let o=0;o<e.size;o++)n[o]=P(t,e.type);return n}case"Struct":{const n={},o=$e(e.fields);for(let r=0;r<o.length;r++){const s=o[r];n[s]=P(t,e.fields[s])}return n}case"List":{const n=[];for(;t.read_bit();)n.push(P(t,e.type));return n}case"Map":{const n=new Map;for(;t.read_bit();){const o=P(t,e.key),r=P(t,e.value);n.set(o,r)}return n}case"Union":{const n=ke(e);let o=0;n.tag_bits>0&&(o=t.read_bitsUnsigned(n.tag_bits));let r;if(typeof o=="bigint"){if(o>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Union tag index too large");r=Number(o)}else r=o;if(r<0||r>=n.keys.length)throw new RangeError("Union tag index out of range");const s=n.keys[r],a=e.variants[s],c=P(t,a);return a.$==="Struct"&&c&&typeof c=="object"?(c.$=s,c):{$:s,value:c}}case"String":return Et(t)}}function ie(t,e){if(!Array.isArray(t))throw new TypeError(`${e} value must be an Array`);return t}function We(t,e){if(t&&typeof t=="object")return t[e];throw new TypeError("Struct value must be an object")}function ke(t){const e=Ue.get(t);if(e)return e;const n=Object.keys(t.variants).sort();if(n.length===0)throw new RangeError("Union must have at least one variant");const o=new Map;for(let a=0;a<n.length;a++)o.set(n[a],a);const r=n.length<=1?0:Math.ceil(Math.log2(n.length)),s={keys:n,index_by_tag:o,tag_bits:r};return Ue.set(t,s),s}function $e(t){const e=Le.get(t);if(e)return e;const n=Object.keys(t);return Le.set(t,n),n}function qe(t){if(!t||typeof t!="object")throw new TypeError("Union value must be an object with a $ tag");const e=t.$;if(typeof e!="string")throw new TypeError("Union value must have a string $ tag");return e}function Ge(t,e){return e.$!=="Struct"&&t&&typeof t=="object"&&Object.prototype.hasOwnProperty.call(t,"value")?t.value:t}function Je(t,e){if(!Array.isArray(t))throw new TypeError("List value must be an Array");for(let n=0;n<t.length;n++)e(t[n])}function Xe(t,e){if(t!=null){if(t instanceof Map){for(const[n,o]of t)e(n,o);return}if(typeof t=="object"){for(const n of Object.keys(t))e(n,t[n]);return}throw new TypeError("Map value must be a Map or object")}}function Tt(t){if(typeof t!="string")throw new TypeError("String value must be a string");let e=0;for(let n=0;n<t.length;n++){const o=t.charCodeAt(n);if(o<128)e+=1;else if(o<2048)e+=2;else if(o>=55296&&o<=56319){const r=n+1<t.length?t.charCodeAt(n+1):0;r>=56320&&r<=57343?(n++,e+=4):e+=3}else o>=56320&&o<=57343,e+=3}return e}function Mt(t,e){if(typeof e!="string")throw new TypeError("String value must be a string");for(let n=0;n<e.length;n++){let o=e.charCodeAt(n);if(o<128){t.write_bit(1),t.write_bitsUnsigned(o,8);continue}if(o<2048){t.write_bit(1),t.write_bitsUnsigned(192|o>>>6,8),t.write_bit(1),t.write_bitsUnsigned(128|o&63,8);continue}if(o>=55296&&o<=56319){const r=n+1<e.length?e.charCodeAt(n+1):0;if(r>=56320&&r<=57343){n++;const s=(o-55296<<10)+(r-56320)+65536;t.write_bit(1),t.write_bitsUnsigned(240|s>>>18,8),t.write_bit(1),t.write_bitsUnsigned(128|s>>>12&63,8),t.write_bit(1),t.write_bitsUnsigned(128|s>>>6&63,8),t.write_bit(1),t.write_bitsUnsigned(128|s&63,8);continue}o=65533}else o>=56320&&o<=57343&&(o=65533);t.write_bit(1),t.write_bitsUnsigned(224|o>>>12,8),t.write_bit(1),t.write_bitsUnsigned(128|o>>>6&63,8),t.write_bit(1),t.write_bitsUnsigned(128|o&63,8)}t.write_bit(0)}function Et(t){let e=new Uint8Array(16),n=0;for(;t.read_bit();){const o=t.read_bitsUnsigned(8);if(n===e.length){const r=new Uint8Array(e.length*2);r.set(e),e=r}e[n++]=o}return $t.decode(e.subarray(0,n))}function Ye(t,e){const n=C(t,e),o=new Uint8Array(n+7>>>3),r=new Nt(o);return B(r,t,e),o}function Ze(t,e){const n=new Rt(e);return P(n,t)}var Y=53,Fe={$:"List",type:{$:"UInt",size:8}},Qe={$:"Union",variants:{get_time:{$:"Struct",fields:{}},info_time:{$:"Struct",fields:{time:{$:"UInt",size:Y}}},post:{$:"Struct",fields:{room:{$:"String"},time:{$:"UInt",size:Y},name:{$:"String"},payload:Fe}},info_post:{$:"Struct",fields:{room:{$:"String"},index:{$:"UInt",size:32},server_time:{$:"UInt",size:Y},client_time:{$:"UInt",size:Y},name:{$:"String"},payload:Fe}},load:{$:"Struct",fields:{room:{$:"String"},from:{$:"UInt",size:32}}},watch:{$:"Struct",fields:{room:{$:"String"}}},unwatch:{$:"Struct",fields:{room:{$:"String"}}},get_latest_post_index:{$:"Struct",fields:{room:{$:"String"}}},info_latest_post_index:{$:"Struct",fields:{room:{$:"String"},latest_index:{$:"Int",size:32},server_time:{$:"UInt",size:Y}}}}};function Ce(t){const e=new Array(t.length);for(let n=0;n<t.length;n++)e[n]=t[n];return e}function Be(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t[n]&255;return e}function At(t){switch(t.$){case"post":return{$:"post",room:t.room,time:t.time,name:t.name,payload:Ce(t.payload)};case"info_post":return{$:"info_post",room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,payload:Ce(t.payload)};default:return t}}function Ot(t){switch(t.$){case"post":return{$:"post",room:t.room,time:t.time,name:t.name,payload:Be(t.payload)};case"info_post":return{$:"info_post",room:t.room,index:t.index,server_time:t.server_time,client_time:t.client_time,name:t.name,payload:Be(t.payload)};default:return t}}function V(t){return Ye(Qe,At(t))}function zt(t){const e=Ze(Qe,t);return Ot(e)}var Ne="wss://net.studiovibi.com";function jt(t){let e=t;try{const n=new URL(t);n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),e=n.toString()}catch{e=t}if(typeof window<"u"&&window.location.protocol==="https:"&&e.startsWith("ws://")){const n=`wss://${e.slice(5)}`;return console.warn(`[VibiNet] Upgrading insecure WebSocket URL "${e}" to "${n}" because the page is HTTPS.`),n}return e}function he(){return Math.floor(Date.now())}function Ut(){return Ne}function et(){const t="_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",e=new Uint8Array(8);if(typeof crypto<"u"&&typeof crypto.getRandomValues=="function")crypto.getRandomValues(e);else for(let r=0;r<8;r++)e[r]=Math.floor(Math.random()*256);let o="";for(let r=0;r<8;r++)o+=t[e[r]%64];return o}function Lt(t){const e={clock_offset:1/0,lowest_ping:1/0,request_sent_at:0,last_ping:1/0},n=new Map,o=new Set,r=[];let s=!1;const a=[];let c=null,u=null,f=0,v=!1,_=null;const d=[],T=jt(t??Ut());function w(){if(!isFinite(e.clock_offset))throw new Error("server_time() called before initial sync");return Math.floor(he()+e.clock_offset)}function h(){c!==null&&(clearInterval(c),c=null)}function g(){u!==null&&(clearTimeout(u),u=null)}function z(){const A=Math.min(8e3,500*Math.pow(2,f)),x=Math.floor(Math.random()*250);return A+x}function L(){if(!(!_||_.readyState!==WebSocket.OPEN))for(;d.length>0;){if(!_||_.readyState!==WebSocket.OPEN)return;const m=d[0];try{_.send(m),d.shift()}catch{X();return}}}function te(){!_||_.readyState!==WebSocket.OPEN||(e.request_sent_at=he(),_.send(V({$:"get_time"})))}function ne(m){if(!_||_.readyState!==WebSocket.OPEN)return!1;try{return _.send(m),!0}catch{return!1}}function me(m){ne(m)||X()}function St(m){d.push(m),X()}function je(m,k,A){const x=n.get(m);if(x){if(x.packer!==k)throw new Error(`Packed schema already registered for room: ${m}`);A&&(x.handler=A);return}n.set(m,{handler:A,packer:k})}function wt(){if(v||u!==null)return;const m=z();u=setTimeout(()=>{u=null,f+=1,X()},m)}function X(){if(v||_&&(_.readyState===WebSocket.OPEN||_.readyState===WebSocket.CONNECTING))return;g();const m=new WebSocket(T);_=m,m.binaryType="arraybuffer",m.addEventListener("open",()=>{if(_===m){f=0,console.log("[WS] Connected"),te(),h();for(const k of o.values())m.send(V({$:"watch",room:k}));L(),c=setInterval(te,2e3)}}),m.addEventListener("message",k=>{const A=k.data instanceof ArrayBuffer?new Uint8Array(k.data):new Uint8Array(k.data),x=zt(A);switch(x.$){case"info_time":{const j=he(),F=j-e.request_sent_at;if(e.last_ping=F,F<e.lowest_ping){const _e=Math.floor((e.request_sent_at+j)/2);e.clock_offset=x.time-_e,e.lowest_ping=F}if(!s){s=!0;for(const _e of a)_e();a.length=0}break}case"info_post":{const j=n.get(x.room);if(j&&j.handler){const F=Ze(j.packer,x.payload);j.handler({$:"info_post",room:x.room,index:x.index,server_time:x.server_time,client_time:x.client_time,name:x.name,data:F})}break}case"info_latest_post_index":{for(const j of r)j({room:x.room,latest_index:x.latest_index,server_time:x.server_time});break}}}),m.addEventListener("close",k=>{_===m&&(h(),_=null,!v&&(console.warn(`[WS] Disconnected (code=${k.code}); reconnecting...`),wt()))}),m.addEventListener("error",()=>{})}return X(),{on_sync:m=>{if(s){m();return}a.push(m)},watch:(m,k,A)=>{je(m,k,A),o.add(m),me(V({$:"watch",room:m}))},load:(m,k,A,x)=>{je(m,A,x),me(V({$:"load",room:m,from:k}))},get_latest_post_index:m=>{me(V({$:"get_latest_post_index",room:m}))},on_latest_post_index:m=>{r.push(m)},post:(m,k,A)=>{const x=et(),j=Ye(A,k),F=V({$:"post",room:m,time:w(),name:x,payload:j});return d.length>0&&L(),ne(F)||St(F),x},server_time:w,ping:()=>e.last_ping,close:()=>{if(v=!0,g(),h(),_&&_.readyState===WebSocket.OPEN)for(const m of o.values())try{_.send(V({$:"unwatch",room:m}))}catch{break}_&&_.close(),_=null},debug_dump:()=>({ws_url:T,ws_ready_state:_?_.readyState:WebSocket.CLOSED,is_synced:s,reconnect_attempt:f,reconnect_scheduled:u!==null,pending_post_count:d.length,watched_rooms:Array.from(o.values()),room_watchers:Array.from(n.keys()),room_watcher_count:n.size,latest_post_index_listener_count:r.length,sync_listener_count:a.length,time_sync:{clock_offset:e.clock_offset,lowest_ping:e.lowest_ping,request_sent_at:e.request_sent_at,last_ping:e.last_ping}})}}var ge=class{constructor(e){y(this,"room"),y(this,"init"),y(this,"on_tick"),y(this,"on_post"),y(this,"packer"),y(this,"smooth"),y(this,"tick_rate"),y(this,"tolerance"),y(this,"client_api"),y(this,"remote_posts"),y(this,"local_posts"),y(this,"timeline"),y(this,"cache_enabled"),y(this,"snapshot_stride"),y(this,"snapshot_count"),y(this,"snapshots"),y(this,"snapshot_start_tick"),y(this,"initial_time_value"),y(this,"initial_tick_value"),y(this,"no_pending_posts_before_ms"),y(this,"max_contiguous_remote_index"),y(this,"cache_drop_guard_hits"),y(this,"latest_index_poll_interval_id"),y(this,"max_remote_index");const n=(u,f)=>u,o=e.smooth??n,r=e.cache??!0,s=e.snapshot_stride??8,a=e.snapshot_count??256,c=e.client??Lt(e.server);this.room=e.room,this.init=e.initial,this.on_tick=e.on_tick,this.on_post=e.on_post,this.packer=e.packer,this.smooth=o,this.tick_rate=e.tick_rate,this.tolerance=e.tolerance,this.client_api=c,this.remote_posts=new Map,this.local_posts=new Map,this.timeline=new Map,this.cache_enabled=r,this.snapshot_stride=Math.max(1,Math.floor(s)),this.snapshot_count=Math.max(1,Math.floor(a)),this.snapshots=new Map,this.snapshot_start_tick=null,this.initial_time_value=null,this.initial_tick_value=null,this.no_pending_posts_before_ms=null,this.max_contiguous_remote_index=-1,this.cache_drop_guard_hits=0,this.latest_index_poll_interval_id=null,this.max_remote_index=-1,this.client_api.on_latest_post_index&&this.client_api.on_latest_post_index(u=>{this.on_latest_post_index_info(u)}),this.client_api.on_sync(()=>{console.log(`[VIBI] synced; loading+watching room=${this.room}`);const u=f=>{f.name&&this.remove_local_post(f.name),this.add_remote_post(f)};this.client_api.load(this.room,0,this.packer,u),this.client_api.watch(this.room,this.packer,u),this.request_latest_post_index(),this.latest_index_poll_interval_id!==null&&clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=setInterval(()=>{this.request_latest_post_index()},2e3)})}official_time(e){return e.client_time<=e.server_time-this.tolerance?e.server_time-this.tolerance:e.client_time}official_tick(e){return this.time_to_tick(this.official_time(e))}get_bucket(e){let n=this.timeline.get(e);return n||(n={remote:[],local:[]},this.timeline.set(e,n)),n}insert_remote_post(e,n){const o=this.get_bucket(n);o.remote.push(e),o.remote.sort((r,s)=>r.index-s.index)}invalidate_from_tick(e){if(!this.cache_enabled)return;const n=this.snapshot_start_tick;if(n!==null&&e<n||n===null||this.snapshots.size===0)return;const o=this.snapshot_stride,r=n+(this.snapshots.size-1)*o;if(!(e>r)){if(e<=n){this.snapshots.clear();return}for(let s=r;s>=e;s-=o)this.snapshots.delete(s)}}advance_state(e,n,o){let r=e;for(let s=n+1;s<=o;s++)r=this.apply_tick(r,s);return r}prune_before_tick(e){if(!this.cache_enabled)return;const n=this.safe_prune_tick();n!==null&&e>n&&(this.cache_drop_guard_hits+=1,e=n);for(const o of this.timeline.keys())o<e&&this.timeline.delete(o);for(const[o,r]of this.remote_posts.entries())this.official_tick(r)<e&&this.remote_posts.delete(o);for(const[o,r]of this.local_posts.entries())this.official_tick(r)<e&&this.local_posts.delete(o)}tick_ms(){return 1e3/this.tick_rate}cache_window_ticks(){return this.snapshot_stride*Math.max(0,this.snapshot_count-1)}safe_prune_tick(){return this.no_pending_posts_before_ms===null?null:this.time_to_tick(this.no_pending_posts_before_ms)}safe_compute_tick(e){if(!this.cache_enabled)return e;const n=this.safe_prune_tick();if(n===null)return e;const o=n+this.cache_window_ticks();return Math.min(e,o)}advance_no_pending_posts_before_ms(e){const n=Math.max(0,Math.floor(e));(this.no_pending_posts_before_ms===null||n>this.no_pending_posts_before_ms)&&(this.no_pending_posts_before_ms=n)}advance_contiguous_remote_frontier(){for(;;){const e=this.max_contiguous_remote_index+1,n=this.remote_posts.get(e);if(!n)break;this.max_contiguous_remote_index=e,this.advance_no_pending_posts_before_ms(this.official_time(n))}}on_latest_post_index_info(e){if(e.room!==this.room||e.latest_index>this.max_contiguous_remote_index)return;const n=this.tick_ms(),o=e.server_time-this.tolerance-n;this.advance_no_pending_posts_before_ms(o)}request_latest_post_index(){if(this.client_api.get_latest_post_index)try{this.client_api.get_latest_post_index(this.room)}catch{}}ensure_snapshots(e,n){if(!this.cache_enabled)return;this.snapshot_start_tick===null&&(this.snapshot_start_tick=n);let o=this.snapshot_start_tick;if(o===null||e<o)return;const r=this.snapshot_stride,s=o+Math.floor((e-o)/r)*r;let a,c;if(this.snapshots.size===0)a=this.init,c=o-1;else{const v=o+(this.snapshots.size-1)*r;a=this.snapshots.get(v),c=v}let u=c+r;for(this.snapshots.size===0&&(u=o);u<=s;u+=r)a=this.advance_state(a,c,u),this.snapshots.set(u,a),c=u;const f=this.snapshots.size;if(f>this.snapshot_count){const v=f-this.snapshot_count,_=o+v*r;for(let d=o;d<_;d+=r)this.snapshots.delete(d);o=_,this.snapshot_start_tick=o}this.prune_before_tick(o)}add_remote_post(e){const n=this.official_tick(e);if(e.index===0&&this.initial_time_value===null){const r=this.official_time(e);this.initial_time_value=r,this.initial_tick_value=this.time_to_tick(r)}if(this.remote_posts.has(e.index))return;this.cache_enabled&&this.snapshot_start_tick!==null&&n<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.remote_posts.set(e.index,e),e.index>this.max_remote_index&&(this.max_remote_index=e.index),this.advance_contiguous_remote_frontier(),this.insert_remote_post(e,n),this.invalidate_from_tick(n)}add_local_post(e,n){this.local_posts.has(e)&&this.remove_local_post(e);const o=this.official_tick(n);this.cache_enabled&&this.snapshot_start_tick!==null&&o<this.snapshot_start_tick&&(this.cache_drop_guard_hits+=1,this.snapshots.clear(),this.snapshot_start_tick=null),this.local_posts.set(e,n),this.get_bucket(o).local.push(n),this.invalidate_from_tick(o)}remove_local_post(e){const n=this.local_posts.get(e);if(!n)return;this.local_posts.delete(e);const o=this.official_tick(n),r=this.timeline.get(o);if(r){const s=r.local.indexOf(n);if(s!==-1)r.local.splice(s,1);else{const a=r.local.findIndex(c=>c.name===e);a!==-1&&r.local.splice(a,1)}r.remote.length===0&&r.local.length===0&&this.timeline.delete(o)}this.invalidate_from_tick(o)}apply_tick(e,n){let o=this.on_tick(e);const r=this.timeline.get(n);if(r){for(const s of r.remote)o=this.on_post(s.data,o);for(const s of r.local)o=this.on_post(s.data,o)}return o}compute_state_at_uncached(e,n){let o=this.init;for(let r=e;r<=n;r++)o=this.apply_tick(o,r);return o}post_to_debug_dump(e){return{room:e.room,index:e.index,server_time:e.server_time,client_time:e.client_time,name:e.name,official_time:this.official_time(e),official_tick:this.official_tick(e),data:e.data}}timeline_tick_bounds(){let e=null,n=null;for(const o of this.timeline.keys())(e===null||o<e)&&(e=o),(n===null||o>n)&&(n=o);return{min:e,max:n}}snapshot_tick_bounds(){let e=null,n=null;for(const o of this.snapshots.keys())(e===null||o<e)&&(e=o),(n===null||o>n)&&(n=o);return{min:e,max:n}}time_to_tick(e){return Math.floor(e*this.tick_rate/1e3)}server_time(){return this.client_api.server_time()}server_tick(){return this.time_to_tick(this.server_time())}post_count(){return this.max_remote_index+1}compute_render_state(){const e=this.server_tick(),n=1e3/this.tick_rate,o=Math.ceil(this.tolerance/n),r=this.client_api.ping(),s=isFinite(r)?Math.ceil(r/2/n):0,a=Math.max(o,s+1),c=Math.max(0,e-a),u=this.compute_state_at(c),f=this.compute_state_at(e);return this.smooth(u,f)}initial_time(){if(this.initial_time_value!==null)return this.initial_time_value;const e=this.remote_posts.get(0);if(!e)return null;const n=this.official_time(e);return this.initial_time_value=n,this.initial_tick_value=this.time_to_tick(n),n}initial_tick(){if(this.initial_tick_value!==null)return this.initial_tick_value;const e=this.initial_time();return e===null?null:(this.initial_tick_value=this.time_to_tick(e),this.initial_tick_value)}compute_state_at(e){e=this.safe_compute_tick(e);const n=this.initial_tick();if(n===null)return this.init;if(e<n)return this.init;if(!this.cache_enabled)return this.compute_state_at_uncached(n,e);this.ensure_snapshots(e,n);const o=this.snapshot_start_tick;if(o===null||this.snapshots.size===0)return this.init;if(e<o)return this.snapshots.get(o)??this.init;const r=this.snapshot_stride,s=o+(this.snapshots.size-1)*r,a=Math.floor((s-o)/r),c=Math.floor((e-o)/r),u=Math.min(c,a),f=o+u*r,v=this.snapshots.get(f)??this.init;return this.advance_state(v,f,e)}debug_dump(){const e=Array.from(this.remote_posts.values()).sort((h,g)=>h.index-g.index).map(h=>this.post_to_debug_dump(h)),n=Array.from(this.local_posts.values()).sort((h,g)=>{const z=this.official_tick(h),L=this.official_tick(g);if(z!==L)return z-L;const te=h.name??"",ne=g.name??"";return te.localeCompare(ne)}).map(h=>this.post_to_debug_dump(h)),o=Array.from(this.timeline.entries()).sort((h,g)=>h[0]-g[0]).map(([h,g])=>({tick:h,remote_count:g.remote.length,local_count:g.local.length,remote_posts:g.remote.map(z=>this.post_to_debug_dump(z)),local_posts:g.local.map(z=>this.post_to_debug_dump(z))})),r=Array.from(this.snapshots.entries()).sort((h,g)=>h[0]-g[0]).map(([h,g])=>({tick:h,state:g})),s=this.initial_time(),a=this.initial_tick(),c=this.timeline_tick_bounds(),u=this.snapshot_tick_bounds(),f=a!==null&&c.min!==null&&c.min>a;let v=null,_=null;try{v=this.server_time(),_=this.server_tick()}catch{v=null,_=null}let d=null,T=null;for(const h of this.remote_posts.keys())(d===null||h<d)&&(d=h),(T===null||h>T)&&(T=h);const w=typeof this.client_api.debug_dump=="function"?this.client_api.debug_dump():null;return{room:this.room,tick_rate:this.tick_rate,tolerance:this.tolerance,cache_enabled:this.cache_enabled,snapshot_stride:this.snapshot_stride,snapshot_count:this.snapshot_count,snapshot_start_tick:this.snapshot_start_tick,no_pending_posts_before_ms:this.no_pending_posts_before_ms,max_contiguous_remote_index:this.max_contiguous_remote_index,initial_time:s,initial_tick:a,max_remote_index:this.max_remote_index,post_count:this.post_count(),server_time:v,server_tick:_,ping:this.ping(),history_truncated:f,cache_drop_guard_hits:this.cache_drop_guard_hits,counts:{remote_posts:this.remote_posts.size,local_posts:this.local_posts.size,timeline_ticks:this.timeline.size,snapshots:this.snapshots.size},ranges:{timeline_min_tick:c.min,timeline_max_tick:c.max,snapshot_min_tick:u.min,snapshot_max_tick:u.max,min_remote_index:d,max_remote_index:T},remote_posts:e,local_posts:n,timeline:o,snapshots:r,client_debug:w}}debug_recompute(e){const n=this.initial_tick(),o=this.timeline_tick_bounds(),r=n!==null&&o.min!==null&&o.min>n;let s=e;if(s===void 0)try{s=this.server_tick()}catch{s=void 0}s===void 0&&(s=n??0);const a=this.snapshots.size;this.snapshots.clear(),this.snapshot_start_tick=null;const c=[];if(r&&c.push("Local history before timeline_min_tick was pruned; full room replay may be impossible without reloading posts."),n===null||s<n)return c.push("No replayable post range available at target tick."),{target_tick:s,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:a,history_truncated:r,state:this.init,notes:c};const u=this.compute_state_at_uncached(n,s);return{target_tick:s,initial_tick:n,cache_invalidated:!0,invalidated_snapshot_count:a,history_truncated:r,state:u,notes:c}}post(e){const n=this.client_api.post(this.room,e,this.packer),o=this.server_time(),r={room:this.room,index:-1,server_time:o,client_time:o,name:n,data:e};this.add_local_post(n,r)}compute_current_state(){return this.compute_state_at(this.server_tick())}on_sync(e){this.client_api.on_sync(e)}ping(){return this.client_api.ping()}close(){this.latest_index_poll_interval_id!==null&&(clearInterval(this.latest_index_poll_interval_id),this.latest_index_poll_interval_id=null),this.client_api.close()}static gen_name(){return et()}};y(ge,"game",ge);var Ft=ge;const Pe=220,pe=["#f25f5c","#247ba0","#70c1b3","#f7b267","#8e6c88","#5c80bc","#9bc53d","#f18f01"],Ct=24,Ve=120,re=[101,207,311,419,523,631,733,839,947,1051,1153,1259,1361,1471,1579,1681,1789,1891,1993,2099,2203,2309,2411,2521,2621,2729,2833,2939,3041,3149,3253,3359,3461,3571,3677,3779,3881,3989,4091,4201,4303,4409,4513,4621,4723,4831,4933,5039,5147,5251],Bt=[[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[1,4],[4,7],[2,5],[5,8],[3,6],[6,9],[1,5],[5,9],[2,4],[2,6],[4,8],[6,8],[3,5],[5,7]];function b(t){return`room-${t}`}function ae(t,e){return`corridor:${t}:${e}`}function tt(t,e){return t<e?[t,e]:[e,t]}function nt(t,e){return`${e}-${t.feed.length+1}-${t.round}-${t.currentTurnName??"none"}`}function Pt(t){t.feed.length>Ve&&(t.feed=t.feed.slice(-Ve))}function ot(t,e){t.feed.push(e),Pt(t)}function E(t,e,n){ot(t,{id:nt(t,"system"),kind:"system",actorName:e,text:n,createdAt:t.feed.length+1})}function Vt(t,e,n){ot(t,{id:nt(t,"chat"),kind:"chat",actorName:e,text:n,createdAt:t.feed.length+1})}function rt(t){return t.filter(e=>e.seat==="participant"&&e.connected)}function Kt(t,e){return t.filter(n=>n.seat==="participant"&&n.connected&&n.name!==e)}function Dt(t,e){const n=`${t.clockTick}:${e}:${Object.keys(t.roster).join("|")}`;let o=2166136261;for(let r=0;r<n.length;r+=1)o^=n.charCodeAt(r),o=Math.imul(o,16777619);return o>>>0}function oe(t,e,n,o,r){return t.length===0?null:[...t].sort((a,c)=>{const u=n*(a[e]-c[e]);return u!==0?u:Math.abs(a[r]-o)-Math.abs(c[r]-o)})[0]??null}function Ht(t){const e=new Set,n=[];for(const o of t.values())for(const[r,s]of o){const[a,c]=tt(r,s),u=`${a}:${c}`;e.has(u)||(e.add(u),n.push([a,c]))}return n}function ye(t,e){const n=[...t];for(let o=n.length-1;o>0;o-=1){const r=Math.floor(e()*(o+1)),s=n[o];n[o]=n[r],n[r]=s}return n}function st(t){let e=t>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function Wt(t,e){return e.activeSessionId?t.clockTick-e.lastSeenTick<=Ct:!1}function O(t,e,n){return t.roster[e]?.activeSessionId===n}function qt(t,e){const n=t.fullState.players[e.name];return{name:e.name,color:n?.color??e.color,joinedAt:n?.joinedAt??e.joinedAt,connected:Wt(t,e),seat:n?.seat??e.seat,role:n?.role??"hen",alive:n?.alive??!1,ready:n?.ready??!1}}function Re(t){return Object.values(t.roster).sort((e,n)=>e.joinedAt-n.joinedAt).map(e=>qt(t,e))}function de(t){t.masterName&&t.foxName===t.masterName&&(t.foxName=null);for(const e of Object.values(t.players)){if(e.alive=!1,e.locationRoomId=null,e.seat==="spectator"){e.role="spectator",e.ready=!1,e.hasFullInfo=!0;continue}if(t.masterName===e.name){e.role="master",e.hasFullInfo=!0;continue}e.role=t.foxName===e.name?"fox":"hen",e.hasFullInfo=!1}}function Gt(t){if(t.fullState.phase!=="lobby")return!1;const e=rt(Re(t));return e.length>=2&&e.every(n=>n.ready)}function Jt(t,e){const n=t.fullState.players[e.name];if(n){n.color=e.color,n.joinedAt=e.joinedAt,n.seat=e.seat,e.seat==="spectator"&&(n.role="spectator",n.ready=!1,n.alive=!1,n.locationRoomId=null,n.hasFullInfo=!0);return}t.fullState.players[e.name]={name:e.name,color:e.color,joinedAt:e.joinedAt,seat:e.seat,role:e.seat==="spectator"?"spectator":"hen",alive:!1,locationRoomId:null,hasFullInfo:e.seat==="spectator",ready:!1}}function it(t,e){const n=ln(e);t.rooms=n.rooms,t.corridors=n.corridors;for(const o of Object.values(t.players))o.locationRoomId=null}function at(t,e){const n=e?t.players[e]:null;!n||n.seat!=="participant"||n.role==="master"?t.foxName=null:t.foxName=e,t.phase==="lobby"&&de(t)}function lt(t,e,n){const o=I(t),r=Re(o),s=Kt(r,o.fullState.masterName);if(s.length<2||s.length>8)return t;const a=Object.keys(o.fullState.rooms);if(a.length===0)return t;const c=st(e),u=[...s].sort((d,T)=>d.joinedAt-T.joinedAt),f=o.fullState.foxName&&u.some(d=>d.name===o.fullState.foxName)?o.fullState.foxName:u[Math.floor(c()*u.length)]?.name??null;if(!f)return t;const v=ye(a,c),_=u.filter(d=>d.name!==f).map(d=>d.name);for(const d of Object.values(o.fullState.players)){if(d.seat==="spectator"){d.role="spectator",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!0,d.ready=!1;continue}if(d.name===o.fullState.masterName){d.role="master",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!0,d.ready=!1;continue}const T=u.findIndex(w=>w.name===d.name);if(T===-1){d.role="hen",d.alive=!1,d.locationRoomId=null,d.hasFullInfo=!1,d.ready=!1;continue}d.role=d.name===f?"fox":"hen",d.alive=!0,d.locationRoomId=v[T%v.length]??a[0]??null,d.hasFullInfo=!1,d.ready=!1}return o.fullState.phase="running",o.fullState.winner=null,o.fullState.round=1,o.fullState.currentTurnName=_[0]??f,o.fullState.henOrder=_,o.fullState.pendingKillTargets=[],o.fullState.foxName=f,E(o.fullState,null,n),o}function Xt(t,e,n){const o=I(t);o.fullState.phase="lobby",o.fullState.winner=null,o.fullState.round=0,o.fullState.currentTurnName=null,o.fullState.henOrder=[],o.fullState.pendingKillTargets=[],o.fullState.foxName=null;for(const r of Object.values(o.fullState.players))r.alive=!1,r.locationRoomId=null,r.ready=!1,r.seat==="spectator"?(r.role="spectator",r.hasFullInfo=!0):o.fullState.masterName===r.name?(r.role="master",r.hasFullInfo=!0):(r.role="hen",r.hasFullInfo=!1);return E(o.fullState,e,n),o}function Yt(t,e){return e?Object.values(t.players).filter(n=>n.role==="hen"&&n.alive&&n.locationRoomId===e).map(n=>n.name):[]}function Ke(t){return Math.max(1,t.henOrder.length)*10}function ct(t,e,n){return t.phase="game_over",t.winner=e,t.currentTurnName=null,t.pendingKillTargets=[],E(t,t.foxName,n),t}function se(t){const n=[...t.henOrder.filter(s=>t.players[s]?.alive),...t.foxName&&t.players[t.foxName]?.alive?[t.foxName]:[]];if(n.length===0)return t.phase="game_over",t.winner=null,t.currentTurnName=null,E(t,null,"Partida encerrada."),t;const o=t.currentTurnName?n.indexOf(t.currentTurnName):-1,r=o+1;if(o===-1||r>=n.length){if(t.round=Math.max(1,t.round)+(o===-1?0:1),t.round>Ke(t))return ct(t,"hens",`As galinhas sobreviveram por mais de ${Ke(t)} rodadas e venceram.`);t.currentTurnName=n[0]??null}else t.currentTurnName=n[r]??null;return t.pendingKillTargets=[],t}function ut(t,e){const n=t.players[e];return n?(n.alive=!1,n.hasFullInfo=!0,t.pendingKillTargets=[],E(t,t.foxName,`${e} foi capturada.`),Object.values(t.players).some(r=>r.role==="hen"&&r.alive)?se(t):ct(t,"fox","A raposa eliminou todas as galinhas e venceu a partida.")):t}function dt(t,e,n){return e===n?!0:t.fullState.masterName===e}function I(t){return JSON.parse(JSON.stringify(t))}function Zt(t){return t.trim().replace(/\s+/g," ").slice(0,24)}function Qt(t){return t.trim().replace(/\s+/g,"-").slice(0,36).toLowerCase()}function en(t){return JSON.stringify(t)}function tn(){return re.length}function nn(){return re[Math.floor(Math.random()*re.length)]??re[0]}function on(t,e){const n=t.filter(o=>o.seat==="participant"&&o.connected&&o.name!==e);return n.length===0?null:n[Math.floor(Math.random()*n.length)]?.name??null}function le(t,e){const n=Math.atan2(e.y-t.y,e.x-t.x);return Math.round((n*180/Math.PI+360)%360)}function ft(t,e,n,o="normal"){return{id:t,x:e,y:n,type:o}}function ce(t,e){return{id:ae(t.id,e.id),fromRoomId:t.id,toRoomId:e.id,angleFrom:le(t,e),angleTo:le(e,t)}}function Te(){const t={},e={};for(let o=0;o<3;o+=1)for(let r=0;r<3;r+=1){const s=o*3+r+1,a=b(s);t[a]=ft(a,180+r*Pe,160+o*Pe)}const n=[[b(1),b(2)],[b(2),b(3)],[b(4),b(5)],[b(5),b(6)],[b(7),b(8)],[b(8),b(9)],[b(1),b(4)],[b(4),b(7)],[b(2),b(5)],[b(5),b(8)],[b(3),b(6)],[b(6),b(9)],[b(1),b(5)],[b(5),b(9)]];for(const[o,r]of n){const s=ce(t[o],t[r]);e[s.id]=s}return{rooms:t,corridors:e}}function rn(t=null){const{rooms:e,corridors:n}=Te();return{phase:"lobby",masterName:t,foxName:null,winner:null,round:0,currentTurnName:null,players:{},rooms:e,corridors:n,henOrder:[],pendingKillTargets:[],feed:[]}}function Me(t,e){const n=I(t);switch(e.type){case"add_room":{const o=Object.keys(n.rooms).map(s=>Number(s.split("-")[1]??0)),r=b((Math.max(0,...o)||0)+1);return n.rooms[r]=ft(r,320,320,"normal"),n}case"set_default_map":{const o=Te();n.rooms=o.rooms,n.corridors=o.corridors;for(const r of Object.values(n.players))r.locationRoomId=null;return n}case"set_random_map":return it(n,e.seed),n;case"toggle_corridor":{const[o,r]=tt(e.leftRoomId,e.rightRoomId),s=ae(o,r);if(n.corridors[s])return delete n.corridors[s],n;const a=n.rooms[e.leftRoomId],c=n.rooms[e.rightRoomId];return!a||!c?t:(n.corridors[s]=ce(a,c),n)}case"cycle_room_type":{const o=n.rooms[e.roomId];return o?(o.type=o.type==="normal"?"shop":"normal",n):t}case"remove_room":{delete n.rooms[e.roomId];for(const o of Object.keys(n.corridors)){const r=n.corridors[o];(r.fromRoomId===e.roomId||r.toRoomId===e.roomId)&&delete n.corridors[o]}for(const o of Object.values(n.players))o.locationRoomId===e.roomId&&(o.locationRoomId=null);return n}case"toggle_loop":{const o=ae(e.roomId,e.roomId);return n.corridors[o]?(delete n.corridors[o],n):(n.corridors[o]={id:o,fromRoomId:e.roomId,toRoomId:e.roomId,angleFrom:0,angleTo:0},n)}case"move_room":{const o=n.rooms[e.roomId];if(!o)return t;o.x=e.x,o.y=e.y;for(const r of Object.values(n.corridors))if(r.fromRoomId===e.roomId||r.toRoomId===e.roomId){const s=n.rooms[r.fromRoomId],a=n.rooms[r.toRoomId];if(!s||!a)continue;r.angleFrom=le(s,a),r.angleTo=le(a,s)}return n}default:return n}}function sn(t){const e=Object.values(t);if(e.length<2)return[];const n=e.reduce((f,v)=>f+v.x,0)/e.length,o=e.reduce((f,v)=>f+v.y,0)/e.length,r=oe(e,"x",1,o,"y"),s=oe(e,"x",-1,o,"y"),a=oe(e,"y",1,n,"x"),c=oe(e,"y",-1,n,"x"),u=[];return r&&s&&r.id!==s.id&&u.push([r.id,s.id]),a&&c&&a.id!==c.id&&u.push([a.id,c.id]),u}function an(t){const e=new Map,n=[...Bt.map(([o,r])=>[b(o),b(r)]),...sn(t)];for(const[o,r]of n)e.set(o,[...e.get(o)??[],[o,r]]),e.set(r,[...e.get(r)??[],[r,o]]);return e}function ln(t){const e=st(t),n=Te().rooms,o={},r=Object.keys(n).sort(),s=new Set,a=[],c=an(n),u=b(1+Math.floor(e()*r.length));for(s.add(u),a.push(...c.get(u)??[]);s.size<r.length&&a.length>0;){const w=Math.floor(e()*a.length),[h,g]=a.splice(w,1)[0]??[];if(!h||!g||s.has(g))continue;s.add(g);const z=ce(n[h],n[g]);o[z.id]=z;for(const L of c.get(g)??[])s.has(L[1])||a.push(L)}const f=ye(Ht(c),e),v=3+Math.floor(e()*5);for(const[w,h]of f){if(Object.keys(o).length>=r.length-1+v)break;const g=ce(n[w],n[h]);o[g.id]=g}const _=1+Math.floor(e()*3),d=ye(r,e);for(let w=0;w<_;w+=1){const h=d[w];h&&(n[h].type="shop")}const T=Math.floor(e()*2);for(let w=0;w<T;w+=1){const h=d[_+w];if(!h)continue;const g=ae(h,h);o[g]={id:g,fromRoomId:h,toRoomId:h,angleFrom:0,angleTo:0}}return{rooms:n,corridors:o}}function cn(){return{roster:{},fullState:rn(),clockTick:0,nextJoinOrder:0}}function un(t){return{...t,clockTick:t.clockTick+1}}function dn(t,e){const n=I(t),o=n.roster[e.name];if(o)return o.activeSessionId=e.sessionId,o.lastSeenTick=n.clockTick,n;const r=n.nextJoinOrder+1,s=n.fullState.phase==="lobby"?"participant":"spectator",a={name:e.name,color:pe[n.nextJoinOrder%pe.length]??pe[0],joinedAt:r,seat:s,activeSessionId:e.sessionId,lastSeenTick:n.clockTick};return n.nextJoinOrder+=1,n.roster[a.name]=a,Jt(n,a),n.fullState.phase==="lobby"?de(n.fullState):E(n.fullState,e.name,`${e.name} entrou como espectador.`),n}function fn(t,e){if(!O(t,e.name,e.sessionId))return t;const n=I(t),o=n.roster[e.name];return o?(o.lastSeenTick=n.clockTick,n):t}function mn(t,e){if(t.fullState.phase!=="lobby"||t.fullState.masterName||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return o.fullState.masterName=e.name,de(o.fullState),E(o.fullState,e.name,`${e.name} virou mestre.`),o}function _n(t,e){if(t.fullState.phase!=="lobby"||t.fullState.masterName!==e.name||!O(t,e.name,e.sessionId))return t;const n=I(t);return n.fullState.masterName=null,de(n.fullState),E(n.fullState,e.name,`${e.name} deixou de ser mestre.`),n}function hn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return o.fullState.players[e.name].ready=!o.fullState.players[e.name].ready,E(o.fullState,e.name,o.fullState.players[e.name].ready?`${e.name} ficou ready.`:`${e.name} removeu o ready.`),Gt(o)?lt(o,Dt(o,e.name),"Todos ficaram ready. Partida iniciada."):o}function pn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return it(o.fullState,e.seed),E(o.fullState,e.name,`${e.name} aplicou um mapa aleatorio.`),o}function bn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant")return t;const o=I(t);return at(o.fullState,e.foxName),o.fullState.foxName?E(o.fullState,e.name,`${o.fullState.foxName} virou a raposa.`):E(o.fullState,e.name,"A raposa foi removida."),o}function gn(t,e){if(t.fullState.phase!=="lobby"||!O(t,e.name,e.sessionId))return t;const n=t.fullState.players[e.name];if(!n||n.seat!=="participant"||n.role==="master")return t;const o=I(t),r=o.fullState.foxName===e.name?null:e.name;return at(o.fullState,r),E(o.fullState,e.name,r?`${e.name} virou a raposa.`:`${e.name} deixou de ser raposa.`),o}function yn(t,e){return t.fullState.phase!=="lobby"||t.fullState.masterName!==e.name||!O(t,e.name,e.sessionId)?t:lt(t,e.seed,`${e.name} iniciou a partida.`)}function vn(t,e){if(!O(t,e.name,e.sessionId))return t;const n=e.text.trim().slice(0,280);if(!n)return t;const o=I(t);return Vt(o.fullState,e.name,n),o}function xn(t,e){if(t.fullState.phase!=="lobby"||t.fullState.masterName!==e.name||!O(t,e.name,e.sessionId))return t;const n=I(t);return n.fullState=Me(n.fullState,e.action),E(n.fullState,e.name,"Mapa atualizado pelo mestre."),n}function Sn(t,e){return t.fullState.phase!=="running"||!O(t,e.name,e.sessionId)||!dt(t,e.name,e.actorName)?t:Mn(t,e.actorName,e.corridorId)}function wn(t,e){return t.fullState.phase!=="running"||!O(t,e.name,e.sessionId)||!dt(t,e.name,e.actorName)?t:En(t,e.actorName,e.targetName)}function In(t,e){return t.fullState.phase!=="game_over"||!O(t,e.name,e.sessionId)?t:Xt(t,e.name,`${e.name} voltou a sala para o lobby.`)}function kn(t,e){let n;try{n=JSON.parse(t)}catch{return e}switch(n.$){case"join_room":return dn(e,n);case"heartbeat":return fn(e,n);case"claim_master":return mn(e,n);case"unclaim_master":return _n(e,n);case"toggle_ready":return hn(e,n);case"set_random_map":return pn(e,n);case"set_random_fox":return bn(e,n);case"toggle_self_fox":return gn(e,n);case"start_game":return yn(e,n);case"lobby_chat_message":return vn(e,n);case"map_edit":return xn(e,n);case"submit_move":return Sn(e,n);case"select_kill_target":return wn(e,n);case"return_to_lobby":return In(e,n);default:return e}}function $n(t,e){const n=rt(t),o=t.filter(r=>r.seat==="participant").length;return{readyCount:n.filter(r=>r.ready).length,connectedParticipantCount:n.length,totalParticipantCount:o,allConnectedReady:n.length>=2&&n.every(r=>r.ready),foxName:e.foxName}}function Nn(t,e,n){const o=Re(n);return{room:t,selfName:e,phase:n.fullState.phase,masterName:n.fullState.masterName,players:o,lobbyState:n.fullState.phase==="lobby"?$n(o,n.fullState):null,publicState:n.fullState.phase==="lobby"?null:Rn(n.fullState,o),fullState:I(n.fullState),feed:[...n.fullState.feed]}}function Rn(t,e){const n={},o=Object.values(t.players).filter(r=>r.role==="hen"||r.role==="fox").sort((r,s)=>r.joinedAt-s.joinedAt).map(r=>r.name);for(const r of o){const s=t.players[r],a=s.locationRoomId,c=a?t.rooms[a]:null,u=a?Object.values(t.players).filter(f=>f.locationRoomId===a&&f.alive).map(f=>{const v=e.find(_=>_.name===f.name);return{name:f.name,color:f.color,role:f.role,alive:f.alive,connected:v?.connected??!1}}):[];n[r]={name:r,roomId:a,roomType:c?.type??null,playersHere:u,exits:a?Tn(t,a):[],alive:s.alive,connected:e.find(f=>f.name===r)?.connected??!1,canAct:t.currentTurnName===r}}return{phase:t.phase,round:t.round,currentTurnName:t.currentTurnName,screens:n,watchOrder:o,pendingKillTargets:[...t.pendingKillTargets]}}function Tn(t,e){return Object.values(t.corridors).flatMap(n=>n.fromRoomId===e&&n.toRoomId===e?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!0}]:n.fromRoomId===e?[{corridorId:n.id,angle:n.angleFrom,leadsToSelf:!1}]:n.toRoomId===e?[{corridorId:n.id,angle:n.angleTo,leadsToSelf:!1}]:[]).sort((n,o)=>n.angle-o.angle)}function Mn(t,e,n){if(t.fullState.phase!=="running"||t.fullState.currentTurnName!==e||t.fullState.pendingKillTargets.length>0)return t;const o=I(t),r=o.fullState.players[e];if(!r||!r.alive)return t;if(n===null)return o.fullState=se(o.fullState),o;const s=o.fullState.corridors[n];if(!s||!r.locationRoomId)return t;if(s.fromRoomId===r.locationRoomId&&s.toRoomId===r.locationRoomId)r.locationRoomId=s.toRoomId;else if(s.fromRoomId===r.locationRoomId)r.locationRoomId=s.toRoomId;else if(s.toRoomId===r.locationRoomId)r.locationRoomId=s.fromRoomId;else return t;if(r.role==="fox"){const a=Yt(o.fullState,r.locationRoomId);return a.length===0?(o.fullState=se(o.fullState),o):a.length===1?(o.fullState=ut(o.fullState,a[0]??""),o):(o.fullState.pendingKillTargets=a,o)}return o.fullState=se(o.fullState),o}function En(t,e,n){if(t.fullState.phase!=="running"||t.fullState.currentTurnName!==e||t.fullState.pendingKillTargets.length===0||!t.fullState.pendingKillTargets.includes(n))return t;const o=I(t);return o.fullState=ut(o.fullState,n),o}const mt="vibi-maze-name",_t="vibi-maze-room",ht="vibi-maze-session",Q=900,ee=660,An=200,On=2500,zn=4200,jn={$:"String"},ve=new URLSearchParams(window.location.search),l={roomInput:ve.get("room")??window.localStorage.getItem(_t)??"galinheiro-1",nameInput:ve.get("name")??window.localStorage.getItem(mt)??"",chatInput:"",followTurn:!0,watchName:null,revealFullMap:!1,selectedRoomId:null,connectSourceRoomId:null,dragRoomId:null,editorOpen:!1,toast:""};let U=null,ue="idle",xe=null,Se=null,R=Pn(),W=null,q=null,G=null,we=null,i=null,Ie="",$=null;const pt=document.querySelector("#app");if(!pt)throw new Error("Elemento #app nao encontrado.");const J=pt;J.addEventListener("submit",t=>{const e=t.target;if(e instanceof HTMLFormElement){if(e.dataset.form==="join"){t.preventDefault(),Un();return}e.dataset.form==="chat"&&(t.preventDefault(),ao())}});J.addEventListener("input",t=>{const e=t.target;(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)&&(e.name==="room"&&(l.roomInput=e.value),e.name==="name"&&(l.nameInput=e.value),e.name==="chat"&&(l.chatInput=e.value))});J.addEventListener("click",async t=>{const e=t.target;if(!(e instanceof HTMLElement))return;const n=e.closest("[data-action]");if(!n)return;const o=n.dataset.action;if(o)switch(o){case"claim-master":if(!i)return;M(N()?{$:"unclaim_master",name:i.selfName,sessionId:R}:{$:"claim_master",name:i.selfName,sessionId:R});break;case"toggle-ready":if(!i)return;M({$:"toggle_ready",name:i.selfName,sessionId:R});break;case"copy-link":await po();break;case"toggle-follow-turn":l.followTurn=!l.followTurn,l.followTurn&&(l.watchName=i?.publicState?.currentTurnName??i?.selfName??null),S();break;case"watch-screen":l.watchName=n.dataset.name??i?.selfName??null,l.followTurn=!1,S();break;case"reveal-full-map":l.revealFullMap=!0,S();break;case"random-map":if(!i)return;M({$:"set_random_map",name:i.selfName,sessionId:R,seed:nn()}),H(`Mapa aleatorio aplicado. Biblioteca: ${tn()} mapas.`);break;case"shuffle-fox":if(!i)return;M({$:"set_random_fox",name:i.selfName,sessionId:R,foxName:on(i.players,i.masterName)});break;case"toggle-self-fox":if(!i)return;M({$:"toggle_self_fox",name:i.selfName,sessionId:R});break;case"start-game":if(!i)return;M({$:"start_game",name:i.selfName,sessionId:R,seed:Vn()});break;case"back-to-lobby":if(!i)return;M({$:"return_to_lobby",name:i.selfName,sessionId:R});break;case"open-editor":yt();break;case"close-modal":vt();break;case"editor-add-room":K({type:"add_room"});break;case"editor-default":K({type:"set_default_map"});break;case"editor-connect":l.connectSourceRoomId=l.selectedRoomId,S();break;case"editor-cycle-type":if(!l.selectedRoomId)return;K({type:"cycle_room_type",roomId:l.selectedRoomId});break;case"editor-remove-room":if(!l.selectedRoomId)return;{const r=l.selectedRoomId;l.selectedRoomId=null,l.connectSourceRoomId=null,K({type:"remove_room",roomId:r})}break;case"editor-loop":if(!l.selectedRoomId)return;K({type:"toggle_loop",roomId:l.selectedRoomId});break;case"submit-pass":De(null);break;case"submit-move":De(n.dataset.corridorId??null);break;case"kill-target":lo(n.dataset.targetName??"");break}});window.addEventListener("keydown",t=>{const e=t.target,n=e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement||e instanceof HTMLSelectElement;if(t.key==="Escape"){if(l.editorOpen){vt();return}i&&(l.watchName=i.selfName,l.followTurn=!1,S());return}!n&&t.key.toLowerCase()==="m"&&i?.phase==="lobby"&&N()&&(t.preventDefault(),yt())});S();function Un(){const t=Qt(l.roomInput),e=Zt(l.nameInput);if(!t||!e){H("Informe room e nome.");return}l.roomInput=t,l.nameInput=e,window.localStorage.setItem(_t,t),window.localStorage.setItem(mt,e),xe=t,Se=e,R=gt(),Cn(),i=null,Ie="",we=null,$=null,Ee(),l.watchName=null,l.revealFullMap=!1,l.editorOpen=!1,l.selectedRoomId=null,l.connectSourceRoomId=null,l.dragRoomId=null,ue="connecting";const n={room:t,initial:cn(),on_tick:un,on_post:kn,packer:jn,tick_rate:6,tolerance:300},o=ho();o!==Ne&&(n.server=o),U=new Ft.game(n),U.on_sync(()=>{ue="connected",M({$:"join_room",name:e,sessionId:R}),Fn(),bt(),S()}),S()}function bt(){if(!U||!xe||!Se)return;we=U.compute_render_state(),i=Nn(xe,Se,we),Ln();const t=JSON.stringify(i);t!==Ie&&(Ie=t,S())}function Ln(){if(!i)return;const t=fe();t&&t.seat==="spectator"&&i.phase!=="lobby"&&(l.revealFullMap=!0),i.phase==="lobby"&&(l.revealFullMap=!1),i.phase!=="lobby"?l.followTurn?l.watchName=i.publicState?.currentTurnName??i.selfName:l.watchName||(l.watchName=i.selfName):l.watchName=i.selfName,l.editorOpen&&i.phase==="lobby"&&!l.dragRoomId&&($=I(i.fullState)),i.phase!=="lobby"&&(l.editorOpen=!1,$=null),i.phase==="game_over"?Bn():Ee()}function M(t){if(!U){H("Sem conexao com o VibiNet.");return}U.post(en(t))}function Fn(){W!==null&&window.clearInterval(W),q!==null&&window.clearInterval(q),W=window.setInterval(()=>{bt()},An),q=window.setInterval(()=>{i&&M({$:"heartbeat",name:i.selfName,sessionId:R})},On)}function Cn(){W!==null&&(window.clearInterval(W),W=null),q!==null&&(window.clearInterval(q),q=null),U?.close(),U=null,ue="closed",Ee()}function Bn(){G!==null||!i||(G=window.setTimeout(()=>{G=null,!(!i||i.phase!=="game_over")&&M({$:"return_to_lobby",name:i.selfName,sessionId:R})},zn))}function Ee(){G!==null&&(window.clearTimeout(G),G=null)}function Pn(){const t=window.sessionStorage.getItem(ht);return t||gt()}function gt(){const t=typeof crypto.randomUUID=="function"?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;return window.sessionStorage.setItem(ht,t),t}function Vn(){return Math.floor(Math.random()*4294967295)}function S(){if(!i){J.innerHTML=Kn();return}J.innerHTML=`
    <main class="app-shell phase-${i.phase}">
      ${Hn()}
      <section class="main-column">
        ${Dn()}
        ${i.phase==="lobby"?qn():Gn()}
      </section>
      <aside class="right-column">
        ${to()}
        ${no()}
      </aside>
      ${ro()}
    </main>
  `,io()}function Kn(){return`
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
            ${ue==="connecting"?"Conectando...":"Entrar"}
          </button>
        </form>
        ${l.toast?`<p class="toast">${p(l.toast)}</p>`:""}
      </section>
    </main>
  `}function Dn(){if(!i)return"";const t=i,e=t.lobbyState?`${t.lobbyState.readyCount}/${t.lobbyState.connectedParticipantCount} ready`:`Rodada ${t.publicState?.round??0}`,n=t.publicState?.currentTurnName?t.players.find(o=>o.name===t.publicState?.currentTurnName):null;return`
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${p(mo(t.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">${t.phase==="lobby"?"PRONTOS":"VEZ"}</p>
        <strong style="${n?`color:${n.color}`:""}">
          ${p(t.phase==="lobby"?e:n?.name??"Aguardando")}
        </strong>
      </div>
    </section>
  `}function Hn(){if(!i)return"";const t=fe(),e=l.watchName??i.selfName;return`
    <aside class="left-sidebar">
      <section class="panel compact-stack">
        <div class="mini-metric">
          <span>Ping</span>
          <strong>${Math.round(U?.ping?.()??0)} ms</strong>
        </div>
        <button class="btn btn-secondary btn-block" data-action="copy-link" type="button">Copiar link</button>
        ${i.phase==="lobby"?`
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
          <span class="tag">${i.players.length}</span>
        </div>
        <ul class="roster">
          ${i.players.map(n=>Wn(n,e)).join("")}
        </ul>
      </section>
    </aside>
  `}function Wn(t,e){const n=t.name===i?.selfName,o=t.name===e,r=!!(i?.phase!=="lobby"&&i?.publicState?.screens[t.name]),s=`
    <span class="legend-color" style="background:${t.color}"></span>
    <div class="roster-copy">
      <strong>${p(t.name)}</strong>
      <div class="helper">
        ${p(xt(t.role))} • ${t.connected?"online":"offline"}
      </div>
    </div>
    <span class="tag">${t.ready&&i?.phase==="lobby"?"ready":t.alive?"vivo":t.seat==="spectator"?"spec":"fora"}</span>
  `;return r?`
    <li>
      <button
        class="roster-item roster-button ${n?"is-self":""} ${o?"is-active":""}"
        data-action="watch-screen"
        data-name="${p(t.name)}"
        type="button"
      >
        ${s}
      </button>
    </li>
  `:`<li class="roster-item ${n?"is-self":""} ${o?"is-active":""}">${s}</li>`}function qn(){if(!i)return"";const t=N();return`
    <section class="lobby-layout">
      <section class="panel stack spacious">
        <div class="panel-header">
          <div>
            <h2 class="section-title">Lobby da sala</h2>
            <p class="helper">
              ${p(i.room)} • ${i.lobbyState?.readyCount??0}/${i.lobbyState?.connectedParticipantCount??0} ready
            </p>
          </div>
          <span class="tag">${p(i.masterName??"sem mestre")}</span>
        </div>
        <div class="lobby-summary-grid">
          <div class="metric-card">
            <span>Mestre</span>
            <strong>${p(i.masterName??"ninguem")}</strong>
          </div>
          <div class="metric-card">
            <span>Raposa</span>
            <strong>${p(i.fullState.foxName??"nao escolhida")}</strong>
          </div>
          <div class="metric-card">
            <span>Participantes</span>
            <strong>${i.lobbyState?.connectedParticipantCount??0}</strong>
          </div>
          <div class="metric-card">
            <span>Inicio</span>
            <strong>${i.lobbyState?.allConnectedReady?"automatico":"aguardando"}</strong>
          </div>
        </div>
        <div class="panel-note">
          ${N()?"Voce e o mestre. Use o botao ou aperte M para abrir o editor do mapa.":"O mapa fica oculto no lobby para jogadores normais. Aqui voce organiza papeis, ready e conversa antes da partida."}
        </div>
        ${t?`
              <svg class="editor-map readonly" viewBox="0 0 ${Q} ${ee}">
                ${Ae(i.fullState,!1)}
              </svg>
            `:`
              <div class="fog-card">
                <div class="fog-copy">
                  <p class="eyebrow">Fog Of War</p>
                  <h3>Mapa oculto</h3>
                  <p class="helper">So o mestre enxerga a pre-visualizacao do labirinto no lobby.</p>
                </div>
              </div>
            `}
      </section>
    </section>
  `}function Gn(){return`
    <section class="game-layout">
      ${i?.phase==="game_over"?Jn():""}
      <section class="panel spacious">
        ${uo()?Xn():Zn()}
      </section>
    </section>
  `}function Jn(){if(!i||i.phase!=="game_over")return"";const t=i.fullState.winner,e=t==="fox"?"A raposa venceu":t==="hens"?"As galinhas venceram":"Partida encerrada",n=t==="fox"?"fox":t==="hens"?"hens":"neutral",o=t==="fox"?"Todas as galinhas foram capturadas.":t==="hens"?`O limite de ${i.fullState.henOrder.length*10} rodadas foi ultrapassado.`:"A partida foi encerrada.";return`
    <section class="panel result-panel ${n}">
      <div class="result-copy">
        <p class="eyebrow">Fim da partida</p>
        <h2 class="result-title">${p(e)}</h2>
        <p class="result-text">${p(o)}</p>
        <p class="helper">Voltando para o lobby da sala em instantes.</p>
      </div>
      <button class="btn btn-primary" data-action="back-to-lobby" type="button">Voltar agora</button>
    </section>
  `}function Xn(){return i?`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${N()?"Mapa completo":"Visao completa"}</h2>
          <p class="helper">
            ${N()?"Como mestre, voce enxerga o labirinto inteiro.":"Voce liberou o mapa completo para assistir."}
          </p>
        </div>
        ${i.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${Q} ${ee}">
        ${Ae(i.fullState,!1)}
      </svg>
      ${Yn()}
    </section>
  `:'<div class="empty-panel"><h2>Sem mapa completo</h2></div>'}function Yn(){return i?`
    <div class="legend-grid">
      ${i.players.map(t=>`
          <div class="legend-chip">
            <span class="legend-color" style="background:${t.color}"></span>
            <strong>${p(t.name)}</strong>
            <span>${p(xt(t.role))}</span>
          </div>
        `).join("")}
    </div>
  `:""}function Zn(){if(!i?.publicState)return'<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';const t=l.watchName??i.selfName,e=i.publicState.screens[t]??null,n=i.fullState.players[i.selfName],o=!!(n&&!n.alive&&n.seat==="participant"&&!l.revealFullMap);if(!e)return`
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${o?'<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
        ${i.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
    `;const s=Oe()===t,a=s&&i.publicState.pendingKillTargets.length===0,c=s&&i.publicState.pendingKillTargets.length>0;return`
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${p(e.name)}</h2>
          <p class="helper">
            ${p(e.roomType?`Sala ${ze(e.roomType)}`:"Sem posicao visivel")}
          </p>
        </div>
        <div class="button-row tight">
          ${o?'<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>':""}
          ${i.phase==="game_over"?'<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
        </div>
      </div>
      ${eo(e,a)}
      ${c?Qn(i.publicState.pendingKillTargets):`
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${a?"":"disabled"}>Passar</button>
            </div>
          `}
    </section>
  `}function Qn(t){return`
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
  `}function eo(t,e){const n=_o(t.exits);return`
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${p(t.roomType?ze(t.roomType):"Sem sala")}</div>
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
          ${t.playersHere.map(o=>so(o.name,o.color)).join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${t.playersHere.length||0}</p>
        <p><strong>Saidas:</strong> ${t.exits.map(o=>`${o.angle}°`).join(", ")||"nenhuma"}</p>
      </div>
    </section>
  `}function to(){if(!i)return"";const t=fe(),e=t?.role==="fox"?"Deixar de ser raposa":"Ser raposa";return i.phase==="lobby"?`
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Acoes do lobby</h2>
          <span class="tag">${i.lobbyState?.allConnectedReady?"auto start":"manual"}</span>
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
        <span class="tag">${i.publicState?.round??0}</span>
      </div>
      <p class="metric"><strong>Na tela:</strong> ${p(l.watchName??i.selfName)}</p>
      <p class="metric"><strong>Turno:</strong> ${p(i.publicState?.currentTurnName??"Aguardando")}</p>
      <div class="action-stack">
        <button class="btn btn-secondary btn-block" data-action="toggle-follow-turn" type="button">
          ${l.followTurn?"Parar de acompanhar a vez":"Acompanhar a vez"}
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="reveal-full-map"
          type="button"
          ${fo()?"":"disabled"}
        >
          Ficar de espectador
        </button>
        ${i.phase==="game_over"?'<button class="btn btn-primary btn-block" data-action="back-to-lobby" type="button">Voltar ao lobby</button>':""}
      </div>
      ${l.toast?`<p class="toast">${p(l.toast)}</p>`:""}
    </section>
  `}function no(){return i?`
    <section class="panel stack feed-panel">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Chat e log</h2>
          <p class="helper">Mensagens digitadas e avisos do sistema ficam juntos, com estilos diferentes.</p>
        </div>
      </div>
      <div class="feed-list">
        ${i.feed.length>0?i.feed.map(t=>oo(t)).join(""):'<div class="empty-panel feed-empty">Sem mensagens ainda.</div>'}
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
  `:""}function oo(t){const e=t.kind==="chat"&&t.actorName&&t.actorName===i?.selfName;return t.kind==="system"?`
      <article class="feed-entry system">
        <p class="feed-line"><strong>sistema</strong> - ${p(t.text)}</p>
      </article>
    `:`
    <article class="feed-entry chat ${e?"is-self":""}">
      <p class="feed-line"><strong>${p(t.actorName??"anon")}</strong> - ${p(t.text)}</p>
    </article>
  `}function ro(){if(!l.editorOpen||!$||!i||!N())return"";const t=l.selectedRoomId?$.rooms[l.selectedRoomId]:null;return`
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
        <svg class="editor-map" data-editor-svg viewBox="0 0 ${Q} ${ee}">
          ${Ae($,!0)}
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
  `}function Ae(t,e){const n=new Map;for(const o of Object.values(t.players))o.locationRoomId&&(n.has(o.locationRoomId)||n.set(o.locationRoomId,[]),n.get(o.locationRoomId)?.push({name:o.name,color:o.color}));return`
    ${Object.values(t.corridors).map(o=>{const r=t.rooms[o.fromRoomId],s=t.rooms[o.toRoomId];return!r||!s?"":r.id===s.id?`
            <path
              class="corridor-loop"
              d="M ${r.x} ${r.y-44} C ${r.x+48} ${r.y-120}, ${r.x-48} ${r.y-120}, ${r.x} ${r.y-44}"
            />
          `:`
          <line
            class="corridor-line"
            x1="${r.x}"
            y1="${r.y}"
            x2="${s.x}"
            y2="${s.y}"
          />
        `}).join("")}
    ${Object.values(t.rooms).map(o=>{const r=e&&l.selectedRoomId===o.id,s=e&&l.connectSourceRoomId===o.id,a=n.get(o.id)??[];return`
          <g
            ${e?`data-room-node="${p(o.id)}"`:""}
            class="room-node ${r?"selected":""} ${s?"armed":""}"
            transform="translate(${o.x}, ${o.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${o.type}" />
            <text class="room-title" text-anchor="middle" y="4">${p(o.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${p(ze(o.type))}</text>
            ${a.map((c,u)=>`
                <circle cx="${-18+u*18}" cy="-12" r="6" fill="${c.color}" />
              `).join("")}
          </g>
        `}).join("")}
  `}function so(t,e){return`
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
  `}function io(){const t=J.querySelector("[data-editor-svg]");if(!t||!l.editorOpen||!$||!i||i.phase!=="lobby"||!N())return;const e=n=>{const o=t.getBoundingClientRect(),r=(n.clientX-o.left)/o.width*Q,s=(n.clientY-o.top)/o.height*ee;return{x:Math.max(60,Math.min(Q-60,r)),y:Math.max(60,Math.min(ee-60,s))}};t.onpointerdown=n=>{const o=n.target;if(!(o instanceof SVGElement))return;const s=o.closest("[data-room-node]")?.dataset.roomNode;if(s){if(l.connectSourceRoomId&&l.connectSourceRoomId!==s){const a=l.connectSourceRoomId;l.connectSourceRoomId=null,K({type:"toggle_corridor",leftRoomId:a,rightRoomId:s});return}if(l.connectSourceRoomId===s){l.connectSourceRoomId=null,S();return}l.selectedRoomId=s,l.dragRoomId=s,S(),t.setPointerCapture(n.pointerId)}},t.onpointermove=n=>{if(!l.dragRoomId||l.connectSourceRoomId||!$)return;const o=e(n);$=Me($,{type:"move_room",roomId:l.dragRoomId,x:o.x,y:o.y}),S()},t.onpointerup=()=>{if(!l.dragRoomId||!$)return;const n=$.rooms[l.dragRoomId],o=l.dragRoomId;l.dragRoomId=null,n?K({type:"move_room",roomId:o,x:n.x,y:n.y}):S()}}function yt(){!i||i.phase!=="lobby"||!N()||(l.editorOpen=!0,l.selectedRoomId=null,l.connectSourceRoomId=null,$=I(i.fullState),S())}function vt(){l.editorOpen=!1,l.dragRoomId=null,l.selectedRoomId=null,l.connectSourceRoomId=null,$=null,S()}function K(t,e=!0){!i||i.phase!=="lobby"||!N()||!$||($=Me($,t),M({$:"map_edit",name:i.selfName,sessionId:R,action:t}),e&&S())}function ao(){if(!i)return;const t=l.chatInput.trim();t&&(M({$:"lobby_chat_message",name:i.selfName,sessionId:R,text:t}),l.chatInput="",S())}function De(t){if(!i)return;const e=Oe();e&&M({$:"submit_move",name:i.selfName,sessionId:R,actorName:e,corridorId:t})}function lo(t){if(!i||!t)return;const e=Oe();e&&M({$:"select_kill_target",name:i.selfName,sessionId:R,actorName:e,targetName:t})}function Oe(){return i?.publicState?.currentTurnName?co()?i.selfName:N()?i.publicState.currentTurnName:null:null}function co(){return i?.publicState?.currentTurnName?i.publicState.currentTurnName===i.selfName:!1}function uo(){if(!i)return!1;if(N())return!0;const t=i.fullState.players[i.selfName];return fe()?.seat==="spectator"&&i.phase!=="lobby"?!0:!!(t&&!t.alive&&l.revealFullMap)}function fo(){if(!i)return!1;const t=i.fullState.players[i.selfName];return!!(t&&!t.alive&&t.seat==="participant"&&!l.revealFullMap)}function fe(){return i?.players.find(t=>t.name===i?.selfName)??null}function N(){return!!(i&&i.masterName===i.selfName)}function xt(t){switch(t){case"master":return"mestre";case"fox":return"raposa";case"hen":return"galinha";case"spectator":return"espectador";default:return"galinha"}}function mo(t){switch(t){case"lobby":return"lobby";case"running":return"partida";case"game_over":return"fim da partida";default:return t}}function ze(t){return t==="shop"?"loja":"normal"}function _o(t){const e=[...t].sort((r,s)=>r.angle-s.angle);let n=-999,o=0;return e.map(r=>{Math.abs(r.angle-n)<18?o+=1:o=0,n=r.angle;const s=r.angle*Math.PI/180,a=40+o*9,c=28+o*7,u=50+Math.cos(s)*a,f=50+Math.sin(s)*c;return{corridorId:r.corridorId,angle:r.angle,left:u,top:f}})}function ho(){const t=ve.get("server")??void 0;return t||Ne}async function po(){if(!i)return;const t=new URL(window.location.href);t.searchParams.set("room",i.room);const e=t.toString();try{await navigator.clipboard.writeText(e),H("Link da room copiado.")}catch{H(e)}}function H(t){l.toast=t,S(),window.clearTimeout(H.timer),H.timer=window.setTimeout(()=>{l.toast="",S()},2600)}function p(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
