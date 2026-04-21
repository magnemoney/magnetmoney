/**
 * MagnetMoney — Admin App (React Native)
 * Package: com.magnetmoney.admin
 *
 * Screens: Login · Dashboard · Applications · Users · Settings
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Platform, StatusBar, ActivityIndicator,
  SafeAreaView, FlatList, Alert, Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  accent:  '#B8E000', blue:  '#4F8EFF', blue2: '#6BA3FF',
  purple:  '#8B5CF6', cyan:  '#00E5FF',
  red:     '#E8192C', gold:  '#FFD700', green: '#00D97E',
  dark:    '#050810', dark2: '#090C14',
  panel:   '#080D1C', card:  '#0F1420', card2: '#141B2E',
  border:  'rgba(184,224,0,0.12)', border2: 'rgba(255,255,255,0.07)',
  adminBorder: 'rgba(79,142,255,0.15)',
  white:   '#fff',    gray:  '#5A6580', gray2: '#8A96B0',
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const storage = {
  get:    async (key:string, fallback:any=null) => { try{ const v=await AsyncStorage.getItem(key); return v?JSON.parse(v):fallback; }catch{ return fallback; } },
  set:    async (key:string, val:any) => { try{ await AsyncStorage.setItem(key,JSON.stringify(val)); }catch{} },
  raw:    async (key:string) => { try{ return (await AsyncStorage.getItem(key))||''; }catch{ return ''; } },
  setRaw: async (key:string, val:string) => { try{ await AsyncStorage.setItem(key,val); }catch{} },
  remove: async (key:string) => { try{ await AsyncStorage.removeItem(key); }catch{} },
};
const getApps  = async () => storage.get('mm_applications',[]);
const saveApps = async (a:any[]) => storage.set('mm_applications',a);
const getUsers = async () => storage.get('mm_users',[]);

const ADMIN_CREDENTIALS = [
  { email:'admin@magnetmoney.in', password:'Admin@2025#Secure', name:'Admin' },
  { email:'dkborana', password:'admin@1234', name:'DK Borana' },
];

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg]     = useState('');
  const [visible, setVis] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const showToast = useCallback((m:string)=>{
    setMsg(m); setVis(true);
    Animated.sequence([
      Animated.timing(anim,{toValue:1,duration:300,useNativeDriver:true}),
      Animated.delay(2200),
      Animated.timing(anim,{toValue:0,duration:300,useNativeDriver:true}),
    ]).start(()=>setVis(false));
  },[anim]);
  const ToastEl = visible ? (
    <Animated.View style={[A.toast,{opacity:anim}]}>
      <Text style={A.toastTxt}>{msg}</Text>
    </Animated.View>
  ) : null;
  return { showToast, ToastEl };
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }:{status:string}) {
  const map:Record<string,[string,string,string]> = {
    pending: [C.gold,'rgba(255,215,0,0.12)','⏳ Pending'],
    approved:[C.green,'rgba(0,217,126,0.12)','✅ Approved'],
    rejected:[C.red,'rgba(232,25,44,0.12)','❌ Rejected'],
    disbursed:[C.accent,'rgba(184,224,0,0.12)','💸 Disbursed'],
    active:  [C.green,'rgba(0,217,126,0.12)','🟢 Active'],
  };
  const [color,bg,label]=map[status]||[C.gold,'rgba(255,215,0,0.12)',status];
  return (
    <View style={[A.badge,{backgroundColor:bg}]}>
      <View style={[A.badgeDot,{backgroundColor:color}]}/>
      <Text style={[A.badgeTxt,{color}]}>{label}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin, showToast }:{onLogin:(u:any)=>void, showToast:(m:string)=>void}) {
  const [email,setEmail]   = useState('');
  const [pw,setPw]         = useState('');
  const [showPw,setShowPw] = useState(false);
  const [loading,setLoad]  = useState(false);
  const [err,setErr]       = useState('');
  const [attempts,setAtt]  = useState(0);

  const handleLogin = () => {
    setErr('');
    if (!email){ setErr('Admin email daalo'); return; }
    if (!pw){ setErr('Password daalo'); return; }
    const m = ADMIN_CREDENTIALS.find(c=>(c.email===email||c.email===email.toLowerCase())&&c.password===pw);
    setLoad(true);
    setTimeout(()=>{
      setLoad(false);
      if (m){ showToast('✅ Access mila!'); onLogin(m); }
      else { const na=attempts+1; setAtt(na); setErr(`Galat credentials. ${5-na} attempts bache.`); setPw(''); }
    },1200);
  };

  return (
    <View style={{flex:1,backgroundColor:C.dark}}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark}/>
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:24}} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={{alignItems:'center',marginBottom:28}}>
            <View style={A.adminLogo}><Text style={{fontSize:28}}>💰</Text></View>
            <Text style={{fontWeight:'900',fontSize:20,color:C.white,marginTop:10}}>Magnet<Text style={{color:C.blue2}}>Money</Text></Text>
            <View style={A.adminBadge}><Text style={{fontSize:10,fontWeight:'700',color:C.blue2,letterSpacing:0.8}}>🔐 ADMIN PORTAL</Text></View>
          </View>

          <View style={A.loginCard}>
            {/* SSL pill */}
            <View style={A.sslPill}>
              <View style={{width:6,height:6,borderRadius:3,backgroundColor:C.green}}/>
              <Text style={{fontSize:10,color:C.gray2,fontFamily:Platform.OS==='ios'?'Courier':'monospace'}}>SSL Encrypted · <Text style={{color:C.green,fontWeight:'700'}}>Secure Connection</Text></Text>
            </View>

            {/* Demo creds */}
            <View style={A.demoCreds}>
              <Text style={{fontSize:10,fontWeight:'700',color:C.green,textTransform:'uppercase',letterSpacing:0.8,marginBottom:5}}>🔐 Demo Credentials</Text>
              <Text style={{fontSize:11,color:C.gray2,fontFamily:Platform.OS==='ios'?'Courier':'monospace'}}>admin@magnetmoney.in / Admin@2025#Secure</Text>
            </View>

            <Text style={A.label}>ADMIN EMAIL / ID</Text>
            <TextInput style={A.inp} value={email} onChangeText={setEmail} placeholder="admin@magnetmoney.in" placeholderTextColor={C.gray} autoCapitalize="none" keyboardType="email-address"/>
            <Text style={A.label}>PASSWORD</Text>
            <View style={{position:'relative',marginBottom:12}}>
              <TextInput style={[A.inp,{marginBottom:0,paddingRight:48}]} value={pw} onChangeText={setPw} placeholder="••••••••••••" placeholderTextColor={C.gray} secureTextEntry={!showPw} onSubmitEditing={handleLogin}/>
              <TouchableOpacity style={{position:'absolute',right:12,top:14}} onPress={()=>setShowPw(!showPw)}>
                <Text style={{fontSize:15,color:C.gray2}}>{showPw?'🙈':'👁️'}</Text>
              </TouchableOpacity>
            </View>
            {!!err && <Text style={A.err}>{err}</Text>}
            <TouchableOpacity style={[A.btnBlue,loading&&{opacity:0.6}]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={A.btnBlueTxt}>🔐 Sign In</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ adminUser, onLogout, showToast }:{adminUser:any, onLogout:()=>void, showToast:(m:string)=>void}) {
  const [page, setPage]         = useState<string>('dashboard');
  const [apps, setApps]         = useState<any[]>([]);
  const [users, setUsers]       = useState<any[]>([]);
  const [filterStatus, setFilt] = useState('all');
  const [modalApp, setModal]    = useState<any>(null);
  const [processingFee, setFee] = useState('999');
  const [brandName, setBrand]   = useState('MagnetMoney');
  const [emailjsKey, setEjKey]  = useState('');
  const [emailjsSvc, setEjSvc]  = useState('');
  const [emailjsTpl, setEjTpl]  = useState('');

  const loadData = async () => {
    setApps(await getApps());
    setUsers(await getUsers());
    const fee = await storage.raw('mm_processing_fee');
    const brand = await storage.raw('mm_app_name');
    if (fee) setFee(fee);
    if (brand) setBrand(brand);
  };

  useEffect(() => { loadData(); const t = setInterval(loadData,5000); return ()=>clearInterval(t); }, []);

  const pending  = apps.filter(a=>a.status==='pending').length;
  const approved = apps.filter(a=>['approved','disbursed'].includes(a.status)).length;
  const rejected = apps.filter(a=>a.status==='rejected').length;
  const filtered = filterStatus==='all' ? apps : apps.filter(a=>a.status===filterStatus);

  const updateStatus = async (id:string, status:string) => {
    const updated = apps.map(a=>a.id===id?{...a,status}:a);
    await saveApps(updated); setApps(updated);
    showToast(`${status==='approved'?'✅ Approved':'❌ Rejected'}: ${id}`);
  };

  // ── NAV ITEMS ──
  const navSections = [
    { label:'Main', items:[
      {id:'dashboard', icon:'📊', label:'Dashboard'},
      {id:'applications', icon:'📋', label:'Applications', badge:pending},
      {id:'users', icon:'👥', label:'Users', badge:users.length, green:true},
    ]},
    { label:'Config', items:[
      {id:'logo-branding', icon:'🎨', label:'Logo & Branding'},
      {id:'payment-gateway', icon:'💳', label:'Payment Gateway'},
      {id:'qr-codes', icon:'📱', label:'QR Codes'},
    ]},
    { label:'Auth & Messaging', items:[
      {id:'otp-server', icon:'📟', label:'OTP Server'},
      {id:'emailjs-config', icon:'📧', label:'EmailJS Config'},
      {id:'sms-bulk', icon:'💬', label:'Bulk SMS'},
    ]},
    { label:'System', items:[
      {id:'settings', icon:'⚙️', label:'App Settings'},
      {id:'clear-data', icon:'🗑️', label:'Clear Data', danger:true},
    ]},
  ];

  // ── SIDEBAR (rendered as top tabs on mobile) ──
  const AllNavItems = navSections.flatMap(s=>s.items);

  return (
    <View style={{flex:1,backgroundColor:C.dark}}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark}/>
      <SafeAreaView style={{flex:1}}>

        {/* Top bar */}
        <View style={A.topBar}>
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
            <View style={A.topLogo}><Text style={{fontSize:16}}>💰</Text></View>
            <Text style={{fontWeight:'900',fontSize:15,color:C.white}}>Magnet<Text style={{color:C.blue2}}>Money</Text></Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
            <View style={A.liveIndicator}>
              <View style={{width:6,height:6,borderRadius:3,backgroundColor:apps.length>0?C.green:C.gold}}/>
              <Text style={{fontSize:10,fontWeight:'700',color:apps.length>0?C.green:C.gold}}>{apps.length>0?`${apps.length} Apps`:'No Data'}</Text>
            </View>
            <TouchableOpacity onPress={onLogout} style={A.logoutBtn}>
              <Text style={{fontSize:12,fontWeight:'700',color:C.red}}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page nav tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={A.navScroll} contentContainerStyle={{paddingHorizontal:12,paddingVertical:8,gap:8}}>
          {AllNavItems.map(item=>(
            <TouchableOpacity key={item.id} style={[A.navTab, page===item.id&&A.navTabActive]} onPress={()=>setPage(item.id)}>
              <Text style={{fontSize:13}}>{item.icon}</Text>
              <Text style={[A.navTabTxt, page===item.id&&{color:C.blue2}]}>{item.label}</Text>
              {(item.badge??0)>0 && (
                <View style={[A.navBadge, item.green&&{backgroundColor:'rgba(0,217,126,0.15)'}]}>
                  <Text style={[A.navBadgeTxt, item.green&&{color:C.green}]}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CONTENT */}
        <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">

          {/* DASHBOARD */}
          {page==='dashboard' && (
            <View>
              <Text style={A.pageTitle}>Dashboard</Text>
              <View style={{flexDirection:'row',gap:10,marginBottom:16}}>
                {[['📋','Total',apps.length,C.white],['⏳','Pending',pending,C.gold],['✅','Approved',approved,C.green],['❌','Rejected',rejected,C.red]].map(([icon,label,val,col])=>(
                  <View key={String(label)} style={[A.statCard,{flex:1}]}>
                    <Text style={{fontSize:20}}>{icon}</Text>
                    <Text style={{fontSize:18,fontWeight:'900',color:col as string,marginTop:4}}>{val}</Text>
                    <Text style={{fontSize:9,color:C.gray2,textTransform:'uppercase',fontWeight:'700'}}>{label}</Text>
                  </View>
                ))}
              </View>
              <View style={A.cfgPanel}>
                <Text style={{fontWeight:'800',fontSize:14,color:C.white,marginBottom:12}}>Recent Applications</Text>
                {apps.slice(0,5).map(app=>(
                  <View key={app.id} style={A.appRow}>
                    <View style={{flex:1}}>
                      <Text style={{fontWeight:'700',fontSize:13,color:C.white}}>{app.id}</Text>
                      <Text style={{fontSize:11,color:C.gray2}}>{app.user} · {app.date}</Text>
                    </View>
                    <StatusBadge status={app.status}/>
                  </View>
                ))}
                {apps.length===0 && <Text style={{color:C.gray2,textAlign:'center',padding:20}}>Koi applications nahi hain</Text>}
              </View>
            </View>
          )}

          {/* APPLICATIONS */}
          {page==='applications' && (
            <View>
              <Text style={A.pageTitle}>Loan Applications</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>
                <View style={{flexDirection:'row',gap:8}}>
                  {['all','pending','approved','rejected','disbursed'].map(f=>(
                    <TouchableOpacity key={f} style={[A.filterBtn, filterStatus===f&&A.filterBtnActive]} onPress={()=>setFilt(f)}>
                      <Text style={[A.filterBtnTxt, filterStatus===f&&{color:C.blue2}]}>{f.charAt(0).toUpperCase()+f.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {filtered.map(app=>(
                <TouchableOpacity key={app.id} style={A.cfgPanel} onPress={()=>setModal(app)}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <View>
                      <Text style={{fontWeight:'800',fontSize:14,color:C.white}}>{app.id}</Text>
                      <Text style={{fontSize:12,color:C.gray2,marginTop:2}}>{app.user} · {app.date}</Text>
                    </View>
                    <StatusBadge status={app.status}/>
                  </View>
                  <View style={{flexDirection:'row',gap:8}}>
                    {[['Amount',`₹${Number(app.amount).toLocaleString('en-IN')}`],['EMI',`₹${Number(app.emi).toLocaleString('en-IN')}/mo`],['Purpose',app.purpose]].map(([k,v])=>(
                      <View key={k} style={{flex:1,backgroundColor:C.dark2,borderRadius:8,padding:8}}>
                        <Text style={{fontSize:9,color:C.gray2,textTransform:'uppercase'}}>{k}</Text>
                        <Text style={{fontSize:12,fontWeight:'700',color:C.white,marginTop:2}}>{v||'—'}</Text>
                      </View>
                    ))}
                  </View>
                  {app.status==='pending' && (
                    <View style={{flexDirection:'row',gap:8,marginTop:12}}>
                      <TouchableOpacity style={[A.actionBtn,{backgroundColor:'rgba(0,230,118,0.12)',borderColor:'rgba(0,230,118,0.3)'}]} onPress={()=>updateStatus(app.id,'approved')}>
                        <Text style={{color:C.green,fontWeight:'700',fontSize:12}}>✅ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[A.actionBtn,{backgroundColor:'rgba(255,61,87,0.12)',borderColor:'rgba(255,61,87,0.3)'}]} onPress={()=>updateStatus(app.id,'rejected')}>
                        <Text style={{color:C.red,fontWeight:'700',fontSize:12}}>❌ Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[A.actionBtn,{flex:1}]} onPress={()=>updateStatus(app.id,'disbursed')}>
                        <Text style={{color:C.accent,fontWeight:'700',fontSize:12}}>💸 Disburse</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {filtered.length===0 && (
                <View style={{alignItems:'center',padding:48}}>
                  <Text style={{fontSize:40,marginBottom:12}}>📋</Text>
                  <Text style={{color:C.gray2}}>Is filter mein koi application nahi</Text>
                </View>
              )}
            </View>
          )}

          {/* USERS */}
          {page==='users' && (
            <View>
              <Text style={A.pageTitle}>Users ({users.length})</Text>
              {users.map((u:any)=>(
                <View key={u.id} style={A.cfgPanel}>
                  <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
                    <View style={{width:42,height:42,borderRadius:21,backgroundColor:'rgba(79,142,255,0.12)',alignItems:'center',justifyContent:'center'}}>
                      <Text style={{fontSize:18}}>👤</Text>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={{fontWeight:'700',fontSize:14,color:C.white}}>{u.name}</Text>
                      <Text style={{fontSize:11,color:C.gray2,marginTop:2}}>{u.email}</Text>
                      <Text style={{fontSize:11,color:C.gray2}}>{u.mobile} · Joined: {u.joined}</Text>
                    </View>
                    <StatusBadge status={u.status||'active'}/>
                  </View>
                </View>
              ))}
              {users.length===0 && <Text style={{color:C.gray2,textAlign:'center',padding:48}}>Koi users registered nahi hain</Text>}
            </View>
          )}

          {/* LOGO & BRANDING */}
          {page==='logo-branding' && (
            <View>
              <Text style={A.pageTitle}>Logo & Branding</Text>
              <View style={A.cfgPanel}>
                <Text style={A.label}>APP NAME</Text>
                <TextInput style={A.inp} value={brandName} onChangeText={setBrand}/>
                <Text style={A.label}>TAGLINE</Text>
                <TextInput style={A.inp} defaultValue="Instant Personal Loans · 100% Digital" placeholderTextColor={C.gray}/>
                <Text style={A.label}>LOGO UPLOAD</Text>
                <TouchableOpacity style={A.uploadBox}>
                  <Text style={{fontSize:28,marginBottom:8}}>🖼️</Text>
                  <Text style={{fontSize:12,fontWeight:'700',color:C.gray2}}>Logo upload karo</Text>
                  <Text style={{fontSize:11,color:C.gray}}>PNG, JPG, SVG · Max 2MB</Text>
                </TouchableOpacity>
                <View style={A.previewBox}>
                  <View style={A.previewLogo}><Text style={{fontSize:22}}>💰</Text></View>
                  <View>
                    <Text style={{fontWeight:'900',fontSize:18,color:C.white}}>{brandName}</Text>
                    <Text style={{fontSize:11,color:C.gray2}}>Instant Personal Loans · 100% Digital</Text>
                  </View>
                </View>
                <TouchableOpacity style={[A.btnBlue,{marginTop:12}]} onPress={async()=>{ await storage.setRaw('mm_app_name',brandName); showToast('✅ Branding save ho gaya!'); }}>
                  <Text style={A.btnBlueTxt}>💾 Save & Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PAYMENT GATEWAY */}
          {page==='payment-gateway' && (
            <View>
              <Text style={A.pageTitle}>Payment Gateway</Text>
              <View style={A.cfgPanel}>
                <Text style={A.label}>ACTIVE GATEWAY</Text>
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:14}}>
                  {['⚡ Razorpay','💰 PayU','💸 Cashfree','📱 Direct UPI'].map(g=>(
                    <TouchableOpacity key={g} style={[A.selOpt, g.includes('Razorpay')&&A.selOptActive]}>
                      <Text style={{fontSize:13,fontWeight:'600',color:g.includes('Razorpay')?C.blue2:C.gray2}}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={A.label}>KEY ID</Text>
                <TextInput style={A.inp} placeholder="rzp_live_xxxxxxxxxxxxxxxx" placeholderTextColor={C.gray} autoCapitalize="none"/>
                <Text style={A.label}>KEY SECRET</Text>
                <TextInput style={A.inp} placeholder="••••••••••••••••" placeholderTextColor={C.gray} secureTextEntry/>
                <View style={{flexDirection:'row',gap:10}}>
                  <View style={{flex:1}}>
                    <Text style={A.label}>PROCESSING FEE (₹)</Text>
                    <TextInput style={A.inp} value={processingFee} onChangeText={setFee} keyboardType="number-pad"/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={A.label}>GST (%)</Text>
                    <TextInput style={A.inp} defaultValue="18" keyboardType="number-pad"/>
                  </View>
                </View>
                <TouchableOpacity style={A.btnBlue} onPress={async()=>{ await storage.setRaw('mm_processing_fee',processingFee); showToast('💾 Payment gateway save ho gaya!'); }}>
                  <Text style={A.btnBlueTxt}>💾 Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* QR CODES */}
          {page==='qr-codes' && (
            <View>
              <Text style={A.pageTitle}>QR Code Configuration</Text>
              <View style={A.cfgPanel}>
                <View style={{flexDirection:'row',gap:10,marginBottom:14}}>
                  <View style={{flex:1}}>
                    <Text style={A.label}>UPI ID</Text>
                    <TextInput style={A.inp} defaultValue="magnetmoney@upi" autoCapitalize="none"/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={A.label}>AMOUNT (₹)</Text>
                    <TextInput style={A.inp} value={processingFee} onChangeText={setFee} keyboardType="number-pad"/>
                  </View>
                </View>
                <View style={{backgroundColor:C.card2,borderRadius:14,padding:16,alignItems:'center',marginBottom:14}}>
                  <Text style={{fontSize:11,fontWeight:'700',color:C.gray2,textTransform:'uppercase',letterSpacing:0.8,marginBottom:10}}>Live Preview</Text>
                  <View style={{backgroundColor:'#fff',borderRadius:12,padding:14,alignItems:'center'}}>
                    <Text style={{fontSize:12,color:'#111',fontWeight:'700'}}>magnetmoney@upi</Text>
                    <Text style={{fontSize:11,color:'#555',marginTop:4}}>Amount: <Text style={{color:C.accent,fontWeight:'700'}}>₹{processingFee}</Text></Text>
                    <Text style={{fontSize:10,color:'#888',marginTop:8,textAlign:'center'}}>QR Image: integrate with{'\n'}react-native-qrcode-svg</Text>
                  </View>
                </View>
                <TouchableOpacity style={A.btnBlue} onPress={async()=>{ await storage.setRaw('mm_processing_fee',processingFee); showToast('✅ QR Code & Fee save ho gaya!'); }}>
                  <Text style={A.btnBlueTxt}>💾 Save & Apply to App</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* OTP SERVER */}
          {page==='otp-server' && (
            <View>
              <Text style={A.pageTitle}>OTP Provider Settings</Text>
              <View style={A.cfgPanel}>
                {[['emailjs','📧','EmailJS (Free)'],['msg91','💬','MSG91'],['fast2sms','⚡','Fast2SMS'],['twilio','📱','Twilio']].map(([id,icon,label])=>(
                  <TouchableOpacity key={id} style={A.providerRow}>
                    <Text style={{fontSize:18}}>{icon}</Text>
                    <Text style={{flex:1,fontSize:13,fontWeight:'600',color:C.white}}>{label}</Text>
                    {id==='emailjs' && <View style={{backgroundColor:'rgba(0,230,118,0.12)',borderRadius:100,paddingHorizontal:8,paddingVertical:2}}><Text style={{fontSize:10,fontWeight:'700',color:C.green}}>✅ Configured</Text></View>}
                    <Text style={{color:C.gray2,fontSize:16}}>›</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[A.btnBlue,{marginTop:8}]} onPress={()=>setPage('emailjs-config')}>
                  <Text style={A.btnBlueTxt}>📧 Configure EmailJS →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* EMAILJS */}
          {page==='emailjs-config' && (
            <View>
              <Text style={A.pageTitle}>EmailJS Configuration</Text>
              <View style={A.cfgPanel}>
                <View style={A.helpBox}>
                  <Text style={{fontSize:12,color:C.green,fontWeight:'700',marginBottom:6}}>✅ EmailJS Setup (Free — 200 emails/month)</Text>
                  <Text style={{fontSize:11,color:C.gray2,lineHeight:18}}>1. emailjs.com pe sign up karo{'\n'}2. Email Service banao (Gmail) → Service ID copy karo{'\n'}3. Email Template banao with {'{{otp}}'} variable{'\n'}4. Account → API Keys se Public Key copy karo</Text>
                </View>
                <View style={{flexDirection:'row',gap:10}}>
                  <View style={{flex:1}}><Text style={A.label}>SERVICE ID</Text><TextInput style={A.inp} value={emailjsSvc} onChangeText={setEjSvc} placeholder="service_abc123" placeholderTextColor={C.gray} autoCapitalize="none"/></View>
                  <View style={{flex:1}}><Text style={A.label}>TEMPLATE ID</Text><TextInput style={A.inp} value={emailjsTpl} onChangeText={setEjTpl} placeholder="template_otp1234" placeholderTextColor={C.gray} autoCapitalize="none"/></View>
                </View>
                <Text style={A.label}>PUBLIC KEY</Text>
                <TextInput style={A.inp} value={emailjsKey} onChangeText={setEjKey} placeholder="xxxxxxxxxxxxxxxxxxxx" placeholderTextColor={C.gray} autoCapitalize="none"/>
                <TouchableOpacity style={A.btnBlue} onPress={async()=>{ await storage.setRaw('mm_emailjs_service',emailjsSvc); await storage.setRaw('mm_emailjs_template',emailjsTpl); await storage.setRaw('mm_emailjs_key',emailjsKey); showToast('✅ EmailJS config save ho gaya!'); }}>
                  <Text style={A.btnBlueTxt}>💾 Save EmailJS Config</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BULK SMS */}
          {page==='sms-bulk' && (
            <View>
              <Text style={A.pageTitle}>Bulk SMS</Text>
              <View style={A.cfgPanel}>
                <Text style={A.label}>TARGET AUDIENCE</Text>
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:14}}>
                  {[`All Users (${users.length})`,'Active Users',`Pending (${pending})`,'Custom Numbers'].map((t,i)=>(
                    <TouchableOpacity key={t} style={[A.selOpt,i===0&&A.selOptActive]}>
                      <Text style={{fontSize:12,fontWeight:'600',color:i===0?C.blue2:C.gray2}}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={A.label}>SMS MESSAGE</Text>
                <TextInput style={[A.inp,{height:100,textAlignVertical:'top'}]} multiline placeholder="Dear {{name}}, aapki loan application update hui hai. — MagnetMoney Team" placeholderTextColor={C.gray}/>
                <Text style={{fontSize:11,color:C.gray2,marginBottom:12}}>Variables: <Text style={{color:C.accent}}>{'{{name}}'}</Text>, <Text style={{color:C.accent}}>{'{{amount}}'}</Text>, <Text style={{color:C.accent}}>{'{{status}}'}</Text></Text>
                <TouchableOpacity style={A.btnBlue} onPress={()=>showToast('📨 Bulk SMS queue ho gaya! SMS provider configure karo.')}>
                  <Text style={A.btnBlueTxt}>📨 Send Bulk SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SETTINGS */}
          {page==='settings' && (
            <View>
              <Text style={A.pageTitle}>App Settings</Text>
              <View style={A.cfgPanel}>
                <View style={{flexDirection:'row',gap:10}}>
                  <View style={{flex:1}}><Text style={A.label}>APP NAME</Text><TextInput style={A.inp} value={brandName} onChangeText={setBrand}/></View>
                  <View style={{flex:1}}><Text style={A.label}>PROCESSING FEE</Text><TextInput style={A.inp} value={processingFee} onChangeText={setFee} keyboardType="number-pad"/></View>
                </View>
                <View style={{flexDirection:'row',gap:10}}>
                  <View style={{flex:1}}><Text style={A.label}>MIN LOAN (₹)</Text><TextInput style={A.inp} defaultValue="10000" keyboardType="number-pad"/></View>
                  <View style={{flex:1}}><Text style={A.label}>MAX LOAN (₹)</Text><TextInput style={A.inp} defaultValue="500000" keyboardType="number-pad"/></View>
                </View>
                <View style={{flexDirection:'row',gap:10,marginBottom:8}}>
                  <View style={{flex:1}}><Text style={A.label}>INTEREST (% /month)</Text><TextInput style={A.inp} defaultValue="2.5" keyboardType="decimal-pad"/></View>
                  <View style={{flex:1}}><Text style={A.label}>REJECT WAIT (Days)</Text><TextInput style={A.inp} defaultValue="7" keyboardType="number-pad"/></View>
                </View>
                {[['🔔 Push Notifications',true],['📧 Email Notifications',true],['💬 SMS Alerts',true],['🌙 Maintenance Mode',false]].map(([label,val])=>(
                  <View key={String(label)} style={A.toggleRow}>
                    <Text style={{fontSize:13,fontWeight:'600',color:C.white,flex:1}}>{label}</Text>
                    <Switch value={val as boolean} onValueChange={()=>{}} trackColor={{false:C.border2,true:'rgba(79,142,255,0.4)'}} thumbColor={val?C.blue2:C.gray2}/>
                  </View>
                ))}
                <TouchableOpacity style={[A.btnBlue,{marginTop:14}]} onPress={async()=>{ await storage.setRaw('mm_app_name',brandName); await storage.setRaw('mm_processing_fee',processingFee); showToast('✅ Settings save ho gaye!'); }}>
                  <Text style={A.btnBlueTxt}>💾 Save All Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* CLEAR DATA */}
          {page==='clear-data' && (
            <View>
              <Text style={[A.pageTitle,{color:C.red}]}>🗑️ Clear Data</Text>
              <View style={[A.cfgPanel,{borderColor:'rgba(255,61,87,0.2)'}]}>
                <View style={A.warnBox}>
                  <Text style={{fontSize:12,color:C.gray2,lineHeight:18}}>⚠️ <Text style={{color:C.white,fontWeight:'700'}}>Warning:</Text> Yeh actions data permanently delete karte hain. Yeh undo nahi ho sakta.</Text>
                </View>
                {[['📋','Applications','Sabhi loan applications','mm_applications'],['👥','Users','Sabhi registered users','mm_users'],['⚙️','Config','Branding, QR, EmailJS settings','mm_app_name']].map(([icon,label,sub,key])=>(
                  <View key={String(label)} style={A.clearRow}>
                    <Text style={{fontSize:22}}>{icon}</Text>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:13,fontWeight:'700',color:C.white}}>{label}</Text>
                      <Text style={{fontSize:11,color:C.gray2,marginTop:2}}>{sub}</Text>
                    </View>
                    <TouchableOpacity style={A.clearBtn} onPress={()=> Alert.alert(`${label} Delete Karo?`,`Kya aap sure hain? Yeh undo nahi ho sakta.`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{ await storage.remove(key as string); loadData(); showToast(`🗑️ ${label} clear ho gaya!`); }}])}>
                      <Text style={{fontSize:11,fontWeight:'700',color:C.red}}>🗑️ Clear</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>

        {/* MODAL - Application Detail */}
        {modalApp && (
          <View style={A.modalOverlay}>
            <View style={A.modalCard}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <Text style={{fontWeight:'800',fontSize:15,color:C.white}}>{modalApp.id}</Text>
                <TouchableOpacity style={A.modalClose} onPress={()=>setModal(null)}>
                  <Text style={{color:C.gray2}}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{maxHeight:400}}>
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
                  {[['Applicant',modalApp.user],['Mobile',modalApp.mobile],['Email',modalApp.email],['PAN',modalApp.pan],['Amount',`₹${Number(modalApp.amount).toLocaleString('en-IN')}`],['Tenure',`${modalApp.tenure} Months`],['EMI',`₹${Number(modalApp.emi).toLocaleString('en-IN')}`],['Purpose',modalApp.purpose],['Employment',modalApp.employment],['State',modalApp.state],['Applied',modalApp.date],['Status',modalApp.status?.toUpperCase()]].map(([k,v])=>(
                    <View key={k} style={{width:'47%',backgroundColor:C.card2,borderRadius:10,padding:10}}>
                      <Text style={{fontSize:10,color:C.gray2,textTransform:'uppercase',marginBottom:4}}>{k}</Text>
                      <Text style={{fontSize:13,fontWeight:'700',color:k==='Amount'?C.gold:C.white}}>{v||'—'}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
              <View style={{flexDirection:'row',gap:8,marginTop:12}}>
                <TouchableOpacity style={[A.actionBtn,{flex:1,backgroundColor:'rgba(0,230,118,0.12)',borderColor:'rgba(0,230,118,0.3)'}]} onPress={()=>{ updateStatus(modalApp.id,'approved'); setModal(null); }}>
                  <Text style={{color:C.green,fontWeight:'700',fontSize:13}}>✅ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[A.actionBtn,{flex:1,backgroundColor:'rgba(255,61,87,0.12)',borderColor:'rgba(255,61,87,0.3)'}]} onPress={()=>{ updateStatus(modalApp.id,'rejected'); setModal(null); }}>
                  <Text style={{color:C.red,fontWeight:'700',fontSize:13}}>❌ Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[A.actionBtn,{paddingHorizontal:16}]} onPress={()=>setModal(null)}>
                  <Text style={{color:C.gray2,fontWeight:'700',fontSize:13}}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function MagnetMoneyAdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const { showToast, ToastEl } = useToast();

  return (
    <View style={{flex:1}}>
      {ToastEl}
      {!loggedIn
        ? <AdminLogin onLogin={u=>{ setLoggedIn(true); setAdminUser(u); }} showToast={showToast}/>
        : <AdminDashboard adminUser={adminUser} onLogout={()=>setLoggedIn(false)} showToast={showToast}/>}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const A = StyleSheet.create({
  toast:        { position:'absolute', top:60, alignSelf:'center', backgroundColor:C.card2, borderWidth:1, borderColor:C.border, paddingHorizontal:20, paddingVertical:12, borderRadius:100, zIndex:9999 },
  toastTxt:     { color:C.white, fontSize:13, fontWeight:'600' },
  badge:        { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:3, borderRadius:100 },
  badgeDot:     { width:5, height:5, borderRadius:3 },
  badgeTxt:     { fontSize:10, fontWeight:'700' },

  // Admin login
  adminLogo:    { width:64, height:64, borderRadius:18, backgroundColor:'rgba(79,142,255,0.15)', borderWidth:1, borderColor:'rgba(79,142,255,0.3)', alignItems:'center', justifyContent:'center' },
  adminBadge:   { marginTop:6, backgroundColor:'rgba(79,142,255,0.1)', borderWidth:1, borderColor:'rgba(79,142,255,0.25)', borderRadius:100, paddingHorizontal:12, paddingVertical:4 },
  loginCard:    { backgroundColor:'rgba(13,20,40,0.97)', borderWidth:1, borderColor:'rgba(79,142,255,0.2)', borderRadius:22, padding:24 },
  sslPill:      { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(0,229,255,0.04)', borderWidth:1, borderColor:'rgba(0,229,255,0.12)', borderRadius:8, padding:10, marginBottom:14 },
  demoCreds:    { backgroundColor:'rgba(0,230,118,0.05)', borderWidth:1, borderColor:'rgba(0,230,118,0.2)', borderRadius:10, padding:12, marginBottom:16, alignItems:'center' },
  label:        { fontSize:11, fontWeight:'700', color:C.gray2, letterSpacing:0.8, marginBottom:7 },
  inp:          { backgroundColor:C.dark2, borderWidth:1, borderColor:C.border2, borderRadius:9, paddingHorizontal:12, paddingVertical:10, color:C.white, fontSize:13, marginBottom:12 },
  err:          { fontSize:12, color:C.red, textAlign:'center', marginBottom:10, fontWeight:'600' },
  btnBlue:      { backgroundColor:C.blue, borderRadius:12, paddingVertical:13, alignItems:'center' },
  btnBlueTxt:   { color:'#fff', fontSize:14, fontWeight:'800' },

  // Dashboard
  topBar:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12, backgroundColor:'rgba(8,13,28,0.99)', borderBottomWidth:1, borderColor:C.adminBorder },
  topLogo:      { width:32, height:32, borderRadius:9, backgroundColor:'rgba(79,142,255,0.15)', alignItems:'center', justifyContent:'center' },
  liveIndicator:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(0,230,118,0.07)', borderWidth:1, borderColor:'rgba(0,230,118,0.2)', borderRadius:100, paddingHorizontal:10, paddingVertical:4 },
  logoutBtn:    { backgroundColor:'rgba(232,25,44,0.1)', borderWidth:1, borderColor:'rgba(232,25,44,0.3)', borderRadius:8, paddingHorizontal:10, paddingVertical:4 },
  navScroll:    { backgroundColor:'rgba(8,13,28,0.9)', borderBottomWidth:1, borderColor:C.border2, maxHeight:56 },
  navTab:       { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:7, borderRadius:8, backgroundColor:'transparent', borderWidth:1, borderColor:'transparent' },
  navTabActive: { backgroundColor:'rgba(79,142,255,0.1)', borderColor:'rgba(79,142,255,0.2)' },
  navTabTxt:    { fontSize:12, fontWeight:'600', color:C.gray2 },
  navBadge:     { backgroundColor:'rgba(232,25,44,0.8)', borderRadius:100, paddingHorizontal:5, paddingVertical:1, minWidth:16, alignItems:'center' },
  navBadgeTxt:  { fontSize:9, fontWeight:'700', color:C.white },
  pageTitle:    { fontWeight:'900', fontSize:20, color:C.white, marginBottom:14 },
  statCard:     { backgroundColor:C.card, borderWidth:1, borderColor:C.border2, borderRadius:14, padding:12, alignItems:'center' },
  cfgPanel:     { backgroundColor:C.card, borderWidth:1, borderColor:C.border2, borderRadius:14, padding:16, marginBottom:14 },
  appRow:       { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'rgba(255,255,255,0.03)' },
  filterBtn:    { paddingHorizontal:12, paddingVertical:5, borderRadius:6, borderWidth:1, borderColor:C.border2, backgroundColor:'transparent' },
  filterBtnActive:{ backgroundColor:'rgba(79,142,255,0.15)', borderColor:C.blue },
  filterBtnTxt: { fontSize:11, fontWeight:'700', color:C.gray2 },
  actionBtn:    { paddingVertical:10, paddingHorizontal:12, borderRadius:10, borderWidth:1, borderColor:C.border2, alignItems:'center', backgroundColor:'rgba(255,255,255,0.04)' },
  selOpt:       { paddingHorizontal:12, paddingVertical:7, borderRadius:8, borderWidth:1, borderColor:C.border2, backgroundColor:C.card },
  selOptActive: { backgroundColor:'rgba(79,142,255,0.1)', borderColor:C.blue },
  uploadBox:    { borderWidth:2, borderColor:C.border2, borderStyle:'dashed', borderRadius:12, padding:20, alignItems:'center', marginBottom:12 },
  previewBox:   { backgroundColor:C.dark2, borderWidth:1, borderColor:C.border2, borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', gap:12, marginTop:8 },
  previewLogo:  { width:44, height:44, backgroundColor:C.blue, borderRadius:12, alignItems:'center', justifyContent:'center' },
  providerRow:  { flexDirection:'row', alignItems:'center', gap:10, padding:12, backgroundColor:C.dark2, borderWidth:1, borderColor:C.border2, borderRadius:10, marginBottom:8 },
  helpBox:      { backgroundColor:'rgba(0,230,118,0.05)', borderWidth:1, borderColor:'rgba(0,230,118,0.15)', borderRadius:10, padding:14, marginBottom:14 },
  toggleRow:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderColor:C.border2 },
  warnBox:      { backgroundColor:'rgba(255,61,87,0.06)', borderWidth:1, borderColor:'rgba(255,61,87,0.2)', borderRadius:12, padding:14, marginBottom:14 },
  clearRow:     { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.card2, borderWidth:1, borderColor:C.border2, borderRadius:12, padding:14, marginBottom:10 },
  clearBtn:     { backgroundColor:'rgba(255,61,87,0.12)', borderWidth:1, borderColor:'rgba(255,61,87,0.3)', borderRadius:8, paddingHorizontal:12, paddingVertical:8 },

  // Modal
  modalOverlay: { position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.75)', alignItems:'center', justifyContent:'center', padding:16 },
  modalCard:    { backgroundColor:C.panel, borderWidth:1, borderColor:C.adminBorder, borderRadius:18, padding:20, width:'100%', maxWidth:500 },
  modalClose:   { width:30, height:30, borderRadius:8, borderWidth:1, borderColor:C.border2, backgroundColor:'transparent', alignItems:'center', justifyContent:'center' },
});
