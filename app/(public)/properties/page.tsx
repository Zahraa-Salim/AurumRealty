/**
 * PropertiesListingPage — /properties
 * Fetches all published properties from /api/properties on mount.
 * Loading skeleton while fetching. All filtering/search/pagination client-side.
 * Filter options (types, locations) auto-derived from real DB data.
 */
'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { localise, getLocaleFromCookie, localiseLabel, STATUS_AR, TYPE_AR, NEIGHBOURHOOD_AR, type Locale } from '@/lib/i18n'

type Property = {
  id: number; title: string; price: string; neighbourhood: string
  type: string; status: string; bedrooms: number; bathrooms: number
  area: string; images: string[]; titleAr?: string
}
const PAGE_SIZE = 9
const STATUSES      = ['For Sale','For Rent','New Development']
const STATUSES_AR   = ['للبيع','للإيجار','مشروع جديد']
const BEDROOMS  = ['1','2','3','4','5+']
const PRICE_RANGES = [
  { label:'Under $2M', min:0,       max:2000000  },
  { label:'$2M – $5M', min:2000000, max:5000000  },
  { label:'$5M+',      min:5000000, max:Infinity },
]
type Filters = { types:string[]; statuses:string[]; bedrooms:string[]; locations:string[]; priceRange:string|null }
const EMPTY:Filters = { types:[], statuses:[], bedrooms:[], locations:[], priceRange:null }
const countActive = (f:Filters) => f.types.length+f.statuses.length+f.bedrooms.length+f.locations.length+(f.priceRange?1:0)
const toggle = (arr:string[],v:string) => arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]
const statusBadge:Record<string,string> = {'For Sale':'bg-charcoal text-white','For Rent':'bg-gold text-charcoal','New Development':'bg-white/90 text-charcoal'}
const priceToNum = (p:string) => Number(p.replace(/[^0-9]/g,''))
function applyFilters(props:Property[], f:Filters, q:string) {
  return props.filter(p => {
    const ql = q.toLowerCase()
    if (ql && !p.title.toLowerCase().includes(ql) && !p.neighbourhood.toLowerCase().includes(ql)) return false
    if (f.types.length     && !f.types.includes(p.type))             return false
    if (f.statuses.length  && !f.statuses.includes(p.status))        return false
    if (f.locations.length && !f.locations.includes(p.neighbourhood)) return false
    if (f.bedrooms.length) {
      const exact = f.bedrooms.filter(b=>b!=='5+').map(Number)
      if (!exact.includes(p.bedrooms) && !(f.bedrooms.includes('5+') && p.bedrooms>=5)) return false
    }
    if (f.priceRange) {
      const r = PRICE_RANGES.find(x=>x.label===f.priceRange)!
      const n = priceToNum(p.price)
      if (n<r.min||n>=r.max) return false
    }
    return true
  })
}

export default function PropertiesPage() {
  const [all,          setAll]          = useState<Property[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(false)
  const [search,       setSearch]       = useState('')
  const [filters,      setFilters]      = useState<Filters>(EMPTY)
  const [statusTab,    setStatusTab]    = useState('All')
  const [page,         setPage]         = useState(1)
  const [draft,        setDraft]        = useState<Filters>(EMPTY)
  const [mounted,      setMounted]      = useState(false)
  const [visible,      setVisible]      = useState(false)
  const [locale,       setLocale]       = useState<Locale>('en')
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocale(getLocaleFromCookie()) }, [])

  const TYPES     = [...new Set(all.map(p=>p.type))].sort()
  const LOCATIONS = [...new Set(all.map(p=>p.neighbourhood))].sort()

  useEffect(() => {
    fetch('/api/properties').then(r=>r.json()).then(d=>{setAll(d);setLoading(false)}).catch(()=>{setError(true);setLoading(false)})
  },[])

  const openDrawer = useCallback(() => {
    setDraft({...filters}); setMounted(true)
    requestAnimationFrame(()=>requestAnimationFrame(()=>setVisible(true)))
  },[filters])
  const closeDrawer = useCallback(()=>{setVisible(false);setTimeout(()=>setMounted(false),300)},[])
  const applyDraft  = useCallback(()=>{setFilters(draft);setPage(1);setVisible(false);setTimeout(()=>setMounted(false),300)},[draft])

  useEffect(()=>{
    if (!mounted) return
    const fn=(e:MouseEvent)=>{if(drawerRef.current&&!drawerRef.current.contains(e.target as Node))closeDrawer()}
    document.addEventListener('mousedown',fn); return ()=>document.removeEventListener('mousedown',fn)
  },[mounted,closeDrawer])
  useEffect(()=>{document.body.style.overflow=mounted?'hidden':'';return()=>{document.body.style.overflow=''}},[mounted])

  const ef:Filters = {...filters, statuses:statusTab==='All'?filters.statuses:Array.from(new Set([statusTab,...filters.statuses]))}
  const filtered    = applyFilters(all, ef, search)
  const draftResult = applyFilters(all, {...draft, statuses:statusTab==='All'?draft.statuses:Array.from(new Set([statusTab,...draft.statuses]))}, search)
  const totalPages  = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const paginated   = filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)
  const clearAll = ()=>{setFilters(EMPTY);setSearch('');setStatusTab('All');setPage(1)}
  const chips = [
    ...filters.types.map(v=>({label:v,clear:()=>{setFilters(f=>({...f,types:f.types.filter(x=>x!==v)}));setPage(1)}})),
    ...filters.statuses.map(v=>({label:v,clear:()=>{setFilters(f=>({...f,statuses:f.statuses.filter(x=>x!==v)}));setPage(1)}})),
    ...filters.locations.map(v=>({label:v,clear:()=>{setFilters(f=>({...f,locations:f.locations.filter(x=>x!==v)}));setPage(1)}})),
    ...filters.bedrooms.map(v=>({label:locale === 'ar' ? `${v} غرف` : `${v} bed`,clear:()=>{setFilters(f=>({...f,bedrooms:f.bedrooms.filter(x=>x!==v)}));setPage(1)}})),
    ...(filters.priceRange?[{label:filters.priceRange,clear:()=>{setFilters(f=>({...f,priceRange:null}));setPage(1)}}]:[]),
  ]

  return (
    <main className="w-full bg-white min-h-screen overflow-x-hidden">
      <section className="bg-cream py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="font-serif text-[40px] md:text-[48px] text-charcoal leading-[1.1] mb-4">{locale === 'ar' ? 'عقاراتنا' : 'Our properties'}</h1>
          <p className="font-sans text-[16px] text-taupe">{locale === 'ar' ? 'تصفح مجموعتنا الحصرية من المنازل الفاخرة' : 'Browse our exclusive collection of luxury homes'}</p>
        </div>
      </section>

      <div className="sticky top-[64px] z-30 bg-white border-b border-light-gray overflow-hidden" style={{borderWidth:'0 0 0.5px 0'}}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 py-3">
            <div className="relative flex-1 md:flex-none md:w-[280px] lg:w-[340px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder={locale === 'ar' ? 'ابحث بالاسم أو الموقع...' : 'Search by name or location…'} value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} className="w-full h-[40px] pl-9 pr-4 font-sans text-[14px] text-charcoal border border-light-gray rounded-sm placeholder:text-taupe placeholder:italic focus:outline-none focus:border-charcoal transition-all duration-200" style={{borderWidth:'0.5px'}} />
            </div>
            <div className="hidden md:flex items-center justify-center flex-1 min-w-0">
              {(['All',...STATUSES] as string[]).map((s,i)=>{
                const label = i === 0 ? (locale === 'ar' ? 'الكل' : 'All') : localiseLabel(s, STATUS_AR, locale)
                return (
                <button key={s} onClick={()=>{setStatusTab(s);setPage(1)}} className={`relative h-[40px] px-4 font-sans text-[13px] whitespace-nowrap flex-shrink-0 transition-colors duration-150 cursor-pointer bg-transparent border-none ${statusTab===s?'text-charcoal font-medium':'text-taupe hover:text-charcoal'}`}>
                  {label}{statusTab===s&&<span className="absolute bottom-0 left-0 right-0 h-[2px] bg-charcoal"/>}
                </button>
              )})}
            </div>
            <button onClick={openDrawer} className="flex items-center gap-2 h-[40px] px-5 font-sans text-[13px] font-medium text-charcoal bg-white border border-charcoal rounded-sm hover:bg-light-gray/30 transition-colors cursor-pointer flex-shrink-0 ml-auto md:ml-0" style={{borderWidth:'0.5px'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              {locale === 'ar' ? 'الفلاتر' : 'Filters'}
              {countActive(filters)>0&&<span className="flex items-center justify-center w-[18px] h-[18px] bg-gold text-charcoal font-sans text-[10px] font-medium rounded-full">{countActive(filters)}</span>}
            </button>
          </div>
          <div className="md:hidden flex items-center overflow-x-auto border-t border-light-gray" style={{borderWidth:'0.5px 0 0 0',scrollbarWidth:'none'}}>
            {(['All',...STATUSES] as string[]).map((s,i)=>{
              const label = i === 0 ? (locale === 'ar' ? 'الكل' : 'All') : localiseLabel(s, STATUS_AR, locale)
              return (
              <button key={s} onClick={()=>{setStatusTab(s);setPage(1)}} className={`relative h-[40px] px-4 font-sans text-[13px] whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer bg-transparent border-none ${statusTab===s?'text-charcoal font-medium':'text-taupe'}`}>
                {label}{statusTab===s&&<span className="absolute bottom-0 left-0 right-0 h-[2px] bg-charcoal"/>}
              </button>
            )})}
          </div>
          {chips.length>0&&(
            <div className="flex flex-wrap items-center gap-2 py-2 border-t border-light-gray" style={{borderWidth:'0.5px 0 0 0'}}>
              {chips.map(c=>(
                <button key={c.label} onClick={c.clear} className="flex items-center gap-1.5 h-[26px] px-3 font-sans text-[12px] text-charcoal bg-gold/10 border border-gold/40 rounded-sm hover:bg-gold/20 transition-colors cursor-pointer" style={{borderWidth:'0.5px'}}>
                  {c.label}<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              ))}
              <button onClick={clearAll} className="font-sans text-[12px] text-taupe hover:text-charcoal underline bg-transparent border-none cursor-pointer ml-1">{locale === 'ar' ? 'مسح الكل' : 'Clear all'}</button>
            </div>
          )}
        </div>
      </div>

      <section className="py-10 md:py-14 px-4 md:px-8 max-w-[1200px] mx-auto">
        {loading&&(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n=>(
              <div key={n} className="rounded-sm overflow-hidden border border-light-gray animate-pulse" style={{borderWidth:'0.5px'}}>
                <div className="bg-light-gray h-[240px]"/>
                <div className="p-5 space-y-3"><div className="bg-light-gray h-5 rounded w-3/4"/><div className="bg-light-gray h-4 rounded w-1/3"/><div className="bg-light-gray h-3 rounded w-1/2"/></div>
              </div>
            ))}
          </div>
        )}
        {error&&(
          <div className="text-center py-24">
            <p className="font-serif text-[24px] text-charcoal mb-3">{locale === 'ar' ? 'تعذّر تحميل العقارات' : 'Unable to load properties'}</p>
            <p className="font-sans text-[14px] text-taupe mb-6">{locale === 'ar' ? 'يرجى التحقق من اتصالك والمحاولة مجدداً.' : 'Please check your connection and try again.'}</p>
            <button onClick={()=>window.location.reload()} className="font-sans text-[13px] font-medium text-charcoal underline bg-transparent border-none cursor-pointer">{locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}</button>
          </div>
        )}
        {!loading&&!error&&(
          <>
            <p className="font-sans text-[13px] text-taupe mb-6">{filtered.length} {locale === 'ar' ? 'عقار' : (filtered.length===1?'property':'properties')}</p>
            {paginated.length>0?(
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginated.map(p=>(
                    <Link key={p.id} href={`/properties/${p.id}`} className="block group no-underline">
                      <div className="bg-white border-light-gray rounded-sm overflow-hidden transition-shadow duration-200 group-hover:shadow-hover" style={{borderWidth:'0.5px'}}>
                        <div className="relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]??'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'} alt={p.title} className="w-full h-[240px] object-cover transition-transform duration-500 group-hover:scale-105"/>
                          <span className={`absolute top-3 left-3 font-sans text-[11px] font-medium px-2.5 py-1 rounded-sm ${statusBadge[p.status]??'bg-white/90 text-charcoal'}`}>{localiseLabel(p.status, STATUS_AR, locale)}</span>
                          <span className="absolute top-3 right-3 font-sans text-[11px] text-taupe bg-white/90 px-2.5 py-1 rounded-sm">{localiseLabel(p.type, TYPE_AR, locale)}</span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-serif text-[18px] text-charcoal mb-2">{localise(p.title, p.titleAr, locale)}</h3>
                          <p className="font-sans text-[16px] font-medium text-gold mb-3">{p.price}</p>
                          <p className="font-sans text-[13px] text-taupe mb-1">{p.bedrooms} {locale === 'ar' ? 'غرف' : 'bed'} · {p.bathrooms} {locale === 'ar' ? 'حمام' : 'bath'} · {p.area}</p>
                          <p className="font-sans text-[12px] text-mid-gray italic">{localiseLabel(p.neighbourhood, NEIGHBOURHOOD_AR, locale)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {totalPages>1&&(
                  <div className="flex items-center justify-center gap-2 mt-14">
                    <button onClick={()=>{setPage(p=>Math.max(1,p-1));window.scrollTo({top:0,behavior:'smooth'})}} disabled={page===1} className="flex items-center justify-center w-[36px] h-[36px] border border-light-gray rounded-sm text-taupe hover:border-charcoal hover:text-charcoal transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-white" style={{borderWidth:'0.5px'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(n=>{
                      const isA=n===page; const isN=Math.abs(n-page)<=1||n===1||n===totalPages
                      if (!isN&&Math.abs(n-page)===2) return <span key={n} className="font-sans text-[13px] text-taupe px-1">…</span>
                      if (!isN) return null
                      return <button key={n} onClick={()=>{setPage(n);window.scrollTo({top:0,behavior:'smooth'})}} className={`flex items-center justify-center w-[36px] h-[36px] font-sans text-[13px] rounded-sm border transition-colors cursor-pointer ${isA?'bg-charcoal text-white border-charcoal':'bg-white text-charcoal border-light-gray hover:border-charcoal'}`} style={{borderWidth:'0.5px'}}>{n}</button>
                    })}
                    <button onClick={()=>{setPage(p=>Math.min(totalPages,p+1));window.scrollTo({top:0,behavior:'smooth'})}} disabled={page===totalPages} className="flex items-center justify-center w-[36px] h-[36px] border border-light-gray rounded-sm text-taupe hover:border-charcoal hover:text-charcoal transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-white" style={{borderWidth:'0.5px'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
              </>
            ):(
              <div className="text-center py-24">
                <p className="font-serif text-[24px] text-charcoal mb-3">{locale === 'ar' ? 'لا توجد عقارات' : 'No properties found'}</p>
                <p className="font-sans text-[14px] text-taupe mb-6">{locale === 'ar' ? 'جرب تعديل البحث أو إزالة بعض الفلاتر.' : 'Try adjusting your search or clearing some filters.'}</p>
                <button onClick={clearAll} className="font-sans text-[13px] font-medium text-charcoal underline bg-transparent border-none cursor-pointer">{locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}</button>
              </div>
            )}
          </>
        )}
      </section>

      {mounted&&(
        <div className="fixed inset-0 z-50 transition-all duration-300" style={{backdropFilter:visible?'blur(4px)':'blur(0px)',WebkitBackdropFilter:visible?'blur(4px)':'blur(0px)',backgroundColor:visible?'rgba(31,31,31,0.3)':'rgba(31,31,31,0)'}}>
          <div ref={drawerRef} className="absolute top-0 right-0 h-full bg-white flex flex-col" style={{width:'min(400px,92vw)',transform:visible?'translateX(0)':'translateX(100%)',transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)',boxShadow:'-8px 0 40px rgba(0,0,0,0.1)'}}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-light-gray flex-shrink-0" style={{borderWidth:'0 0 0.5px 0'}}>
              <h2 className="font-serif text-[20px] text-charcoal">{locale === 'ar' ? 'فلترة العقارات' : 'Filter properties'}</h2>
              <button onClick={closeDrawer} className="w-8 h-8 flex items-center justify-center text-taupe hover:text-charcoal transition-colors bg-transparent border-none cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              <DS title={locale === 'ar' ? 'الحالة' : 'Status'}>{STATUSES.map(s=><PT key={s} label={localiseLabel(s, STATUS_AR, locale)} active={draft.statuses.includes(s)} onClick={()=>setDraft(d=>({...d,statuses:toggle(d.statuses,s)}))}/>)}</DS>
              <DS title={locale === 'ar' ? 'نوع العقار' : 'Property type'}>{TYPES.map(t=><PT key={t} label={localiseLabel(t, TYPE_AR, locale)} active={draft.types.includes(t)} onClick={()=>setDraft(d=>({...d,types:toggle(d.types,t)}))}/>)}</DS>
              <DS title={locale === 'ar' ? 'نطاق السعر' : 'Price range'}>{PRICE_RANGES.map(r=><PT key={r.label} label={r.label} active={draft.priceRange===r.label} onClick={()=>setDraft(d=>({...d,priceRange:d.priceRange===r.label?null:r.label}))}/>)}</DS>
              <DS title={locale === 'ar' ? 'غرف النوم' : 'Bedrooms'}>{BEDROOMS.map(b=><PT key={b} label={b} active={draft.bedrooms.includes(b)} onClick={()=>setDraft(d=>({...d,bedrooms:toggle(d.bedrooms,b)}))}/>)}</DS>
              <DS title={locale === 'ar' ? 'الحي' : 'Neighbourhood'}>
                <div className="w-full space-y-3">
                  {LOCATIONS.map(loc=>{
                    const checked=draft.locations.includes(loc)
                    return (
                      <label key={loc} className="flex items-center gap-3 cursor-pointer" onClick={()=>setDraft(d=>({...d,locations:toggle(d.locations,loc)}))}>
                        <span className={`w-[18px] h-[18px] flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors ${checked?'bg-charcoal border-charcoal':'bg-white border-light-gray'}`} style={{borderWidth:'0.5px'}}>
                          {checked&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>}
                        </span>
                        <span className="font-sans text-[14px] text-charcoal select-none">{localiseLabel(loc, NEIGHBOURHOOD_AR, locale)}</span>
                      </label>
                    )
                  })}
                </div>
              </DS>
            </div>
            <div className="px-6 py-5 border-t border-light-gray flex gap-3 flex-shrink-0" style={{borderWidth:'0.5px 0 0 0'}}>
              <button onClick={()=>setDraft(EMPTY)} className="flex-1 h-[44px] font-sans text-[14px] font-medium text-charcoal bg-white border border-charcoal rounded-sm hover:bg-light-gray/20 transition-colors cursor-pointer" style={{borderWidth:'0.5px'}}>{locale === 'ar' ? 'إعادة تعيين' : 'Reset'}</button>
              <button onClick={applyDraft} className="flex-1 h-[44px] font-sans text-[14px] font-medium text-charcoal bg-gold hover:bg-gold-dark rounded-sm transition-colors border-none cursor-pointer">{locale === 'ar' ? `عرض ${draftResult.length} عقار` : `Show ${draftResult.length} ${draftResult.length===1?'property':'properties'}`}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
function DS({title,children}:{title:string;children:React.ReactNode}) {
  return <div><p className="font-sans text-[11px] font-medium text-taupe uppercase tracking-wider mb-3">{title}</p><div className="flex flex-wrap gap-2">{children}</div></div>
}
function PT({label,active,onClick}:{label:string;active:boolean;onClick:()=>void}) {
  return <button onClick={onClick} className={`h-[34px] px-4 font-sans text-[13px] rounded-sm border transition-all cursor-pointer ${active?'bg-charcoal text-white border-charcoal':'bg-white text-charcoal border-light-gray hover:border-charcoal/50'}`} style={{borderWidth:'0.5px'}}>{label}</button>
}
