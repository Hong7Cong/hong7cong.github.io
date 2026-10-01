"""Conservative source estimates, not forced alignment or a speaker model."""
from pathlib import Path
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter,sosfiltfilt,find_peaks,medfilt
p=Path(__file__).resolve().parent;s=json.loads((p/'sample.json').read_text())
sr,wav=wavfile.read(p.parent/'upload/usc_s1_1_7.wav');wav=np.asarray(wav,dtype=float)
a=sosfiltfilt(butter(3,[65,1000],btype='bandpass',fs=sr,output='sos'),wav)
size=round(.06*sr);lo=int(sr/300);hi=int(sr/70);records=[]
for i in range(s['count']):
 center=round(i/s['fps']*sr);t=np.arange(center-size//2,center+size//2);t=np.clip(t,0,len(a)-1);x=a[t];x=x-x.mean();rms=np.sqrt(np.mean(wav[t]**2));corr=[]
 for lag in range(lo,hi+1):
  u=x[:-lag];v=x[lag:];corr.append(np.dot(u,v)/max(1e-12,np.linalg.norm(u)*np.linalg.norm(v)))
 corr=np.array(corr);peaks=find_peaks(corr)[0]
 if len(peaks):
  best=peaks[np.argmax(corr[peaks])];plausible=peaks[corr[peaks]>=max(.6,corr[best]*.9)];best=plausible[0] if len(plausible) else best
  lag=best+lo
  if 0<best<len(corr)-1:
   den=2*corr[best]-corr[best-1]-corr[best+1];lag+=(corr[best+1]-corr[best-1])/(2*den) if den>1e-8 else 0
  records.append([sr/lag,max(0,corr[best]),rms])
 else:records.append([130,0,rms])
r=np.array(records);good=(r[:,1]>.55)&(r[:,2]>.1*np.max(r[:,2]));f0=np.interp(np.arange(len(r)),np.where(good)[0],r[good,0]) if good.any() else np.full(len(r),130);f0=medfilt(f0,5)
level=np.clip(r[:,2]/np.percentile(r[:,2],85),0,1.1);voice=np.clip((r[:,1]-.35)/.4,0,1)*np.clip(level/.15,0,1);voice=medfilt(voice,3)
for i,f in enumerate(s['frames']):f['source']={'f0':round(float(f0[i]),2),'voicing':round(float(voice[i]),3),'breath':round(float(.012+.16*(1-voice[i])),3),'level':round(float(level[i]),3)}
s['source_estimation']={'window_ms':60,'pitch_range_hz':[70,300],'method':'Band-limited normalized autocorrelation; heuristic periodicity and RMS envelopes, not phonetic reconstruction.'}
payload=json.dumps(s,separators=(',',':'));(p/'sample.json').write_text(payload);(p/'sample.js').write_text('const SAMPLE = '+payload+';')
print('Estimated pitch range',f0.min(),f0.max(),'confident frames',int(good.sum()))
