"""Static geometry comparison, using exactly the editor's exported deformations."""
from pathlib import Path
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.path import Path as MPath
from matplotlib.patches import PathPatch
p=Path(__file__).resolve().parent;s=json.loads((p/'sample.json').read_text());shapes=json.loads((p/'preview-shapes.json').read_text())
colors=['#c9a6d8','#dfbd83','#e7a0b5','#aaa0d9','#8cb7d4','#bdc0ca']
def spline(poly):
 q=np.array(poly);n=len(q);vs=[q[0]];cs=[MPath.MOVETO]
 for i in range(n):
  a,b,c,d=q[(i-1)%n],q[i],q[(i+1)%n],q[(i+2)%n];vs.extend([b+(c-a)/6,c-(d-b)/6,c]);cs.extend([MPath.CURVE4]*3)
 vs.append(q[0]);cs.append(MPath.CLOSEPOLY);return MPath(np.array(vs),cs)
fig,axs=plt.subplots(1,4,figsize=(14,5.7),dpi=150,facecolor='#f6f2ef')
for ax,item in zip(axs,shapes):
 ax.set_xlim(17,67);ax.set_ylim(90,39);ax.set_aspect('equal');ax.axis('off')
 for j in [5,0,1,4,2,3]:
  for poly in item['model']['organs'][j]:ax.add_patch(PathPatch(spline(poly),facecolor=colors[j],edgecolor='#967e89',lw=.6))
 if item['label']!='MRI rest':
  for poly in shapes[0]['model']['organs'][2]:ax.add_patch(PathPatch(spline(poly),facecolor='none',edgecolor='#8c3459',lw=.8,ls=(0,(3,3)),alpha=.7))
 for name in ['tip','dorsum','root']:
  x,y=s['frames'][0]['handles'][name];dx,dy=item['edits'][name+'X'],item['edits'][name+'Y'];moving=name==item['label']
  ax.scatter([x+dx],[y+dy],s=42 if moving else 23,c='#b9426c' if moving else '#fffdfb',edgecolors='#8c3459',lw=1,zorder=10)
  ax.annotate(name.capitalize(),(x+dx,y+dy),xytext=(-5,-10) if name=='tip' else (5,6),textcoords='offset points',ha='right' if name=='tip' else 'left',size=8,color='#53434c',zorder=11)
  if moving:ax.annotate('',xy=(x+dx,y+dy),xytext=(x,y),arrowprops=dict(arrowstyle='->',color='#8c3459',lw=1.3))
 title='MRI rest' if item['label']=='MRI rest' else item['label'].capitalize()+' bend'
 ax.set_title(title,loc='left',fontsize=12,color='#53434c',pad=13)
fig.text(.035,.955,'MRI VOICE LAB  /  THREE INDEPENDENT TONGUE HANDLES',fontsize=13,color='#b9426c',weight='bold')
fig.text(.035,.895,'Same MRI frame • smooth local bending • other tongue handles stay fixed',fontsize=11,color='#81747b')
fig.text(.035,.07,'Dashed line: original tongue outline. Examples are constrained to the observed clip envelope.',fontsize=10,color='#81747b')
fig.text(.035,.035,'Estimated tip / dorsum / root landmarks; geometry preview, not a browser screenshot.',fontsize=9,color='#81747b')
fig.subplots_adjust(left=.025,right=.98,top=.82,bottom=.13,wspace=.16)
fig.savefig(p.parent/'mri-voice-lab-v4-tongue-bends.png',facecolor=fig.get_facecolor());plt.close(fig)
