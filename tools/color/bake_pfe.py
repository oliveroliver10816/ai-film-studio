import numpy as np, sys

def load_cube(p):
    size=None; vals=[]
    for line in open(p):
        s=line.strip()
        if not s or s.startswith('#'): continue
        if s.startswith('LUT_3D_SIZE'): size=int(s.split()[1]); continue
        if not (s[0].isdigit() or s[0] in "-.+"): continue
        q=s.split()
        if len(q)==3: vals.append([float(x) for x in q])
    a=np.array(vals,dtype=np.float64)
    return size, a.reshape(size,size,size,3)   # [b][g][r]

def tri(L,size,rgb):
    x=np.clip(rgb,0,1)*(size-1)
    i=np.floor(x).astype(int); i=np.minimum(i,size-2); f=x-i
    r,g,b=i[...,0],i[...,1],i[...,2]; fr,fg,fb=f[...,0:1],f[...,1:2],f[...,2:3]
    out=0
    for db in (0,1):
        for dg in (0,1):
            for dr in (0,1):
                w=(fb if db else 1-fb)*(fg if dg else 1-fg)*(fr if dr else 1-fr)
                out=out+w*L[b+db,g+dg,r+dr]
    return out

# --- transforms -------------------------------------------------------------
def srgb_to_lin(c):
    return np.where(c<=0.04045, c/12.92, ((c+0.055)/1.055)**2.4)

BP,WP,GAM = 95.0, 685.0, 0.6
OFF = 10**((BP-WP)*0.002/GAM)
def lin_to_cineon(lin):
    return (np.log10(np.maximum(lin*(1-OFF)+OFF,1e-10))/(0.002/GAM)+WP)/1023.0

def build(lut_path, out_path, exposure_stops=0.0, grey_cv=None, size=33):
    s,L = load_cube(lut_path)
    n=np.linspace(0,1,size)
    b,g,r = np.meshgrid(n,n,n,indexing='ij')
    rgb=np.stack([r,g,b],-1)
    lin = srgb_to_lin(rgb) * (2.0**exposure_stops)
    cin = lin_to_cineon(lin)
    if grey_cv is not None:                       # shift so 18% lands on grey_cv
        cin = cin + (grey_cv - lin_to_cineon(np.array(0.18))*1023.0)/1023.0
    out = tri(L,s,np.clip(cin,0,1))
    out = np.clip(out,0,1)
    with open(out_path,'w') as f:
        f.write(f'# sRGB in -> {lut_path} print look out\n')
        f.write(f'# exposure {exposure_stops:+.2f} stops, grey_cv={grey_cv}\n')
        f.write(f'LUT_3D_SIZE {size}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        for ib in range(size):
            for ig in range(size):
                for ir in range(size):
                    v=out[ib,ig,ir]
                    f.write('%.6f %.6f %.6f\n'%(v[0],v[1],v[2]))
    return out

if __name__=='__main__':
    for name,path,ev in [('sRGB_to_2383',"k2383.cube",-0.30),('sRGB_to_3513',"f3513.cube",-0.30)]:
        o=build(path,name+'.cube',exposure_stops=ev,grey_cv=445.0)
        print(name,'written')
        for lbl,v in [('black 0.00',0.0),('shadow 0.10',0.10),('mid 0.4587(=18%)',0.4587),('skin 0.65',0.65),('white 1.0',1.0)]:
            s2,L2=load_cube(name+'.cube')
            q=tri(L2,s2,np.array([[v,v,v]]))[0]
            print('   %-18s -> R%.4f G%.4f B%.4f   (B-R = %+.4f)'%(lbl,q[0],q[1],q[2],q[2]-q[0]))
