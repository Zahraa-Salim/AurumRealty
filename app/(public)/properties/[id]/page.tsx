/**
 * PropertyDetailPage — /properties/[id]
 * Fetches property from /api/properties/[id] on mount.
 * Loading skeleton, 404 state, inline error on forms.
 * Modal forms POST to /api/showings with real property data.
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { localise, getLocaleFromCookie, localiseLabel, STATUS_AR, TYPE_AR, NEIGHBOURHOOD_AR, type Locale } from '@/lib/i18n'

type Property = {
  id:number; title:string; price:string; address:string; neighbourhood:string
  status:string; type:string; bedrooms:number; bathrooms:number; area:string
  yearBuilt:string|null; lotSize:string|null; description:string|null
  features:string[]; images:string[]; agentName:string|null
  titleAr?:string; descriptionAr?:string; featuresAr?:string[]
}
type ModalType = 'showing'|'agent'|null
type FormState = 'idle'|'submitting'|'success'|'error'

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ type, property, onClose, locale }:{ type:ModalType; property:Property; onClose:()=>void; locale:Locale }) {
  const [visible,setVisible] = useState(false)
  const [state,setState]     = useState<FormState>('idle')
  const [focused,setFocused] = useState<string|null>(null)
  const overlayRef           = useRef<HTMLDivElement>(null)
  const isShowing            = type==='showing'

  useEffect(()=>{
    requestAnimationFrame(()=>requestAnimationFrame(()=>setVisible(true)))
    document.body.style.overflow='hidden'
    return ()=>{ document.body.style.overflow='' }
  },[])
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')handleClose()}
    document.addEventListener('keydown',fn); return ()=>document.removeEventListener('keydown',fn)
  })

  const handleClose = useCallback(()=>{setVisible(false);setTimeout(onClose,250)},[onClose])

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault(); setState('submitting')
    try {
      const form = e.target as HTMLFormElement
      const data = Object.fromEntries(new FormData(form))
      const res = await fetch('/api/showings',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ type:isShowing?'showing':'agent_enquiry', propertyId:property.id, propertyName:`${property.title} — ${property.price}`, ...data }),
      })
      if (!res.ok) throw new Error()
      setState('success')
    } catch { setState('error') }
  }

  const ic=(id:string)=>`w-full h-[44px] px-4 font-sans text-[14px] text-charcoal bg-white border rounded-sm placeholder:text-mid-gray placeholder:italic focus:outline-none transition-all duration-200 ${focused===id?'border-charcoal shadow-focus':'border-light-gray'}`

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-250"
      style={{backdropFilter:visible?'blur(4px)':'blur(0px)',WebkitBackdropFilter:visible?'blur(4px)':'blur(0px)',backgroundColor:visible?'rgba(31,31,31,0.45)':'rgba(31,31,31,0)'}}
      onClick={e=>{if(e.target===overlayRef.current)handleClose()}}>
      <div className="bg-white w-full max-w-[480px] rounded-sm overflow-hidden transition-all duration-250"
        style={{opacity:visible?1:0,transform:visible?'translateY(0) scale(1)':'translateY(16px) scale(0.98)',boxShadow:'0 24px 60px rgba(0,0,0,0.15)'}}>

        <div className="flex items-start justify-between px-7 py-6 border-b border-light-gray" style={{borderWidth:'0 0 0.5px 0'}}>
          <div>
            <h2 className="font-serif text-[22px] text-charcoal">{isShowing ? (locale === 'ar' ? 'جدولة معاينة' : 'Schedule a showing') : (locale === 'ar' ? 'تواصل مع الوكيل' : 'Contact agent')}</h2>
            <p className="font-sans text-[13px] text-taupe mt-1 truncate max-w-[280px]">{property.title} — {property.price}</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-taupe hover:text-charcoal transition-colors bg-transparent border-none cursor-pointer flex-shrink-0 mt-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {state==='success' ? (
          <div className="px-7 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3 className="font-serif text-[22px] text-charcoal mb-3">{isShowing ? (locale === 'ar' ? 'تم استلام الطلب' : 'Request received') : (locale === 'ar' ? 'تم إرسال الرسالة' : 'Message sent')}</h3>
            <p className="font-sans text-[14px] text-taupe leading-[1.6] mb-6">
              {isShowing
                ? (locale === 'ar' ? 'سيتواصل معك فريقنا لتأكيد الموعد خلال 24 ساعة.' : 'Our team will confirm your showing within 24 hours.')
                : (locale === 'ar' ? `سيتواصل معك ${property.agentName ?? 'وكيلنا'} قريباً.` : `${property.agentName??'Our agent'} will be in touch shortly.`)}
            </p>
            <button onClick={handleClose} className="font-sans text-[13px] font-medium text-charcoal underline bg-transparent border-none cursor-pointer">{locale === 'ar' ? 'إغلاق' : 'Close'}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
            {state==='error'&&(
              <div className="p-3 bg-error/5 border border-error/20 rounded-sm" style={{borderWidth:'0.5px'}}>
                <p className="font-sans text-[13px] text-error">{locale === 'ar' ? 'حدث خطأ ما. يرجى المحاولة مجدداً.' : 'Something went wrong. Please try again.'}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'الاسم الكامل *' : 'Full name *'}</label>
                <input name="name" required type="text" placeholder={locale === 'ar' ? 'اسمك' : 'Your name'} onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)} className={ic('name')} style={{borderWidth:focused==='name'?'1px':'0.5px'}}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}</label>
                <input name="email" required type="email" placeholder="you@example.com" onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} className={ic('email')} style={{borderWidth:focused==='email'?'1px':'0.5px'}}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                <input name="phone" type="tel" placeholder="+1 555 000 0000" onFocus={()=>setFocused('phone')} onBlur={()=>setFocused(null)} className={ic('phone')} style={{borderWidth:focused==='phone'?'1px':'0.5px'}}/>
              </div>
              {isShowing&&(
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'التاريخ المفضل' : 'Preferred date'}</label>
                    <input name="date" type="date" onFocus={()=>setFocused('date')} onBlur={()=>setFocused(null)} className={ic('date')} style={{borderWidth:focused==='date'?'1px':'0.5px'}}/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'الوقت المفضل' : 'Preferred time'}</label>
                    <select name="time" onFocus={()=>setFocused('time')} onBlur={()=>setFocused(null)} className={`${ic('time')} cursor-pointer`} style={{borderWidth:focused==='time'?'1px':'0.5px'}}>
                      <option value="">{locale === 'ar' ? 'اختر الوقت...' : 'Select time…'}</option>
                      {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'ملاحظات' : 'Notes'}</label>
                    <textarea name="message" rows={3} placeholder={locale === 'ar' ? 'هل هناك مناطق بعينها تودّ التركيز عليها؟' : "Any specific areas you'd like to focus on?"} onFocus={()=>setFocused('notes')} onBlur={()=>setFocused(null)} className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm placeholder:text-mid-gray placeholder:italic focus:outline-none focus:border-charcoal transition-all resize-none" style={{borderWidth:focused==='notes'?'1px':'0.5px'}}/>
                  </div>
                </>
              )}
              {!isShowing&&(
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-medium text-charcoal">{locale === 'ar' ? 'الرسالة *' : 'Message *'}</label>
                  <textarea name="message" required rows={4} placeholder={locale === 'ar' ? 'أرغب في معرفة المزيد عن هذا العقار...' : "I'm interested in this property and would like more information…"} onFocus={()=>setFocused('message')} onBlur={()=>setFocused(null)} className="w-full p-4 font-sans text-[14px] text-charcoal bg-white border border-light-gray rounded-sm placeholder:text-mid-gray placeholder:italic focus:outline-none focus:border-charcoal transition-all resize-none" style={{borderWidth:focused==='message'?'1px':'0.5px'}}/>
                </div>
              )}
            </div>
            <button type="submit" disabled={state==='submitting'} className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-charcoal font-sans text-[14px] font-medium py-3.5 rounded-full transition-all border-none cursor-pointer">
              {state==='submitting'
                ? (isShowing ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending request…') : (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending message…'))
                : (isShowing ? (locale === 'ar' ? 'طلب معاينة' : 'Request showing') : (locale === 'ar' ? 'إرسال رسالة' : 'Send message'))}
            </button>
            <p className="font-sans text-[11px] text-mid-gray text-center">{locale === 'ar' ? 'نرد خلال 24 ساعة. بدون بريد مزعج.' : 'We respond within 24 hours. No spam, ever.'}</p>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <main className="w-full bg-white pb-24 animate-pulse">
      <div className="w-full h-[300px] md:h-[400px] bg-light-gray"/>
      <div className="flex gap-2 p-3 max-w-[1200px] mx-auto">
        {[1,2,3,4].map(n=><div key={n} className="h-[80px] w-[140px] bg-light-gray/60 rounded-sm flex-shrink-0"/>)}
      </div>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-10 flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-[65%] space-y-5">
          <div className="h-10 bg-light-gray rounded w-2/3"/>
          <div className="h-6 bg-light-gray/60 rounded w-1/4"/>
          {[1,2,3,4].map(n=><div key={n} className="h-4 bg-light-gray/30 rounded"/>)}
        </div>
        <div className="w-full lg:w-[35%]"><div className="bg-light-gray/20 h-[300px] rounded-sm"/></div>
      </div>
    </main>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const params   = useParams<{id:string}>()
  const [property,setProperty] = useState<Property|null>(null)
  const [loading, setLoading]  = useState(true)
  const [missing, setMissing]  = useState(false)
  const [modal,   setModal]    = useState<ModalType>(null)
  const [heroIdx, setHeroIdx]  = useState(0)
  const [locale,  setLocale]   = useState<Locale>('en')

  useEffect(()=>{
    setLocale(getLocaleFromCookie() as Locale)
  },[])

  useEffect(()=>{
    if (!params?.id) return
    fetch(`/api/properties/${params.id}`)
      .then(r=>{ if(r.status===404){setMissing(true);setLoading(false);return null} return r.json() })
      .then(d=>{ if(d){setProperty(d);setLoading(false)} })
      .catch(()=>{ setMissing(true);setLoading(false) })
  },[params?.id])

  if (loading) return <Skeleton/>
  if (missing||!property) return (
    <main className="w-full bg-white min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <p className="font-serif text-[32px] text-charcoal mb-4">{locale === 'ar' ? 'العقار غير موجود' : 'Property not found'}</p>
        <p className="font-sans text-[15px] text-taupe mb-8">{locale === 'ar' ? 'ربما تم إزالة هذا الإعلان أو الرابط غير صحيح.' : 'This listing may have been removed or the link is incorrect.'}</p>
        <Link href="/properties" className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium px-8 py-3.5 rounded-full transition-colors no-underline">{locale === 'ar' ? 'تصفح جميع العقارات' : 'Browse all properties'}</Link>
      </div>
    </main>
  )

  const images = (property?.images?.length ?? 0) > 0 ? property.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80']
  const agentInitials = property?.agentName ? property.agentName.split(' ').map((n:string)=>n[0]).join('') : 'AU'
  const statusBadge:Record<string,string> = {'For Sale':'bg-charcoal text-white','For Rent':'bg-gold text-charcoal','New Development':'bg-white/90 text-charcoal'}

  return (
    <main className="w-full bg-white pb-24">
      <div className="w-full h-[300px] md:h-[440px] relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[heroIdx]} alt={property.title} className="w-full h-full object-cover"/>
        <span className={`absolute top-4 left-4 font-sans text-[12px] font-medium px-3 py-1.5 rounded-sm ${statusBadge[property.status]??'bg-white/90 text-charcoal'}`}>{localiseLabel(property.status, STATUS_AR, locale)}</span>
      </div>

      {images.length>1&&(
        <div className="flex gap-2 overflow-x-auto p-3 max-w-[1200px] mx-auto" style={{scrollbarWidth:'none'}}>
          {images.map((src,i)=>(
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`View ${i+1}`} onClick={()=>setHeroIdx(i)}
              className={`h-[80px] md:h-[110px] aspect-[3/2] object-cover rounded-sm flex-shrink-0 cursor-pointer transition-all ${heroIdx===i?'ring-2 ring-gold opacity-100':'opacity-60 hover:opacity-100'}`}/>
          ))}
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-10 flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-[65%]">
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-sans text-[12px] text-taupe bg-light-gray/40 px-3 py-1 rounded-sm">{localiseLabel(property.type, TYPE_AR, locale)}</span>
              <span className="font-sans text-[12px] text-taupe bg-light-gray/40 px-3 py-1 rounded-sm">{localiseLabel(property.neighbourhood, NEIGHBOURHOOD_AR, locale)}</span>
            </div>
            <h1 className="font-serif text-[32px] md:text-[40px] text-charcoal leading-[1.1] mb-4">{localise(property.title, property.titleAr, locale)}</h1>
            <p className="font-sans text-[26px] font-medium text-gold mb-2">{property.price}</p>
            <p className="font-sans text-[14px] text-taupe italic">{property.address}</p>
          </div>

          {property.description&&(
            <div className="font-sans text-[14px] text-taupe leading-[1.8] space-y-5 mb-12">
              {(locale === 'ar' && property.descriptionAr ? property.descriptionAr : property.description).split('\n\n').filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}
            </div>
          )}

          {(property?.features?.length ?? 0)>0&&(
            <div className="mb-8">
              <h2 className="font-serif text-[24px] text-charcoal mb-6">{locale === 'ar' ? 'ميزات العقار' : 'Property features'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                {(locale === 'ar' && property.featuresAr?.length ? property.featuresAr : property.features).map(f=>(
                  <div key={f} className="flex items-center gap-2 font-sans text-[14px] text-taupe">
                    <span className="w-4 h-4 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-light-gray" style={{borderWidth:'0.5px 0 0 0'}}>
            <Link href="/properties" className="flex items-center gap-2 font-sans text-[13px] text-taupe hover:text-charcoal no-underline transition-colors w-fit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              {locale === 'ar' ? 'العودة إلى العقارات' : 'Back to all properties'}
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-[35%]">
          <div className="sticky top-[96px] space-y-4">
            <div className="bg-white border border-light-gray rounded-sm p-7" style={{borderWidth:'0.5px'}}>
              <h2 className="font-serif text-[20px] text-charcoal mb-6">{locale === 'ar' ? 'التفاصيل الأساسية' : 'Key details'}</h2>
              <div className="space-y-3 mb-8">
                {[
                  [locale === 'ar' ? 'غرف النوم' : 'Bedrooms', String(property.bedrooms)],
                  [locale === 'ar' ? 'الحمامات' : 'Bathrooms', String(property.bathrooms)],
                  [locale === 'ar' ? 'المساحة' : 'Area', property.area],
                  ...(property.yearBuilt?[[locale === 'ar' ? 'سنة البناء' : 'Year built', property.yearBuilt]]:[]),
                  ...(property.lotSize?[[locale === 'ar' ? 'مساحة الأرض' : 'Lot size', property.lotSize]]:[]),
                  [locale === 'ar' ? 'النوع' : 'Type', localiseLabel(property.type, TYPE_AR, locale)],
                  [locale === 'ar' ? 'الحالة' : 'Status', localiseLabel(property.status, STATUS_AR, locale)],
                ].map(([label,value])=>(
                  <div key={label} className="flex justify-between items-center border-b border-light-gray pb-3" style={{borderWidth:'0 0 0.5px 0'}}>
                    <span className="font-sans text-[12px] font-medium text-mid-gray uppercase tracking-wider">{label}</span>
                    <span className="font-sans text-[14px] font-medium text-charcoal">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={()=>setModal('showing')} className="w-full bg-gold hover:bg-gold-dark text-charcoal font-sans text-[14px] font-medium py-3.5 rounded-full transition-colors border-none cursor-pointer">{locale === 'ar' ? 'جدولة معاينة' : 'Schedule showing'}</button>
                <button onClick={()=>setModal('agent')} className="w-full bg-transparent border border-charcoal text-charcoal hover:bg-light-gray/30 font-sans text-[14px] font-medium py-3 rounded-full transition-colors cursor-pointer" style={{borderWidth:'0.5px'}}>{locale === 'ar' ? 'تواصل مع الوكيل' : 'Contact agent'}</button>
              </div>
            </div>

            {property.agentName&&(
              <div className="bg-cream rounded-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-sans text-[14px] font-medium text-charcoal">{agentInitials}</span>
                </div>
                <div>
                  <p className="font-serif text-[15px] text-charcoal mb-0.5">{property.agentName}</p>
                  <p className="font-sans text-[12px] text-taupe mb-2">{locale === 'ar' ? 'الوكيل المسؤول' : 'Listing agent'}</p>
                  <button onClick={()=>setModal('agent')} className="font-sans text-[12px] text-charcoal underline hover:text-gold transition-colors bg-transparent border-none cursor-pointer p-0">{locale === 'ar' ? 'أرسل رسالة' : 'Send a message'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal&&property&&<Modal type={modal} property={property} onClose={()=>setModal(null)} locale={locale}/>}
    </main>
  )
}
