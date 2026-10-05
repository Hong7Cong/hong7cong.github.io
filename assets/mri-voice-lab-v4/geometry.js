(function(root){
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let motion=null;
const neutral=()=>({tipX:0,tipY:0,dorsumX:0,dorsumY:0,rootX:0,rootY:0,lipGap:0,lipForward:0,jaw:0,velum:0,larynx:0});
const tongueNames=['tip','dorsum','root'];
function setMotion(data){motion=data;}
function bendWeights(point,frame,derivative=false){const b=frame.bend,out=derivative?[[0,0],[0,0],[0,0]]:[0,0,0],s2=b.sigma*b.sigma;for(let i=0;i<b.centers.length;i++){const dx=point[0]-b.centers[i][0],dy=point[1]-b.centers[i][1],g=Math.exp(-(dx*dx+dy*dy)/(2*s2));for(let j=0;j<3;j++){const w=g*b.weights[i][j];if(derivative){out[j][0]-=w*dx/s2;out[j][1]-=w*dy/s2;}else out[j]+=w;}}return out;}
function deform(point,organ,p,frame){let [x,y]=point;
 if(organ===2&&frame){const w=bendWeights(point,frame);for(let j=0;j<3;j++){x+=w[j]*p[tongueNames[j]+'X'];y+=w[j]*p[tongueNames[j]+'Y'];}}
 if(organ===1){const a=-p.jaw*Math.PI/180,dx=x-55,dy=y-78;x=55+Math.cos(a)*dx-Math.sin(a)*dy;y=78+Math.sin(a)*dx+Math.cos(a)*dy;}
 if(organ===0||organ===1){const w=Math.exp(-Math.pow((point[0]-22)/8,2)-Math.pow((point[1]-53)/14,2));x-=p.lipForward*w;y+=(organ===0?-1:1)*p.lipGap*.5*w;}
 if(organ===3)y+=p.velum*clamp((x-36)/14,0,1);
 if(organ===4)y+=p.larynx;
 if(organ===5)y+=p.larynx*clamp((y-68)/15,0,1)*.5;
 return [x,y];}
function catmull(points,closed=true){if(points.length<2)return '';const n=points.length,fmt=p=>p.map(v=>v.toFixed(3)).join(' ');let d='M'+fmt(points[0]);for(let i=0;i<(closed?n:n-1);i++){const a=points[closed?(i-1+n)%n:Math.max(0,i-1)],b=points[i],c=points[(i+1)%n],e=points[closed?(i+2)%n:Math.min(n-1,i+2)];const c1=b.map((v,k)=>v+(c[k]-a[k])/6),c2=c.map((v,k)=>v-(e[k]-b[k])/6);d+=' C'+fmt(c1)+' '+fmt(c2)+' '+fmt(c);}return d+(closed?' Z':'');}
function model(frame,p,scale=2.4,depth=2.4){const organs=frame.organs.slice(0,6).map((polys,j)=>polys.map(poly=>poly.map(pt=>deform(pt,j,p,frame))));const out={organs,valid:false,edited:Object.keys(neutral()).some(k=>Math.abs(p[k])>1e-5),reason:frame.geometry.reason||''};
 if(!frame.geometry.valid)return out;
 const g=frame.geometry,original=g.smooth_cuts||g.cuts;
 const cuts=original.map((cut,i)=>cut.map((pt,side)=>deform(pt,g.owners[i][side],p,frame)));
 // Smooth displacement only, preserving the zero-edit baseline and avoiding ownership seams.
 const delta=cuts.map((cut,i)=>cut.map((pt,s)=>pt.map((v,k)=>v-original[i][s][k])));
 for(let i=0;i<44;i++)for(let s=0;s<2;s++)for(let k=0;k<2;k++){let sum=0,w=0;for(let j=-2;j<=2;j++){const n=clamp(i+j,0,43),a=Math.exp(-j*j/2);sum+=delta[n][s][k]*a;w+=a;}cuts[i][s][k]=original[i][s][k]+sum/w;}
 const centers=cuts.map(c=>[(c[0][0]+c[1][0])/2,(c[0][1]+c[1][1])/2]);
 const widths=[],rawAreas=[];let closed=false,minClearancePx=Infinity;
 for(let i=0;i<44;i++){const v=cuts[i][0].map((x,k)=>x-cuts[i][1][k]),base=original[i][0].map((x,k)=>x-original[i][1][k]);const projection=(v[0]*base[0]+v[1]*base[1])/Math.hypot(...base);minClearancePx=Math.min(minClearancePx,projection);if(projection<=.25)closed=true;widths.push(Math.max(.015,projection*scale/10));rawAreas.push(Math.hypot(...base)*scale/10*depth);}
 let lengthPx=0;for(let i=1;i<44;i++)lengthPx+=Math.hypot(centers[i][0]-centers[i-1][0],centers[i][1]-centers[i-1][1]);lengthPx*=44/43;
 return {...out,cuts,centers,widths,rawAreas,areas:widths.map(w=>w*depth),length:lengthPx*scale/10,minClearancePx,valid:!closed,reason:closed?'Edited airway walls touch or cross; synthesis muted.':''};}
const handleDefs={tip:{label:'Tip',organ:2,keys:['tipX','tipY']},dorsum:{label:'Dorsum',organ:2,keys:['dorsumX','dorsumY']},root:{label:'Root',organ:2,keys:['rootX','rootY']},lips:{label:'Lips',organ:1,keys:['lipForward','lipGap']},jaw:{label:'Jaw',organ:1,keys:['jaw']},velum:{label:'Velum',organ:3,keys:['velum']},larynx:{label:'Larynx',organ:4,keys:['larynx']}};
function handlePosition(name,p,frame){const h=handleDefs[name];return deform(frame.handles[name],h.organ,p,frame);}
function inHull(point,hull){for(let i=0;i<hull.length;i++){const a=hull[i],b=hull[(i+1)%hull.length];if((b[0]-a[0])*(point[1]-a[1])-(b[1]-a[1])*(point[0]-a[0])<-.0002)return false;}return true;}
function projectHull(point,hull){if(inHull(point,hull))return point;let best=Infinity,result;for(let i=0;i<hull.length;i++){const a=hull[i],b=hull[(i+1)%hull.length],v=[b[0]-a[0],b[1]-a[1]],t=clamp(((point[0]-a[0])*v[0]+(point[1]-a[1])*v[1])/(v[0]*v[0]+v[1]*v[1]),0,1),q=[a[0]+v[0]*t,a[1]+v[1]*t],d=Math.hypot(q[0]-point[0],q[1]-point[1]);if(d<best){best=d;result=q;}}return result;}
function outside(point,organ){const [x,y]=point;if(x<0||x>103||y<0||y>103)return 99;const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(103,x0+1),y1=Math.min(103,y0+1),tx=x-x0,ty=y-y0,d=motion.outside[organ];return (1-ty)*((1-tx)*d[y0*104+x0]+tx*d[y0*104+x1])+ty*((1-tx)*d[y1*104+x0]+tx*d[y1*104+x1]);}
function clipTargets(frame,p){const q={...p};for(const [k,range] of Object.entries(frame.bounds))q[k]=clamp(Number.isFinite(q[k])?q[k]:0,Math.min(0,range[0]),Math.max(0,range[1]));for(const n of tongueNames){const a=frame.handles[n],target=projectHull([a[0]+q[n+'X'],a[1]+q[n+'Y']],motion.hulls[n]);q[n+'X']=target[0]-a[0];q[n+'Y']=target[1]-a[1];}return q;}
const baselineCache=new WeakMap();
function baseline(frame){let b=baselineCache.get(frame);if(!b){b={allow:frame.organs.slice(0,6).map((ps,j)=>ps.map(poly=>poly.map(pt=>Math.max(motion.envelope_tolerance_px,outside(pt,j)+.02)))),clearance:model(frame,neutral()).minClearancePx};baselineCache.set(frame,b);}return b;}
function violation(frame,p,m){const base=baseline(frame);for(const n of tongueNames)if(!inHull(handlePosition(n,p,frame),motion.hulls[n]))return 'Landmark reached its observed motion boundary';for(let j=0;j<6;j++)for(let k=0;k<m.organs[j].length;k++)for(let i=0;i<m.organs[j][k].length;i++)if(outside(m.organs[j][k][i],j)>base.allow[j][k][i]+1e-7)return 'Tissue reached its observed mask envelope';
 // A positive Jacobian prevents local inversion of the tongue bending field.
 if(tongueNames.some(n=>Math.abs(p[n+'X'])+Math.abs(p[n+'Y'])>.00001))for(const poly of frame.organs[2])for(let i=0;i<poly.length;i+=2){const w=bendWeights(poly[i],frame,true);let xx=1,xy=0,yx=0,yy=1;for(let j=0;j<3;j++){xx+=w[j][0]*p[tongueNames[j]+'X'];xy+=w[j][1]*p[tongueNames[j]+'X'];yx+=w[j][0]*p[tongueNames[j]+'Y'];yy+=w[j][1]*p[tongueNames[j]+'Y'];}if(xx*yy-xy*yx<.25)return 'Tongue bending limit reached';}
 if(frame.geometry.valid&&m.minClearancePx<Math.min(.28,base.clearance)-1e-7)return 'Airway contact limit reached';return '';}
let lastConstraint='';
function constrain(frame,current,next,scale=2.4,depth=2.4){if(!motion)throw Error('Motion bounds must be initialized');const target=clipTargets(frame,next);lastConstraint=Object.keys(target).some(k=>Math.abs(target[k]-next[k])>.001)?'Observed motion boundary reached':'';const why=violation(frame,target,model(frame,target,scale,depth));if(!why)return target;lastConstraint=why;let start=current;if(violation(frame,start,model(frame,start,scale,depth)))start=neutral();let lo=0,hi=1;const mix=t=>Object.fromEntries(Object.keys(target).map(k=>[k,start[k]+(target[k]-start[k])*t]));for(let i=0;i<15;i++){const t=(lo+hi)/2,p=mix(t);if(violation(frame,p,model(frame,p,scale,depth)))hi=t;else lo=t;}return mix(lo);}
const api={neutral,deform,catmull,model,constrain,handleDefs,handlePosition,setMotion,bendWeights,inHull,outside,violation,clipTargets,get lastConstraint(){return lastConstraint;}};root.Anatomy=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
