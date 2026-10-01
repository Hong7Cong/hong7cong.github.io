"""Derive clip-specific motion limits. No learned physiological bounds are implied."""
from pathlib import Path
import json
import numpy as np
from scipy.spatial import ConvexHull
from scipy.ndimage import distance_transform_edt,gaussian_filter1d
p=Path(__file__).resolve().parent
s=json.loads((p/'baseline-sample.json').read_text())
m=np.load(p.parent/'upload/seg.npz'); c=np.load(p.parent/'upload/contour.npy').transpose(0,2,1)
c=gaussian_filter1d(c,.8,axis=1,mode='nearest')
names=['tip','dorsum','root']; indices=[25,55,94]
landmarks=c[:,indices,:]
centers=np.array([[np.argwhere(m[k][i])[:,::-1].mean(axis=0) for k in m.files[:6]] for i in range(210)])
# Anterior portions of the two lip masks, excluding the inferior jaw.
lip=np.zeros((210,2,2))
for i in range(210):
 for j in range(2):
  pts=np.argwhere(m[m.files[j]][i])[:,::-1];front=pts[(pts[:,0]<=25)&(pts[:,1]<64)]
  lip[i,j]=front.mean(axis=0)
assert np.isfinite(lip).all()
gap=lip[:,1,1]-lip[:,0,1];front=lip[:,:,0].mean(axis=1)
jawangle=np.unwrap(np.arctan2(centers[:,1,1]-78,centers[:,1,0]-55))*180/np.pi
hulls={name:landmarks[:,j][ConvexHull(landmarks[:,j]).vertices].round(5).tolist() for j,name in enumerate(names)}
fields=[distance_transform_edt(~m[k].any(axis=0)).round(3).ravel().tolist() for k in m.files[:6]]
s['motion']={'landmark_indices':dict(zip(names,indices)),'hulls':hulls,'outside':fields,'envelope_tolerance_px':.85,'description':'Convex hull of the estimated contour landmarks and union of each tissue mask over all 210 frames. Independent controls interpolate within this clip envelope; combinations are not observed muscle configurations.'}
for i,f in enumerate(s['frames']):
 for j,name in enumerate(names):f['handles'][name]=landmarks[i,j].round(5).tolist()
 for name,j in [('jaw',1),('velum',3),('larynx',4)]:f['handles'][name]=centers[i,j].round(5).tolist()
 f['handles']['lips']=lip[i,1].round(5).tolist()
 # Three stationary inferior anchors chosen on the individual tongue boundary.
 pts=np.argwhere(m['tongue'][i])[:,::-1];anchors=[]
 for q in [.2,.5,.8]:
  x=np.quantile(pts[:,0],q);near=pts[abs(pts[:,0]-x)<2.1];bottom=near[near[:,1]>=np.quantile(near[:,1],.92)]
  anchors.append(bottom.mean(axis=0))
 rbf=np.vstack([landmarks[i],anchors]);K=np.exp(-np.sum((rbf[:,None,:]-rbf[None,:,:])**2,axis=2)/(2*9**2))
 assert np.linalg.cond(K)<1e7
 f['bend']={'centers':rbf.round(6).tolist(),'weights':np.linalg.inv(K)[:,:3].round(10).tolist(),'sigma':9}
 bounds={}
 for j,name in enumerate(names):
  for d,axis in enumerate('XY'):bounds[name+axis]=[float(landmarks[:,j,d].min()-landmarks[i,j,d]),float(landmarks[:,j,d].max()-landmarks[i,j,d])]
 bounds['jaw']=[float(jawangle[i]-jawangle.max()),float(jawangle[i]-jawangle.min())]
 for name,j in [('velum',3),('larynx',4)]:
  weight=min(1,max(0,(centers[i,j,0]-36)/14)) if j==3 else 1
  bounds[name]=((np.array([centers[:,j,1].min(),centers[:,j,1].max()])-centers[i,j,1])/weight).tolist()
 w=np.exp(-((lip[i,:,0]-22)/8)**2-((lip[i,:,1]-53)/14)**2)
 bounds['lipGap']=((np.array([gap.min(),gap.max()])-gap[i])/(w.sum()/2)).tolist()
 bounds['lipForward']=((front[i]-np.array([front.max(),front.min()]))/(w.sum()/2)).tolist()
 f['bounds']={k:np.round(v,5).tolist() for k,v in bounds.items()}
payload=json.dumps(s,separators=(',',':'));(p/'sample.json').write_text(payload);(p/'sample.js').write_text('const SAMPLE = '+payload+';')
print(json.dumps({'frames':len(s['frames']),'landmarkRangesPx':{n:np.ptp(landmarks[:,j],axis=0).round(2).tolist() for j,n in enumerate(names)},'jawAngleSpanDeg':round(np.ptp(jawangle),2),'lipGapSpanPx':round(np.ptp(gap),2),'bytes':len(payload)},indent=2))
