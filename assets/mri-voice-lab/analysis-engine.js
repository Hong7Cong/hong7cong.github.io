/* Original educational implementation; no Pink Trombone or Samuel code copied. */
(function(root){
'use strict';
const N=44, C=35000;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function resample(points,n=N){
 const dist=[0]; for(let i=1;i<points.length;i++)dist.push(dist[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
 const total=dist.at(-1); if(!total)throw Error('The airway path must have nonzero length.');
 const out=[];let j=1;
 for(let i=0;i<n;i++){const d=total*(i+.5)/n;while(j<dist.length-1&&dist[j]<d)j++;const t=(d-dist[j-1])/(dist[j]-dist[j-1]||1);out.push(points[j-1].map((v,k)=>v+(points[j][k]-v)*t));}
 return {points:out,length:total};
}
function demo(p){
 // Centerline plus opposing walls define the actual displayed and sounded tube.
 const guides=[[260,480+(p.larynx-50)*.55],[249,414],[227,348],[237,287],[279,245],[333,226],[395,225],[457,241],[509+p.round*.2,254]];
 const rs=resample(guides);const base=[.8,1.15,1.65,2.2,2.6,2.4,1.7,1.1];
 const widths=rs.points.map((_,i)=>{const t=i/(N-1),b=t*(base.length-1),k=Math.min(base.length-2,Math.floor(b));let d=base[k]*(1-(b-k))+base[k+1]*(b-k);
 const loc=.38+p.front*.0035;d-=p.high*.022*Math.exp(-Math.pow((t-loc)/.17,2));d+=p.jaw*.012*Math.exp(-Math.pow((t-.78)/.29,2));
 if(t>.87){const blend=(t-.87)/.13;d=d*(1-blend)+(p.lips/40+.06)*blend;}return clamp(d,.045,3.9);});
 const normals=rs.points.map((pt,i)=>{const a=rs.points[Math.max(0,i-1)],b=rs.points[Math.min(N-1,i+1)],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return [-(b[1]-a[1])/d,(b[0]-a[0])/d];});
 const left=rs.points.map((v,i)=>v.map((x,k)=>x+normals[i][k]*widths[i]*12));
 const right=rs.points.map((v,i)=>v.map((x,k)=>x-normals[i][k]*widths[i]*12));
 return {points:rs.points,left,right,widths,areas:widths.map(x=>x*p.depth),length:rs.length/24,valid:true,invalid:[],origin:'synthetic'};
}
function validate(data){
 if(!data||data.schema!=='mri-voice-lab/1')throw Error('Expected schema mri-voice-lab/1. Use convert_mask.py for MAT/NPY files.');
 if(!Number.isInteger(data.width)||!Number.isInteger(data.height)||data.width<8||data.height<8||data.width>1024||data.height>1024)throw Error('Mask dimensions must be 8–1024 pixels.');
 if(!Array.isArray(data.labels)||data.labels.length!==data.width*data.height||data.labels.some(v=>!Number.isInteger(v)||v<0||v>6))throw Error('Expected a flat row-major array of integer labels 0–6.');
 if(!Array.isArray(data.spacing_mm)||data.spacing_mm.length!==2||data.spacing_mm.some(x=>!Number.isFinite(x)||x<=0||x>10))throw Error('Provide spacing_mm: [x, y], in millimetres.');
 if(data.centerline!==undefined&&(!Array.isArray(data.centerline)||data.centerline.length<2||data.centerline.length>300||data.centerline.some(p=>!Array.isArray(p)||p.length!==2||p.some(x=>!Number.isFinite(x))||p[0]<0||p[0]>=data.width||p[1]<0||p[1]>=data.height)))throw Error('Centerline points must be [x, y] pixels inside the image.');
 if(data.image!==undefined&&(!Array.isArray(data.image)||data.image.length!==data.labels.length||data.image.some(v=>!Number.isFinite(v)||v<0||v>255)))throw Error('Optional image must contain width × height intensities from 0 to 255.');
 return data;
}
function measure(data,points,depth){
 if(points.length<2)return null;
 const [sx,sy]=data.spacing_mm,physical=points.map(p=>[p[0]*sx,p[1]*sy]),rs=resample(physical);
 const inside=(x,y)=>{const col=Math.round(x/sx),row=Math.round(y/sy);return col>=0&&row>=0&&col<data.width&&row<data.height&&data.labels[row*data.width+col]===5;};
 const left=[],right=[],widths=[],invalid=[];
 const step=Math.min(sx,sy)/5;
 rs.points.forEach((p,i)=>{const a=rs.points[Math.max(0,i-1)],b=rs.points[Math.min(N-1,i+1)],len=Math.hypot(b[0]-a[0],b[1]-a[1]),normal=[-(b[1]-a[1])/len,(b[0]-a[0])/len];
  let sides=[0,0]; if(!inside(...p)||!Number.isFinite(len)||len<1e-8){invalid.push(i);}else for(let side=0;side<2;side++){const s=side===0?1:-1;let d=0;while(d<80&&inside(p[0]+normal[0]*d*s,p[1]+normal[1]*d*s))d+=step;sides[side]=Math.max(0,d-step/2);if(d>=80)invalid.push(i);}
  left.push([(p[0]+normal[0]*sides[0])/sx,(p[1]+normal[1]*sides[0])/sy]);right.push([(p[0]-normal[0]*sides[1])/sx,(p[1]-normal[1]*sides[1])/sy]);widths.push((sides[0]+sides[1])/10);
 });
 // Check the entire supplied path, not only the 44 section centres.
 const dense=resample(physical,Math.max(N,Math.ceil(rs.length/step))).points;
 const pathOutside=dense.some(p=>!inside(...p));
 return {points:rs.points.map(p=>[p[0]/sx,p[1]/sy]),left,right,widths,areas:widths.map(w=>w*depth),length:rs.length/10,valid:invalid.length===0&&!pathOutside&&widths.every(w=>w>0),invalid,pathOutside,origin:'imported'};
}
class Tube {
 constructor(areas){this.r=new Float64Array(N);this.l=new Float64Array(N);this.nr=new Float64Array(N);this.nl=new Float64Array(N);this.set(areas);}
 set(areas){this.a=Float64Array.from(areas,x=>clamp(x,.005,30));}
 tick(source){const {r,l,nr,nl,a}=this;nr[0]=source+.75*l[0];nl[N-1]=-.85*r[N-1];
  for(let i=1;i<N;i++){const p=2*(a[i-1]*r[i-1]+a[i]*l[i])/(a[i-1]+a[i]);nr[i]=p-l[i];nl[i-1]=p-r[i-1];}
  const out=r[N-1]+l[N-1];for(let i=0;i<N;i++){r[i]=nr[i]*.998;l[i]=nl[i]*.998;}return out;
 }
}
function impulse(g,n=4096){const t=new Tube(g.areas),out=new Float32Array(n);for(let i=0;i<n;i++)out[i]=t.tick(i===0?1:0);return {samples:out,rate:C*N/g.length};}
function response(g){const ir=impulse(g,4096),values=[];for(let f=80;f<=5000;f+=20){let re=0,im=0;const omega=2*Math.PI*f/ir.rate,cr=Math.cos(omega),ci=Math.sin(omega);let xr=1,xi=0;for(const v of ir.samples){re+=v*xr;im-=v*xi;const z=xr*cr-xi*ci;xi=xr*ci+xi*cr;xr=z;}values.push([f,20*Math.log10(Math.hypot(re,im)+1e-9)]);}const max=Math.max(...values.map(v=>v[1]));values.forEach(v=>v[1]-=max);const peaks=values.filter((v,i)=>i>0&&i<values.length-1&&v[1]>values[i-1][1]&&v[1]>values[i+1][1]&&v[1]>-35).slice(0,3).map(v=>v[0]);return {values,peaks};}
function render(g,f0=130,seconds=2,rate=44100){const internal=C*N/g.length,t=new Tube(g.areas),out=new Float32Array(Math.round(rate*seconds));let phase=0,acc=0,value=0,previous=0;
 for(let i=0;i<out.length;i++){acc+=internal/rate;while(acc>=1){phase=(phase+f0/internal)%1;const source=phase<.65?Math.sin(Math.PI*phase/.65):-(.65/.35)*Math.sin(Math.PI*(phase-.65)/.35);previous=value;value=t.tick(source*.35);acc--;}const env=Math.min(1,i/(rate*.025),(out.length-1-i)/(rate*.035));out[i]=Math.tanh((previous+(value-previous)*acc)*1.2)*Math.max(0,env);}
 return out;
}
const api={N,C,clamp,resample,demo,validate,measure,Tube,impulse,response,render};root.VocalEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
