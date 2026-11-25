from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, sys
S="/private/tmp/claude-501/shots"
OUT="/Users/efe/Desktop/untitled folder/FİLMSEL/docs/release/store"
W,H=1320,2868
GOLD=(217,164,65); IVORY=(232,230,225); MUTED=(138,143,154)
SERIF="/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
def font(p,s): return ImageFont.truetype(p,s)
SETS={
 "en":[("01-home","en_01_home.png","Movie duel.\n12 seconds."),
       ("02-classic","en_02_classic.png","Two clues.\nOne film."),
       ("03-reverse-frame","en_03_reverse.png","Two films.\nOne shared star."),
       ("04-cinephile-concept","en_04_concept.png","Themes, genres,\ncult cinema."),
       ("05-daily-reel","en_05_daily.png","A new reel daily.\nOne shot."),
       ("06-share","en_06_card.png","Share your reel.")],
 "tr":[("01-gise","tr_01_home.png","Film düellosu.\n12 saniye."),
       ("02-klasik","tr_02_classic.png","İki ipucu.\nTek film."),
       ("03-ters-kadraj","tr_03_reverse.png","İki film,\nortak bir oyuncu."),
       ("04-sinefil-konsept","tr_04_concept.png","Tema ve türle\nkült sinema."),
       ("05-gunluk-kadraj","tr_05_daily.png","Her gün yeni kadraj.\nTek şans."),
       ("06-paylas","tr_06_card.png","Kadrajını paylaş.")],
}
def bg():
    im=Image.new("RGB",(W,H),(16,18,24))
    px=im.load()
    for y in range(H):
        t=y/H; r=int(40-26*t); g=int(30-14*t); b=int(26-6*t)
        for x in range(0,W): px[x,y]=(r,g,b)
    glow=Image.new("RGB",(W,H),(0,0,0)); d=ImageDraw.Draw(glow)
    d.ellipse((W//2-900,-500,W//2+900,900),fill=(150,98,24))
    glow=glow.filter(ImageFilter.GaussianBlur(260))
    from PIL import ImageChops
    return ImageChops.add(im,glow)
def rounded(img,r):
    m=Image.new("L",img.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,img.size[0]-1,img.size[1]-1),r,fill=255)
    out=Image.new("RGBA",img.size); out.paste(img.convert("RGBA"),(0,0),m); return out
for lang,items in SETS.items():
    for name,src,head in items:
        canvas=bg(); d=ImageDraw.Draw(canvas)
        wm="C R O S S · C U T"; f=font(SANS,40); w=d.textlength(wm,font=f); d.text(((W-w)/2,110),wm,font=f,fill=GOLD)
        hf=font(SERIF,150); y=215; lines=head.split("\n")
        for k,line in enumerate(lines):
            col=(38,22,6) if k==len(lines)-1 and len(lines)>1 else (250,247,240)
            w=d.textlength(line,font=hf)
            if w>W-100: hf=font(SERIF,128); w=d.textlength(line,font=hf)
            d.text(((W-w)/2,y),line,font=hf,fill=col); y+=186
        top=y+50
        shot=Image.open(f"{S}/{src}").convert("RGB")
        pw=1180; ph=int(shot.size[1]*pw/shot.size[0]); shot=shot.resize((pw,ph),Image.LANCZOS)
        pad=14; fw=pw+2*pad
        frame=Image.new("RGBA",(fw,ph+2*pad),(0,0,0,0))
        fd=ImageDraw.Draw(frame); fd.rounded_rectangle((0,0,fw-1,ph+2*pad+300),120,fill=(30,32,38,255),outline=(110,96,70,255),width=4)
        m=Image.new("L",(pw,ph),0); ImageDraw.Draw(m).rounded_rectangle((0,0,pw-1,ph+300),104,fill=255)
        frame.paste(shot,(pad,pad),m)
        sh=Image.new("RGBA",(W,H),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle(((W-fw)//2,top+20,(W+fw)//2,top+ph+300),120,fill=(0,0,0,200))
        sh=sh.filter(ImageFilter.GaussianBlur(45))
        canvas=Image.alpha_composite(canvas.convert("RGBA"),sh)
        canvas.alpha_composite(frame,((W-fw)//2,top))
        canvas.convert("RGB").save(f"{OUT}/{lang}/{name}.png",optimize=True)
        print(lang,name)
