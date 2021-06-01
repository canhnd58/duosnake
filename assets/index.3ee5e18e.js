var t=Object.defineProperty,e=Object.defineProperties,s=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,r=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable,h=(e,s,i)=>s in e?t(e,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[s]=i;const n=0,o=1,d=2,c=3,l=[0,1,-1,0],u=[-1,0,0,1];var g=Object.freeze({__proto__:null,[Symbol.toStringTag]:"Module",RELEASE:!0,CELL_SNAKE_HEAD:n,CELL_SNAKE_BODY:o,CELL_FOOD:d,CELL_CORPSE:c,DIRECTION_UP:0,DIRECTION_RIGHT:1,DIRECTION_LEFT:2,DIRECTION_DOWN:3,DIRECTION_DIFF_X:l,DIRECTION_DIFF_Y:u,GAME_MODE_CASUAL:0,GAME_MODE_CLASSIC:1,SNAKE_TYPE_CASUAL:0,SNAKE_TYPE_CLASSIC:1});const p=t=>Math.round(1e4*(t+Number.EPSILON))/1e4,b=[1,2],m=/^rgba\((\d+),[ ]?(\d+),[ ]?(\d+), [ ]?[\d\.]+\)$/,w=/^rgb\((\d+),[ ]?(\d+),[ ]?(\d+)\)$/,y=t=>{let e=m.exec(t);return e?{r:parseInt(e[1]),g:parseInt(e[2]),b:parseInt(e[3]),a:parseFloat(e[4])}:(e=w.exec(t),e?{r:parseInt(e[1]),g:parseInt(e[2]),b:parseInt(e[3]),a:1}:void 0)},v=({r:t,g:e,b:s,a:i})=>`rgba(${t},${e},${s},${i})`,f=t=>({w:t.width,h:t.height}),E=(t,e,s)=>{(t=>{const{w:e,h:s}=f(t);t.getContext("2d").clearRect(0,0,e,s)})(t);const i=t.getContext("2d");i.save(),i.globalCompositeOperation="color",e.getDim();for(let r=0;r<e.w;r++)for(let i=0;i<e.h;i++)I(t,e,{x:r,y:i},s);i.restore()},I=(t,e,{x:s,y:i},r)=>{const{w:a,h:h}=e.getDim(),{w:n,h:o}=f(t),d=n/a,c=o/h,l={x:s*d,y:i*c,w:d,h:c},u=e.at({x:s,y:i});u.getTypes().forEach((e=>{u.getOwnerIds(e).map((t=>r.get(e,t))).forEach((e=>k(t,l,e)))}))},k=(t,e,s)=>{t.getContext("2d").drawImage(s,e.x,e.y,e.w,e.h)},O={[d]:1},S=class{constructor(){this.body=[],this.stomach=0,this.dead=!1}prepare(){}toDebugStr(){return`${this.id}: ${this.body.length}(len)`}getHead(){return this.body[0]}getTail(){return this.body[this.body.length-1]}setDirection(t){return this.direction!=t&&this.direction+t!=3&&(this.direction=t,!0)}adjustStomach(t){this.stomach+=t,this.stomach=p(this.stomach)}move(){const t=this.getHead();this.board.at(t).remove(n,this.id),this.body.length>1&&this.board.at(t).add(o,this.id);const e=this.getNewPos(t,this.direction);this.board.at(e).add(n,this.id),this.body.unshift(e)}grow(){if(this.stomach<1){const t=this.getTail();this.board.at(t).remove(o,this.id,1),this.body.pop()}else this.adjustStomach(-1)}eat(){const t=this.board.at(this.getHead());this.adjustStomach((t.get(d,this.id)+t.get(d,this.board.getNoOwnerId()))*O[d])}bite(){const t=this.board.at(this.getHead());(t.get(n)>t.get(n,this.id)||t.get(o)>0)&&(this.dead=!0)}getNewPos({x:t,y:e},s){const{w:i,h:r}=this.board.getDim();return{x:(t+i+l[s])%i,y:(e+r+u[s])%r}}},j={[d]:1,[c]:.25},C={[d]:.1,[c]:.01,[o]:.4},T=class extends S{constructor(){super(),this.love={}}prepare(){super.prepare(),this.love[this.id]=.3}toDebugStr(){const t=Object.keys(this.love).map((t=>`${this.love[t].toString().padStart(5)}(love-${t})`)).join(" ")||"";return`${super.toDebugStr()} ${t}`}getLove(t){return this.love[t]||0}adjustLove(t,e){this.love[t]=this.getLove(t)+e,this.love[t]=Math.min(1,this.love[t]),this.love[t]=Math.max(-1,this.love[t]),this.love[t]=p(this.love[t])}eat(t){if(null==t)return void[d,c].forEach((t=>this.eat(t)));const e=this.board.at(this.getHead()),s=e.getAndGroup(t,[this.board.getNoOwnerId(),this.id]);this.adjustStomach((s[this.board.getNoOwnerId()]+s[this.id]+2*s.other)*j[t]),this.board.getOtherSnakes(this.id).forEach((s=>{s.adjustLove(this.id,-C[t]*e.get(t,s.id)*5),s.adjustLove(this.id,C[t]*e.get(t,this.id))})),this.adjustLove(this.id,-e.get(t)*C[t]),this.board.getOtherSnakes(this.id).forEach((s=>{s.adjustLove(s.id,e.get(t)*C[t]/(this.board.snakes.length-1||1))}))}bite(t){if(null==t)return void[n,o].forEach((t=>this.bite(t)));const e=this.board.at(this.getHead());this.board.snakes.filter((e=>t!=n||e.id!=this.id)).filter((s=>e.get(t,s.id)>0)).filter((t=>this.getLove(t.id)<0)).forEach((s=>{const i=s.indexOf(this.getHead(),s.id==this.id?1:0);s.turnIntoCorpse(i+1),t==o&&(e.remove(o,s.id,1),s.body.pop()),s.adjustLove(this.id,5*-C[o])}))}isStealing(t){return t!=this.id&&t!=this.board.getNoOwnerId()}indexOf({x:t,y:e},s=0){return this.body.findIndex(((i,r)=>r>=s&&i.x==t&&i.y==e))}turnIntoCorpse(t){for(let e=t;e<this.body.length;e++){const t=this.body[e];this.board.at(t).add(c,this.id),this.board.at(t).remove(o,this.id,1)}this.body.splice(t)}},x={1:1,0:0},_=class{constructor(t){this.keyCtrl=t,this.directionQueue=[]}join(t,e){this.snake=(t=>{switch(t){case 1:return new S;case 0:return new T}})(x[e]),t.addSnake(this.snake)}move(){for(;this.directionQueue.length>0&&!this.snake.setDirection(this.directionQueue[0]);)this.directionQueue.shift()}handleKeyEvents(t){if(Object.keys(this.keyCtrl).includes(t.key)){const e=this.keyCtrl[t.key];this.directionQueue.push(e)>4&&this.directionQueue.shift()}}},D=["rgb(244, 208, 63)","rgb(30, 130, 76)","rgb(214, 69, 65)"],L=[{w:0,s:3,a:2,d:1},{o:0,l:3,k:2,";":1}];window.onload=()=>{const t=document.getElementById("playground");t.width=2*t.clientWidth,t.height=2*t.clientHeight;const p=new class{constructor(t,e){this.canvas=t,this.mode=e,this.player_1=new _(L[0]),this.player_2=new _(L[1]),this.quit=!1,this.reset(),this.pauseHandler=this.pause.bind(this),this.unpauseHandler=this.unpause.bind(this),this.keydownHandler=this.handleKeyEvents.bind(this),window.addEventListener("focus",this.unpauseHandler),window.addEventListener("blur",this.pauseHandler),window.addEventListener("keydown",this.keydownHandler),this.animationRequestId=null}finalize(){this.quit=!0,window.removeEventListener("focus",this.unpauseHandler),window.removeEventListener("blur",this.pauseHandler),window.removeEventListener("keydown",this.keydownHandler)}reset(){this.board=new class{constructor(t,e){this.w=t,this.h=e,this.reset()}reset(){this.cells=new Array(this.w*this.h).fill().map((()=>new class{constructor(){this.objs={}}empty(){return 0==Object.keys(this.objs).length}add(t,e=0,s=1){const i=this.toKey(t,e);return this.objs[i]=this.objs[i]+s||s,this}remove(t,e,s){if(null==e)return this.getOwnerIds(t).forEach((e=>this.remove(t,e,s))),this;const i=this.toKey(t,e);return void 0!==this.objs[i]&&(this.objs[i]-=null!=s?s:this.objs[i]),this.objs[i]<=0&&delete this.objs[i],this}clear(){this.objs={}}get(t,e){if(null==e)return this.getOwnerIds(t).map((e=>this.get(t,e))).reduce(((t,e)=>t+e),0);const s=this.toKey(t,e);return this.objs[s]||0}getAndGroup(t,n){return n.reduce(((n,o)=>{return d=((t,e)=>{for(var s in e||(e={}))r.call(e,s)&&h(t,s,e[s]);if(i)for(var s of i(e))a.call(e,s)&&h(t,s,e[s]);return t})({},n),c={[o]:this.get(t,o)},e(d,s(c));var d,c}),{other:this.getOwnerIds(t).filter((t=>!n.includes(t))).map((e=>this.get(t,e))).reduce(((t,e)=>t+e),0)})}getOwnerIds(t){return Object.keys(this.objs).filter((e=>null==t||this.toType(e)==t)).map((t=>this.toOwnerId(t)))}getTypes(){return Object.keys(this.objs).map((t=>this.toType(t)))}toType(t){return Math.floor(parseInt(t)/10)}toOwnerId(t){return parseInt(t)%10}toKey(t,e){return 10*t+e}})),this.snakes=[]}getDim(){return{w:this.w,h:this.h}}at({x:t,y:e}){return this.cells[e*this.w+t]}put({x:t,y:e},s){this.cells[e*this.w+t]=s}generate(t,e){if(null==e)return void[this.getNoOwnerId(),...this.snakes.map((t=>t.id))].forEach((e=>this.generate(t,e)));const s=this.cells.map(((t,e)=>({cell:t,idx:e}))).filter((t=>t.cell.empty())).map((t=>t.idx));if(0==s.length)return;const i=s[Math.floor(Math.random()*s.length)];this.cells[i].add(t,e)}addSnake(t){if(this.snakes.length>=2)return;t.board=this,t.id=this.snakes.length+1;const e=b[this.snakes.length];t.setDirection(e);const{w:s,h:i}=this.getDim(),r={};switch(e){case 2:r.x=s-1-Math.trunc(s/8),r.y=i-1-Math.trunc(i/3);break;case 3:r.x=s-1-Math.trunc(s/3),r.y=Math.trunc(i/8);break;case 0:r.x=Math.trunc(s/3),r.y=i-1-Math.trunc(i/8);break;default:r.x=Math.trunc(s/8),r.y=Math.trunc(i/3)}this.at(r).add(n,t.id),t.body.push(r);let{x:a,y:h}=r;for(;t.body.length<3&&a>0&&a<s-1&&h>0&&h<i-1;)a-=l[e],h-=u[e],this.at({x:a,y:h}).add(o,t.id),t.body.push({x:a,y:h});t.prepare(),this.snakes.push(t)}getSnake(t){return this.snakes[t-1]}getOtherSnakes(t){return this.snakes.filter((e=>e!=this.getSnake(t)))}getNoOwnerId(){return 0}tick(){var t;this.snakes.forEach((t=>t.move())),this.snakes.forEach((t=>t.eat())),this.snakes.forEach((t=>t.grow())),this.snakes.forEach((t=>t.bite())),this.snakes.map((t=>this.at(t.getHead()))).forEach((t=>{t.getOwnerIds(d).forEach((t=>this.generate(d,t))),[d,c].forEach((e=>t.remove(e)))})),t=this.snakes.map((t=>t.toDebugStr())).join("   ---   "),window.DEBUG&&console.log(t)}}(45,27),this.palette=new class{constructor(t){this.colors=t,this.caches={}}getCacheKey(t,e){return t+"-"+e}clearCache(){this.caches={}}get(t,e){const s=this.getCacheKey(t,e),i=this.caches[s]?this.caches[s]:this.create(t,this.colors[e]);return this.caches[s]=i,i}create(t,e){switch(t){case n:return this.createSnakeHead(e);case o:return this.createSnakeBody(e);case c:return this.createCorpse(e);case d:return this.createFood(e)}}createSnakeHead(t){const e=this.createCanvas({w:64,h:64}),s=e.getContext("2d"),i=new Path2D("M 2,2 h 60 v 60 h -60 Z"),{r:r,g:a,b:h,a:n}=y(t);return s.fillStyle=v({r:r,g:a,b:h,a:n-.2}),s.fill(i),e}createSnakeBody(t){const e=this.createCanvas({w:64,h:64}),s=e.getContext("2d"),i=new Path2D("M 2,2 h 60 v 60 h -60 Z"),{r:r,g:a,b:h,a:n}=y(t);return s.fillStyle=v({r:r,g:a,b:h,a:n-.5}),s.fill(i),e}createCorpse(t){const e=this.createCanvas({w:64,h:64}),s=e.getContext("2d"),{r:i,g:r,b:a,a:h}=y(t);return s.fillStyle=v({r:i,g:r,b:a,a:h-.2}),s.arc(32,32,15,0,2*Math.PI,!0),s.fill(),e}createFood(t){const e=this.createCanvas({w:64,h:64}),s=e.getContext("2d"),{r:i,g:r,b:a,a:h}=y(t);return s.fillStyle=v({r:i,g:r,b:a,a:h-.2}),s.arc(32,32,30,0,2*Math.PI,!0),s.fill(),e}createCanvas({w:t,h:e}){const s=document.createElement("canvas");return s.width=t,s.height=e,s}}(D),this.player_1.join(this.board,this.mode),this.player_2.join(this.board,this.mode),E(this.canvas,this.board,this.palette),this.speed=4,this.lastMove=0,this.startTime=null,this.pauseTime=null,this.unpauseTime=null,this.animationRequestId&&window.cancelAnimationFrame(this.animationRequestId)}start(){null==this.startTime&&(this.board.generate(d),this.loop())}loop(){const t=()=>{if(this.quit||this.pausing())return void window.cancelAnimationFrame(this.animationRequestId);this.gameover()&&(this.reset(),this.start()),null==this.startTime&&(this.startTime=performance.now());const e=performance.now()-this.startTime,s=this.unpauseTime-this.pauseTime||0,i=this.lastMove+s+1e3/this.speed;e>=i&&(this.player_1.move(),this.player_2.move(),this.board.tick(),this.lastMove=i,this.pauseTime=null,this.unpauseTime=null),E(this.canvas,this.board,this.palette),this.animationRequestId=window.requestAnimationFrame(t)};this.animationRequestId=window.requestAnimationFrame(t)}gameover(){return this.board.snakes.some((t=>t.dead))}pausing(){return null!=this.pauseTime&&(null==this.unpauseTime||this.unpauseTime<=this.pauseTime)}pause(){this.pauseTime=performance.now(),console.log("pause")}unpause(){null!=this.pauseTime&&(this.unpauseTime=performance.now(),this.loop(),console.log("unpause"))}handleKeyEvents(t){this.player_1.handleKeyEvents(t),this.player_2.handleKeyEvents(t)}}(t,0);p.start(),Object.keys(g).forEach((t=>window[t]=g[t])),window.game=p};