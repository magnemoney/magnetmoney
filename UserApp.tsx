/**
 * MagnetMoney — User App (React Native)
 * Package: com.magnetmoney.app
 *
 * Screens: Login (OTP) · Sign Up · Home · Apply Loan · Status · Profile
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Dimensions, Platform, StatusBar,
  ActivityIndicator, Alert, Clipboard, SafeAreaView,
  KeyboardAvoidingView, FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Rect, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

// ─── TOKENS ────────────────────────────────────────────────────────────────
const C = {
  accent:  '#B8E000', accent2: '#D4FF40',
  accentDim: 'rgba(184,224,0,0.12)',
  blue:    '#4F8EFF', blue2: '#6BA3FF',
  purple:  '#8B5CF6', cyan:  '#00E5FF',
  red:     '#E8192C', gold:  '#FFD700', green: '#00D97E',
  dark:    '#050810', dark2: '#090C14',
  panel:   '#080D1C', card:  '#0F1420', card2: '#141B2E',
  border:  'rgba(184,224,0,0.12)', border2: 'rgba(255,255,255,0.07)',
  white:   '#fff',    gray:  '#5A6580', gray2: '#8A96B0',
};

const { width: SW } = Dimensions.get('window');

// ─── STORAGE ────────────────────────────────────────────────────────────────
const storage = {
  get:    async (key: string, fallback: any = null) => { try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set:    async (key: string, val: any) => { try { await AsyncStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: async (key: string) => { try { await AsyncStorage.removeItem(key); } catch {} },
};
const getUsers     = async () => storage.get('mm_users', []);
const saveUsers    = async (u: any[]) => storage.set('mm_users', u);
const getApps      = async () => storage.get('mm_applications', []);
const saveApps     = async (a: any[]) => storage.set('mm_applications', a);
const getLoggedUser = async () => storage.get('mm_logged_user', null);
const setLoggedUser = async (v: any) => storage.set('mm_logged_user', v);

// ─── TOAST ───────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((m: string) => {
    setMsg(m); setVisible(true);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [anim]);

  const ToastEl = visible ? (
    <Animated.View style={[S.toast, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange:[0,1], outputRange:[-20,0] }) }] }]}>
      <Text style={S.toastTxt}>{msg}</Text>
    </Animated.View>
  ) : null;

  return { showToast, ToastEl };
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    pending:  [C.gold,  'rgba(255,215,0,0.12)',   '⏳ Pending'],
    approved: [C.green, 'rgba(0,217,126,0.12)',   '✅ Approved'],
    rejected: [C.red,   'rgba(232,25,44,0.12)',   '❌ Rejected'],
    disbursed:[C.accent,'rgba(184,224,0,0.12)',   '💸 Disbursed'],
  };
  const [color, bg, label] = map[status] || [C.gold, 'rgba(255,215,0,0.12)', status];
  return (
    <View style={[S.badge, { backgroundColor: bg }]}>
      <View style={[S.badgeDot, { backgroundColor: color }]} />
      <Text style={[S.badgeTxt, { color }]}>{label}</Text>
    </View>
  );
}

// ─── COIN LOGO ───────────────────────────────────────────────────────────────
function CoinLogo() {
  return (
    <Svg viewBox="0 0 110 110" width={90} height={90}>
      <Defs>
        <SvgGradient id="cg1" x1="0" y1="0" x2="110" y2="110">
          <Stop offset="0%" stopColor="#D4FF40" />
          <Stop offset="100%" stopColor="#7AB800" />
        </SvgGradient>
        <SvgGradient id="cg3" x1="0" y1="0" x2="110" y2="110">
          <Stop offset="0%" stopColor="#C8F000" />
          <Stop offset="100%" stopColor="#96B800" />
        </SvgGradient>
      </Defs>
      <Circle cx="55" cy="55" r="52" fill="url(#cg1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <Circle cx="55" cy="55" r="44" fill="url(#cg3)" />
      <SvgText x="55" y="72" textAnchor="middle" fontWeight="900" fontSize="44" fill="#0A1800">₹</SvgText>
    </Svg>
  );
}

// ─── QR CODE SVG ─────────────────────────────────────────────────────────────
function QRCodeSvg() {
  const modules = [
    [70,10],[80,10],[90,10],[100,10],[110,10],[120,10],[130,10],
    [70,20],[90,20],[110,20],[130,20],
    [70,30],[80,30],[100,30],[120,30],[130,30],
    [70,40],[90,40],[100,40],[110,40],
    [70,50],[80,50],[90,50],[110,50],[130,50],
    [10,70],[30,70],[50,70],[70,70],[90,70],[110,70],[130,70],[150,70],[170,70],[190,70],
    [10,80],[40,80],[60,80],[80,80],[100,80],[130,80],[160,80],[180,80],
    [10,90],[20,90],[50,90],[70,90],[90,90],[120,90],[140,90],[170,90],[190,90],
    [10,100],[30,100],[60,100],[80,100],[110,100],[130,100],[150,100],[180,100],
    [10,110],[20,110],[40,110],[70,110],[100,110],[120,110],[160,110],[190,110],
    [10,120],[30,120],[50,120],[80,120],[110,120],[140,120],[170,120],
    [10,130],[20,130],[60,130],[90,130],[120,130],[150,130],[180,130],
    [70,140],[80,140],[110,140],[130,140],[160,140],[180,140],
    [70,150],[100,150],[120,150],[140,150],[190,150],
    [70,160],[80,160],[90,160],[110,160],[130,160],[160,160],[180,160],
    [70,170],[100,170],[120,170],[150,170],[170,170],[190,170],
    [70,180],[80,180],[90,180],[110,180],[140,180],[160,180],
    [70,190],[100,190],[130,190],[150,190],[180,190],
  ];
  return (
    <View style={{ backgroundColor:'#fff', borderRadius:12, padding:12 }}>
      <Svg viewBox="0 0 200 200" width={160} height={160}>
        {/* Finder TL */}
        <Rect x="10" y="10" width="50" height="50" rx="5" fill="#111"/>
        <Rect x="18" y="18" width="34" height="34" rx="3" fill="#fff"/>
        <Rect x="24" y="24" width="22" height="22" rx="2" fill="#111"/>
        {/* Finder TR */}
        <Rect x="140" y="10" width="50" height="50" rx="5" fill="#111"/>
        <Rect x="148" y="18" width="34" height="34" rx="3" fill="#fff"/>
        <Rect x="154" y="24" width="22" height="22" rx="2" fill="#111"/>
        {/* Finder BL */}
        <Rect x="10" y="140" width="50" height="50" rx="5" fill="#111"/>
        <Rect x="18" y="148" width="34" height="34" rx="3" fill="#fff"/>
        <Rect x="24" y="154" width="22" height="22" rx="2" fill="#111"/>
        {/* Data */}
        {modules.map(([x,y],i)=><Rect key={i} x={x} y={y} width="8" height="8" fill="#111"/>)}
        {/* Center */}
        <Rect x="88" y="88" width="24" height="24" rx="4" fill="#B8E000"/>
        <SvgText x="100" y="103" textAnchor="middle" fontWeight="900" fontSize="14" fill="#0A1800">₹</SvgText>
      </Svg>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function UserLoginScreen({ onLogin, showToast }: { onLogin:(u:any)=>void, showToast:(m:string)=>void }) {
  const [tab, setTab]           = useState<'login'|'signup'>('login');
  const [loginStep, setLoginStep] = useState<'mobile'|'otp'>('mobile');
  const [signupStep, setSignupStep] = useState<'details'|'otp'>('details');
  const [mobile, setMobile]     = useState('');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [otp, setOtp]           = useState(['','','','','','']);
  const [genOtp, setGenOtp]     = useState('');
  const [otpTarget, setOtpTarget] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');
  const otpRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null),
                   useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const startCD = () => {
    setCountdown(60);
    const t = setInterval(() => setCountdown(c => { if (c<=1){clearInterval(t);return 0;} return c-1; }), 1000);
  };

  const sendOtp = async (mode: 'login'|'signup') => {
    setErr('');
    const mob = mode==='login' ? mobile : signupMobile;
    if (!mob || mob.length!==10) { setErr('Valid 10-digit mobile number daalo'); return; }
    if (mode==='login') {
      const users = await getUsers();
      if (!users.find((u:any)=>u.mobile===mob)) { setErr('Mobile registered nahi hai. Sign Up karo.'); return; }
    }
    setLoading(true);
    const o = makeOtp();
    setGenOtp(o); setOtpTarget(mob);
    setTimeout(() => {
      setLoading(false);
      setOtp(['','','','','','']);
      showToast(`📱 OTP: ${o} (demo)`);
      if (mode==='login') setLoginStep('otp'); else setSignupStep('otp');
      startCD();
      setTimeout(() => otpRefs[0].current?.focus(), 200);
    }, 1200);
  };

  const verifyOtp = async (mode: 'login'|'signup') => {
    const entered = otp.join('');
    if (entered.length!==6) { setErr('6-digit OTP poora daalo'); return; }
    if (entered!==genOtp) { setErr('OTP galat hai. Phir try karo.'); setOtp(['','','','','','']); otpRefs[0].current?.focus(); return; }
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      if (mode==='login') {
        const users = await getUsers();
        const user = users.find((u:any)=>u.mobile===otpTarget);
        if (user) { showToast(`✅ Welcome back, ${user.name}!`); onLogin(user); }
      } else {
        const users = await getUsers();
        if (users.find((u:any)=>u.mobile===signupMobile||u.email===email.toLowerCase())) {
          setErr('Mobile/Email already registered hai. Login karo.'); setLoading(false); return;
        }
        const newUser = { id:'USR-'+Date.now(), name, email:email.toLowerCase(), mobile:signupMobile,
                          joined:new Date().toLocaleDateString('en-IN'), status:'active', loans:0, kycStatus:'Pending' };
        await saveUsers([...users, newUser]);
        showToast(`🎉 Account ban gaya! Welcome, ${name}!`);
        onLogin(newUser);
      }
    }, 1200);
  };

  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g,'').slice(-1);
    const n = [...otp]; n[i]=d; setOtp(n);
    if (d && i<5) otpRefs[i+1].current?.focus();
    if (!d && i>0) otpRefs[i-1].current?.focus();
    if (n.every(x=>x)) { const entered=n.join(''); if (entered===genOtp) verifyOtp(tab); }
  };

  const OtpSection = ({ mode }: { mode: 'login'|'signup' }) => (
    <>
      <Text style={S.otpHint}>OTP bheja +91 <Text style={{color:C.accent,fontWeight:'700'}}>{otpTarget}</Text> pe</Text>
      <View style={S.otpRow}>
        {otp.map((d,i) => (
          <TextInput key={i} ref={otpRefs[i]} style={[S.otpBox, d?{borderColor:C.accent}:{}]}
            value={d} onChangeText={v=>handleOtpChange(i,v)} keyboardType="number-pad"
            maxLength={1} textAlign="center" selectionColor={C.accent} />
        ))}
      </View>
      <View style={{alignItems:'center',marginBottom:14}}>
        {countdown>0
          ? <Text style={{fontSize:12,color:C.gray2}}>Resend in <Text style={{color:C.accent,fontWeight:'700'}}>{countdown}s</Text></Text>
          : <TouchableOpacity onPress={()=>sendOtp(mode)}><Text style={{fontSize:13,color:C.accent,fontWeight:'700'}}>Resend OTP</Text></TouchableOpacity>}
      </View>
      {!!err && <Text style={S.err}>{err}</Text>}
      <TouchableOpacity style={[S.btnMain,loading&&{opacity:0.6}]} onPress={()=>verifyOtp(mode)} disabled={loading}>
        {loading ? <ActivityIndicator color="#0A1800" /> : <Text style={S.btnMainTxt}>Verify & {mode==='login'?'Login':'Account Banao'} →</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={S.btnOutline} onPress={()=>{ mode==='login'?setLoginStep('mobile'):setSignupStep('details'); setErr(''); }}>
        <Text style={S.btnOutlineTxt}>← Number Change Karo</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView style={{flex:1,backgroundColor:C.dark}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark}/>
      <ScrollView contentContainerStyle={{flexGrow:1}} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={S.loginHeader}>
          <View style={{marginBottom:14}}>
            <CoinLogo />
          </View>
          <Text style={S.logoText}>Magnet<Text style={{color:C.accent}}>Money</Text></Text>
          <Text style={S.logoSub}>INSTANT PERSONAL LOANS</Text>
        </View>

        {/* Card */}
        <View style={S.loginCard}>
          <View style={S.tabBar}>
            {(['login','signup'] as const).map(t => (
              <TouchableOpacity key={t} style={[S.tabBtn, tab===t&&S.tabBtnActive]}
                onPress={()=>{ setTab(t); setErr(''); setLoginStep('mobile'); setSignupStep('details'); }}>
                <Text style={[S.tabBtnTxt, tab===t&&{color:'#0A1800'}]}>{t==='login'?'Login':'Sign Up'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab==='login' && (
            loginStep==='mobile' ? (
              <>
                <Text style={S.formTitle}>Welcome Back 👋</Text>
                <Text style={S.formSub}>Login ke liye mobile number daalo</Text>
                <Text style={S.label}>MOBILE NUMBER</Text>
                <View style={S.mobileRow}>
                  <View style={S.dialCode}><Text style={{color:C.white,fontWeight:'700',fontSize:15}}>+91</Text></View>
                  <TextInput style={[S.inp,{flex:1,marginBottom:0}]} value={mobile}
                    onChangeText={v=>setMobile(v.replace(/\D/g,'').slice(0,10))}
                    placeholder="9876543210" placeholderTextColor={C.gray} keyboardType="phone-pad" maxLength={10} />
                </View>
                {!!err && <Text style={S.err}>{err}</Text>}
                <TouchableOpacity style={[S.btnMain,{marginTop:12},(mobile.length!==10||loading)&&{opacity:0.5}]}
                  onPress={()=>sendOtp('login')} disabled={mobile.length!==10||loading}>
                  {loading ? <ActivityIndicator color="#0A1800"/> : <Text style={S.btnMainTxt}>OTP Bhejo →</Text>}
                </TouchableOpacity>
              </>
            ) : <OtpSection mode="login" />
          )}

          {tab==='signup' && (
            signupStep==='details' ? (
              <>
                <Text style={S.formTitle}>Account Banao 🎉</Text>
                <Text style={S.formSub}>Details bharo aur shuru karo</Text>
                <Text style={S.label}>FULL NAME</Text>
                <TextInput style={S.inp} value={name} onChangeText={setName} placeholder="Ramesh Kumar Sharma" placeholderTextColor={C.gray} />
                <Text style={S.label}>EMAIL ADDRESS</Text>
                <TextInput style={S.inp} value={email} onChangeText={setEmail} placeholder="yourname@gmail.com" placeholderTextColor={C.gray} keyboardType="email-address" autoCapitalize="none" />
                <Text style={S.label}>MOBILE NUMBER</Text>
                <View style={S.mobileRow}>
                  <View style={S.dialCode}><Text style={{color:C.white,fontWeight:'700',fontSize:15}}>+91</Text></View>
                  <TextInput style={[S.inp,{flex:1,marginBottom:0}]} value={signupMobile}
                    onChangeText={v=>setSignupMobile(v.replace(/\D/g,'').slice(0,10))}
                    placeholder="9876543210" placeholderTextColor={C.gray} keyboardType="phone-pad" maxLength={10} />
                </View>
                {!!err && <Text style={S.err}>{err}</Text>}
                <TouchableOpacity style={[S.btnMain,{marginTop:12},(!name||!email||signupMobile.length!==10||loading)&&{opacity:0.5}]}
                  onPress={()=>sendOtp('signup')} disabled={!name||!email||signupMobile.length!==10||loading}>
                  {loading ? <ActivityIndicator color="#0A1800"/> : <Text style={S.btnMainTxt}>OTP Bhejo →</Text>}
                </TouchableOpacity>
              </>
            ) : <OtpSection mode="signup" />
          )}

          <Text style={{marginTop:18,textAlign:'center',fontSize:12,color:C.gray}}>🔒 Aapka data encrypt aur secure hai</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function UserDashboard({ user, onLogout, showToast }: { user:any, onLogout:()=>void, showToast:(m:string)=>void }) {
  const [nav, setNav]           = useState<'home'|'status'|'profile'>('home');
  const [loanScreen, setLoanScreen] = useState<'home'|'apply'>('home');
  const [loanStep, setLoanStep] = useState(1);
  const [apps, setApps]         = useState<any[]>([]);
  const [loanData, setLoanData] = useState({ amount:100000, tenure:12, purpose:'', employment:'', income:'', state:'', dob:'', pan:'', aadhaar:'', bank:'', ifsc:'', payMethod:'' });

  useEffect(() => { loadApps(); }, []);
  const loadApps = async () => { const a = await getApps(); setApps(a.filter((x:any)=>x.email===user?.email)); };

  const emi = Math.round((loanData.amount*(2.5/100)*Math.pow(1+2.5/100,loanData.tenure))/(Math.pow(1+2.5/100,loanData.tenure)-1));
  const totalApps = apps.length;
  const approved  = apps.filter(a=>['approved','disbursed'].includes(a.status)).length;
  const rejected  = apps.filter(a=>a.status==='rejected').length;

  const submitLoan = async () => {
    const allApps = await getApps();
    const newApp = { id:'LN-'+Date.now(), user:user?.name, email:user?.email, mobile:user?.mobile,
                     amount:loanData.amount, tenure:loanData.tenure, emi, purpose:loanData.purpose||'Personal',
                     employment:loanData.employment, income:loanData.income, state:loanData.state,
                     pan:loanData.pan, status:'pending', date:new Date().toLocaleDateString('en-IN'),
                     paymentMethod:loanData.payMethod };
    await saveApps([...allApps, newApp]);
    showToast('✅ Application submit ho gayi!');
    setLoanScreen('home'); setLoanStep(1); setNav('home'); loadApps();
  };

  // ── LOAN APPLICATION ──
  if (loanScreen==='apply') {
    return (
      <View style={{flex:1,backgroundColor:C.dark}}>
        <StatusBar barStyle="light-content" backgroundColor={C.dark}/>
        {/* Header */}
        <SafeAreaView style={{backgroundColor:C.dark}}>
          <View style={S.applyHeader}>
            <TouchableOpacity style={S.backBtn} onPress={()=>{ loanStep>1?setLoanStep(loanStep-1):setLoanScreen('home'); }}>
              <Text style={{color:C.white,fontSize:18}}>←</Text>
            </TouchableOpacity>
            <View style={{flex:1}}>
              <Text style={{color:C.white,fontWeight:'800',fontSize:15}}>Loan Application</Text>
              <Text style={{color:C.gray2,fontSize:11}}>Step {loanStep} of 4</Text>
            </View>
            <View style={S.instantBadge}><Text style={{color:C.accent,fontSize:11,fontWeight:'700'}}>Instant</Text></View>
          </View>
          {/* Progress */}
          <View style={{flexDirection:'row',gap:5,paddingHorizontal:20,paddingBottom:10}}>
            {[1,2,3,4].map(i=>(
              <View key={i} style={[S.progressStep, i<loanStep&&{backgroundColor:C.accent}, i===loanStep&&{backgroundColor:C.accent,opacity:0.6}]}/>
            ))}
          </View>
        </SafeAreaView>

        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
          <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}} keyboardShouldPersistTaps="handled">

            {/* STEP 1 */}
            {loanStep===1 && (
              <View>
                <Text style={S.stepTitle}>💰 Loan Amount</Text>
                <Text style={S.stepSub}>Apni zaroorat ke hisaab se amount chuno</Text>
                <Text style={{textAlign:'center',fontWeight:'900',fontSize:36,color:C.accent,marginBottom:4}}>₹{loanData.amount.toLocaleString('en-IN')}</Text>
                <Text style={{textAlign:'center',color:C.gray2,fontSize:13,marginBottom:18}}>Loan Amount</Text>
                {/* Slider buttons */}
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
                  {[50000,100000,200000,300000,500000].map(amt=>(
                    <TouchableOpacity key={amt} style={[S.chip, loanData.amount===amt&&S.chipActive]} onPress={()=>setLoanData(d=>({...d,amount:amt}))}>
                      <Text style={[S.chipTxt, loanData.amount===amt&&{color:C.accent}]}>₹{(amt/1000)}K</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[S.label,{marginTop:8}]}>TENURE</Text>
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:18}}>
                  {[3,6,12,18,24,36].map(t=>(
                    <TouchableOpacity key={t} style={[S.chip, loanData.tenure===t&&S.chipActive]} onPress={()=>setLoanData(d=>({...d,tenure:t}))}>
                      <Text style={[S.chipTxt, loanData.tenure===t&&{color:C.accent}]}>{t} mo</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={S.emiBox}>
                  {[['Monthly EMI',`₹${emi.toLocaleString('en-IN')}`,C.accent],['Rate','2.5%/mo',C.white],['Tenure',`${loanData.tenure} mo`,C.white]].map(([l,v,col])=>(
                    <View key={String(l)} style={{alignItems:'center'}}>
                      <Text style={{fontSize:11,color:C.gray2,textTransform:'uppercase'}}>{l}</Text>
                      <Text style={{fontSize:16,fontWeight:'900',color:col as string,marginTop:3}}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* STEP 2 */}
            {loanStep===2 && (
              <View>
                <Text style={S.stepTitle}>📋 Personal Details</Text>
                <Text style={S.stepSub}>Loan process ke liye zaroori info</Text>
                <Text style={S.label}>LOAN PURPOSE</Text>
                <View style={S.selectWrap}>
                  {['Personal','Medical','Education','Home Renovation','Vehicle','Wedding','Travel','Business'].map(p=>(
                    <TouchableOpacity key={p} style={[S.selectOpt, loanData.purpose===p&&S.selectOptActive]} onPress={()=>setLoanData(d=>({...d,purpose:p}))}>
                      <Text style={[S.selectOptTxt, loanData.purpose===p&&{color:C.accent}]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={S.label}>EMPLOYMENT TYPE</Text>
                <View style={S.selectWrap}>
                  {['Salaried','Self-Employed','Business Owner','Freelancer','Government Employee'].map(e=>(
                    <TouchableOpacity key={e} style={[S.selectOpt, loanData.employment===e&&S.selectOptActive]} onPress={()=>setLoanData(d=>({...d,employment:e}))}>
                      <Text style={[S.selectOptTxt, loanData.employment===e&&{color:C.accent}]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={S.label}>MONTHLY INCOME (₹)</Text>
                <TextInput style={S.inp} value={loanData.income} onChangeText={v=>setLoanData(d=>({...d,income:v}))} placeholder="e.g. 50000" placeholderTextColor={C.gray} keyboardType="number-pad"/>
                <Text style={S.label}>STATE</Text>
                <View style={S.selectWrap}>
                  {['Rajasthan','Maharashtra','Gujarat','Delhi','Karnataka','Tamil Nadu','UP','Bengal'].map(s=>(
                    <TouchableOpacity key={s} style={[S.selectOpt, loanData.state===s&&S.selectOptActive]} onPress={()=>setLoanData(d=>({...d,state:s}))}>
                      <Text style={[S.selectOptTxt, loanData.state===s&&{color:C.accent}]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* STEP 3 */}
            {loanStep===3 && (
              <View>
                <Text style={S.stepTitle}>🪪 KYC Documents</Text>
                <Text style={S.stepSub}>Identity verification ke liye zaroori</Text>
                <Text style={S.label}>PAN NUMBER</Text>
                <TextInput style={S.inp} value={loanData.pan} onChangeText={v=>setLoanData(d=>({...d,pan:v.toUpperCase()}))} placeholder="ABCDE1234F" placeholderTextColor={C.gray} autoCapitalize="characters" maxLength={10}/>
                <Text style={S.label}>AADHAAR NUMBER</Text>
                <TextInput style={S.inp} value={loanData.aadhaar} onChangeText={v=>setLoanData(d=>({...d,aadhaar:v.slice(0,12)}))} placeholder="XXXX XXXX XXXX" placeholderTextColor={C.gray} keyboardType="number-pad" maxLength={12}/>
                <Text style={S.label}>BANK ACCOUNT NUMBER</Text>
                <TextInput style={S.inp} value={loanData.bank} onChangeText={v=>setLoanData(d=>({...d,bank:v}))} placeholder="Account number daalo" placeholderTextColor={C.gray} keyboardType="number-pad"/>
                <Text style={S.label}>IFSC CODE</Text>
                <TextInput style={S.inp} value={loanData.ifsc} onChangeText={v=>setLoanData(d=>({...d,ifsc:v.toUpperCase()}))} placeholder="SBIN0001234" placeholderTextColor={C.gray} autoCapitalize="characters"/>
                <View style={S.infoBox}>
                  <Text style={{fontSize:12,color:C.gray2,lineHeight:18}}>🔒 Aapke documents encrypt hain. Hum inhe kabhi share nahi karte.</Text>
                </View>
              </View>
            )}

            {/* STEP 4 */}
            {loanStep===4 && (
              <View>
                <Text style={S.stepTitle}>💳 Processing Fee</Text>
                <Text style={S.stepSub}>Loan process karne ke liye ek-baar ki fee</Text>
                <View style={S.feeBox}>
                  <Text style={{fontSize:12,color:C.gray2,textTransform:'uppercase',letterSpacing:1}}>Processing Fee</Text>
                  <Text style={{fontWeight:'900',fontSize:38,color:C.accent,marginVertical:4}}>₹999</Text>
                  <Text style={{fontSize:12,color:C.gray2}}>One-time · Non-refundable · GST included</Text>
                </View>
                {(['qr','upi','card'] as const).map(pm=>(
                  <TouchableOpacity key={pm} style={[S.payOpt, loanData.payMethod===pm&&S.payOptActive]} onPress={()=>setLoanData(d=>({...d,payMethod:pm}))}>
                    <Text style={{fontSize:26}}>{pm==='qr'?'📱':pm==='upi'?'⚡':'💳'}</Text>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:14,fontWeight:'700',color:C.white}}>{pm==='qr'?'QR Code':pm==='upi'?'UPI ID':'Card'}</Text>
                      <Text style={{fontSize:12,color:C.gray2}}>{pm==='qr'?'Scan & Pay instantly':pm==='upi'?'Kisi bhi UPI app se pay karo':'Debit/Credit card'}</Text>
                    </View>
                    <View style={[S.radio, loanData.payMethod===pm&&S.radioActive]}>
                      {loanData.payMethod===pm && <View style={S.radioDot}/>}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* QR Panel */}
                {loanData.payMethod==='qr' && (
                  <View style={S.qrPanel}>
                    <Text style={{fontSize:12,color:C.accent,fontWeight:'700',textTransform:'uppercase',letterSpacing:1,marginBottom:14,textAlign:'center'}}>Scan karke ₹999 pay karo</Text>
                    <View style={{alignItems:'center',marginBottom:14}}>
                      <QRCodeSvg />
                    </View>
                    <Text style={{fontSize:13,color:C.gray2,textAlign:'center',marginBottom:6}}>UPI ID</Text>
                    <View style={S.upiIdRow}>
                      <Text style={{fontFamily:Platform.OS==='ios'?'Courier':'monospace',fontSize:13,color:C.white,fontWeight:'600'}}>magnetmoney@upi</Text>
                      <TouchableOpacity style={S.copyBtn} onPress={()=>{ Clipboard.setString('magnetmoney@upi'); showToast('📋 UPI ID copy ho gaya!'); }}>
                        <Text style={{fontSize:11,color:C.accent,fontWeight:'700'}}>COPY</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:12}}>
                      {['📱 GPay','🔵 PhonePe','💙 Paytm','🅿️ BHIM'].map(app=>(
                        <View key={app} style={S.appChip}><Text style={{fontSize:11,color:C.gray2,fontWeight:'600'}}>{app}</Text></View>
                      ))}
                    </View>
                  </View>
                )}

                {/* UPI Panel */}
                {loanData.payMethod==='upi' && (
                  <View style={[S.qrPanel,{borderColor:'rgba(79,142,255,0.3)'}]}>
                    <Text style={{fontSize:12,color:C.blue,fontWeight:'700',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>⚡ UPI ID Daalo</Text>
                    <Text style={S.label}>TUMHARA UPI ID</Text>
                    <TextInput style={S.inp} placeholder="yourname@upi / 9876543210@paytm" placeholderTextColor={C.gray} autoCapitalize="none" keyboardType="email-address"/>
                    <Text style={{fontSize:11,color:C.gray2,textAlign:'center'}}>₹999 tumhare UPI account se deduct hoga</Text>
                  </View>
                )}

                {/* Card Panel */}
                {loanData.payMethod==='card' && (
                  <View style={[S.qrPanel,{borderColor:'rgba(139,92,246,0.3)'}]}>
                    <Text style={{fontSize:12,color:C.purple,fontWeight:'700',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>💳 Card Details</Text>
                    <Text style={S.label}>CARD NUMBER</Text>
                    <TextInput style={S.inp} placeholder="XXXX XXXX XXXX XXXX" placeholderTextColor={C.gray} keyboardType="number-pad" maxLength={19}/>
                    <View style={{flexDirection:'row',gap:10}}>
                      <View style={{flex:1}}><Text style={S.label}>EXPIRY</Text><TextInput style={S.inp} placeholder="MM/YY" placeholderTextColor={C.gray} keyboardType="number-pad" maxLength={5}/></View>
                      <View style={{flex:1}}><Text style={S.label}>CVV</Text><TextInput style={S.inp} placeholder="•••" placeholderTextColor={C.gray} keyboardType="number-pad" maxLength={3} secureTextEntry/></View>
                    </View>
                    <Text style={{fontSize:11,color:C.gray2,textAlign:'center'}}>🔒 256-bit encrypted · RBI compliant</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom CTA */}
        <View style={S.applyFooter}>
          {loanStep<4
            ? <TouchableOpacity style={S.btnMain} onPress={()=>setLoanStep(loanStep+1)}><Text style={S.btnMainTxt}>Continue →</Text></TouchableOpacity>
            : <TouchableOpacity style={[S.btnMain,!loanData.payMethod&&{opacity:0.5}]} onPress={submitLoan} disabled={!loanData.payMethod}><Text style={S.btnMainTxt}>Application Submit Karo ✓</Text></TouchableOpacity>}
        </View>
      </View>
    );
  }

  // ── MAIN DASHBOARD ──
  return (
    <View style={{flex:1,backgroundColor:C.dark}}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark}/>
      <SafeAreaView style={{flex:1}}>

        {/* HOME */}
        {nav==='home' && (
          <ScrollView contentContainerStyle={{paddingBottom:90}}>
            {/* Top bar */}
            <View style={S.homeHeader}>
              <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
                <View style={S.avatar}><Text style={{fontSize:20}}>👤</Text></View>
                <View>
                  <Text style={{fontSize:13,color:C.gray2}}>Welcome back 👋</Text>
                  <Text style={{fontWeight:'900',fontSize:18,color:C.white}}>{user?.name?.split(' ')[0]}</Text>
                </View>
              </View>
              <View style={S.activePill}>
                <View style={S.activeDot}/>
                <Text style={{fontSize:11,fontWeight:'700',color:C.green}}>Active</Text>
              </View>
            </View>

            <View style={{padding:20}}>
              {/* Stats */}
              {totalApps>0 && (
                <View style={{flexDirection:'row',gap:8,marginBottom:18}}>
                  {[['Total',totalApps,C.white],[' Approved',approved,C.green],['Rejected',rejected,C.red]].map(([l,v,col])=>(
                    <View key={String(l)} style={[S.statCard,{flex:1}]}>
                      <Text style={{fontWeight:'900',fontSize:20,color:col as string}}>{v}</Text>
                      <Text style={{fontSize:10,color:C.gray2,fontWeight:'600',textTransform:'uppercase',marginTop:3}}>{l}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Offer Banner */}
              <View style={S.offerCard}>
                <View style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:14}}>
                  <View style={S.offerIcon}><Text style={{fontSize:22}}>💎</Text></View>
                  <View style={{flex:1}}>
                    <Text style={{fontWeight:'900',fontSize:13,color:C.accent}}>LOAN OFFER</Text>
                    <Text style={{fontSize:11,color:C.gray2}}>Tumhare liye pre-approved</Text>
                  </View>
                  <View style={S.livePill}><Text style={{fontSize:10,fontWeight:'700',color:C.green}}>● LIVE</Text></View>
                </View>
                <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
                  {[['₹5L','Max Loan'],['2.5%','Per Month'],['36mo','Max Tenure']].map(([v,l])=>(
                    <View key={l} style={{flex:1,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:12,padding:10,alignItems:'center'}}>
                      <Text style={{fontWeight:'900',fontSize:15,color:v==='2.5%'?C.accent:C.white}}>{v}</Text>
                      <Text style={{fontSize:9,color:C.gray2,textTransform:'uppercase',marginTop:2}}>{l}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={S.applyNowBtn} onPress={()=>{ setLoanScreen('apply'); setLoanStep(1); }}>
                  <Text style={S.btnMainTxt}>🚀 Abhi Apply Karo</Text>
                </TouchableOpacity>
              </View>

              {/* My Applications */}
              <Text style={S.sectionTitle}>MY APPLICATIONS</Text>
              {apps.length===0 ? (
                <View style={S.emptyCard}>
                  <Text style={{fontSize:36,marginBottom:10}}>📄</Text>
                  <Text style={{fontSize:14,fontWeight:'700',color:C.white,marginBottom:5}}>Koi Application Nahi</Text>
                  <Text style={{fontSize:12,color:C.gray2}}>Upar se apna pehla loan apply karo!</Text>
                </View>
              ) : apps.map(app=>(
                <View key={app.id} style={S.appCard}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                    <View>
                      <Text style={{fontWeight:'800',fontSize:15,color:C.white}}>{app.id}</Text>
                      <Text style={{fontSize:12,color:C.gray2,marginTop:2}}>{app.date}</Text>
                    </View>
                    <StatusBadge status={app.status}/>
                  </View>
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                    {[['Amount',`₹${Number(app.amount).toLocaleString('en-IN')}`],['Tenure',`${app.tenure} months`],['EMI',`₹${Number(app.emi).toLocaleString('en-IN')}/mo`],['Purpose',app.purpose]].map(([k,v])=>(
                      <View key={k} style={{width:'47%',backgroundColor:'rgba(255,255,255,0.03)',borderRadius:10,padding:'10px 12px' as any,paddingHorizontal:12,paddingVertical:10}}>
                        <Text style={{fontSize:10,color:C.gray2,textTransform:'uppercase',marginBottom:3}}>{k}</Text>
                        <Text style={{fontSize:13,fontWeight:'700',color:k==='Amount'?C.accent:C.white}}>{v}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* STATUS */}
        {nav==='status' && (
          <ScrollView contentContainerStyle={{padding:20,paddingBottom:90}}>
            <Text style={{fontWeight:'900',fontSize:20,color:C.white,marginBottom:4}}>My Applications</Text>
            <Text style={{fontSize:13,color:C.gray2,marginBottom:20}}>Apni loan application ka status track karo</Text>
            {apps.length===0 ? (
              <View style={{alignItems:'center',padding:48}}>
                <Text style={{fontSize:40,marginBottom:12}}>📋</Text>
                <Text style={{fontSize:14,fontWeight:'700',color:C.white,marginBottom:6}}>Koi Application Nahi</Text>
                <Text style={{fontSize:12,color:C.gray2}}>Yahan tumhari applications dikhegi</Text>
              </View>
            ) : apps.map(app=>(
              <View key={app.id} style={[S.appCard,{marginBottom:14}]}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <View>
                    <Text style={{fontWeight:'800',fontSize:15,color:C.white}}>{app.id}</Text>
                    <Text style={{fontSize:12,color:C.gray2,marginTop:2}}>{app.date}</Text>
                  </View>
                  <StatusBadge status={app.status}/>
                </View>
                <View style={{flexDirection:'row',gap:10,marginBottom:14}}>
                  {[['Amount',`₹${Number(app.amount).toLocaleString('en-IN')}`],['EMI',`₹${Number(app.emi).toLocaleString('en-IN')}/mo`]].map(([k,v])=>(
                    <View key={k} style={{flex:1,backgroundColor:'rgba(255,255,255,0.03)',borderRadius:10,padding:12}}>
                      <Text style={{fontSize:10,color:C.gray2,textTransform:'uppercase',marginBottom:3}}>{k}</Text>
                      <Text style={{fontSize:14,fontWeight:'700',color:k==='Amount'?C.accent:C.white}}>{v}</Text>
                    </View>
                  ))}
                </View>
                {/* Timeline */}
                {[
                  {label:'Application Submit Hua',meta:app.date,done:true},
                  {label:'Documents Verify Ho Rahe',meta:app.status!=='pending'?'Completed':'In progress',done:app.status!=='pending'},
                  {label:'Loan Approved',meta:['approved','disbursed'].includes(app.status)?'Approved ✅':app.status==='rejected'?'Rejected ❌':'Pending',done:['approved','disbursed'].includes(app.status)},
                  {label:'Disbursement',meta:app.status==='disbursed'?'Completed':'Pending',done:app.status==='disbursed'},
                ].map((step,i)=>(
                  <View key={i} style={{flexDirection:'row',gap:14,paddingBottom:i<3?20:0,position:'relative'}}>
                    {i<3 && <View style={{position:'absolute',left:17,top:36,bottom:0,width:2,backgroundColor:step.done?C.accent:C.border2}}/>}
                    <View style={{width:36,height:36,borderRadius:18,backgroundColor:step.done?'rgba(184,224,0,0.15)':C.card2,borderWidth:2,borderColor:step.done?C.accent:C.border2,alignItems:'center',justifyContent:'center',zIndex:1}}>
                      <Text style={{color:step.done?C.accent:C.gray2,fontWeight:'700'}}>{step.done?'✓':'○'}</Text>
                    </View>
                    <View style={{flex:1,paddingTop:4}}>
                      <Text style={{fontSize:14,fontWeight:'700',color:step.done?C.white:C.gray2}}>{step.label}</Text>
                      <Text style={{fontSize:12,marginTop:2,color:step.done?C.green:C.gray2}}>{step.meta}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}

        {/* PROFILE */}
        {nav==='profile' && (
          <ScrollView contentContainerStyle={{paddingBottom:90}}>
            <View style={{alignItems:'center',padding:24}}>
              <View style={S.profileAvatar}><Text style={{fontSize:38}}>👤</Text></View>
              <Text style={{fontWeight:'900',fontSize:20,color:C.white,marginTop:12}}>{user?.name}</Text>
              <Text style={{fontSize:13,color:C.gray2,marginTop:3}}>{user?.email}</Text>
              <View style={S.memberBadge}><Text style={{fontSize:12,fontWeight:'700',color:C.accent}}>Active Member</Text></View>
            </View>
            {[
              {icon:'📋',label:'My Applications',sub:`${apps.length} total applications`,action:()=>setNav('status')},
              {icon:'🪪',label:'KYC Status',sub:user?.kycStatus||'Pending verification'},
              {icon:'🏦',label:'Bank Details',sub:'Bank account add/update karo'},
              {icon:'📞',label:'Support',sub:'24/7 Customer support'},
              {icon:'🚪',label:'Logout',sub:'Account se sign out karo',color:C.red,action:onLogout},
            ].map(item=>(
              <TouchableOpacity key={item.label} style={S.profileItem} onPress={item.action}>
                <View style={[S.profileIconBox,{backgroundColor:'rgba(184,224,0,0.1)'}]}><Text style={{fontSize:18}}>{item.icon}</Text></View>
                <View style={{flex:1}}>
                  <Text style={{fontSize:14,fontWeight:'700',color:item.color||C.white}}>{item.label}</Text>
                  <Text style={{fontSize:12,color:C.gray2,marginTop:2}}>{item.sub}</Text>
                </View>
                <Text style={{color:C.gray2,fontSize:18}}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* BOTTOM NAV */}
        <View style={S.bottomNav}>
          {([['home','🏠','Home'],['status','📋','Status'],['profile','👤','Profile']] as const).map(([id,icon,label])=>(
            <TouchableOpacity key={id} style={S.navItem} onPress={()=>setNav(id)}>
              <Text style={{fontSize:22}}>{icon}</Text>
              <Text style={[S.navLabel, nav===id&&{color:C.accent}]}>{label}</Text>
              {nav===id && <View style={S.navIndicator}/>}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function MagnetMoneyUserApp() {
  const [screen, setScreen]   = useState<'loading'|'login'|'app'>('loading');
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const { showToast, ToastEl } = useToast();

  useEffect(() => {
    (async () => {
      const u = await getLoggedUser();
      if (u) {
        const users = await getUsers();
        const found = users.find((x:any) => x.email===u.email || x.mobile===u.mobile);
        if (found) { setLoggedUser(found); setScreen('app'); return; }
      }
      setScreen('login');
    })();
  }, []);

  const handleLogin = async (user: any) => {
    await setLoggedUser(user);
    setLoggedUser(user);
    setScreen('app');
  };

  const handleLogout = async () => {
    await storage.remove('mm_logged_user');
    setLoggedUser(null);
    setScreen('login');
  };

  if (screen==='loading') return (
    <View style={{flex:1,backgroundColor:C.dark,alignItems:'center',justifyContent:'center'}}>
      <CoinLogo/>
      <ActivityIndicator color={C.accent} style={{marginTop:20}}/>
    </View>
  );

  return (
    <View style={{flex:1}}>
      {ToastEl}
      {screen==='login'
        ? <UserLoginScreen onLogin={handleLogin} showToast={showToast}/>
        : <UserDashboard user={loggedUser} onLogout={handleLogout} showToast={showToast}/>}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const S = StyleSheet.create({
  // Toast
  toast:        { position:'absolute', top:60, alignSelf:'center', backgroundColor:C.card2, borderWidth:1, borderColor:C.border, paddingHorizontal:20, paddingVertical:12, borderRadius:100, zIndex:9999 },
  toastTxt:     { color:C.white, fontSize:13, fontWeight:'600' },

  // Badges
  badge:        { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:3, borderRadius:100 },
  badgeDot:     { width:5, height:5, borderRadius:3 },
  badgeTxt:     { fontSize:10, fontWeight:'700' },

  // Login
  loginHeader:  { alignItems:'center', paddingTop:60, paddingBottom:28 },
  logoText:     { fontSize:26, fontWeight:'900', color:C.white },
  logoSub:      { fontSize:11, color:C.gray2, letterSpacing:2, marginTop:4 },
  loginCard:    { backgroundColor:'rgba(9,12,20,0.99)', borderTopLeftRadius:32, borderTopRightRadius:32, borderTopWidth:1.5, borderColor:'rgba(184,224,0,0.15)', padding:24, paddingBottom:40 },
  tabBar:       { flexDirection:'row', backgroundColor:C.card, borderRadius:14, padding:4, marginBottom:20 },
  tabBtn:       { flex:1, padding:10, borderRadius:10, alignItems:'center' },
  tabBtnActive: { backgroundColor:C.accent },
  tabBtnTxt:    { fontSize:14, fontWeight:'700', color:C.gray2 },
  formTitle:    { fontSize:18, fontWeight:'900', color:C.white, marginBottom:4 },
  formSub:      { fontSize:13, color:C.gray2, marginBottom:20, lineHeight:20 },
  label:        { fontSize:11, fontWeight:'700', color:C.gray2, letterSpacing:0.8, marginBottom:7 },
  inp:          { backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderRadius:14, paddingHorizontal:16, paddingVertical:14, color:C.white, fontSize:15, marginBottom:14 },
  mobileRow:    { flexDirection:'row', gap:8, alignItems:'center', marginBottom:14 },
  dialCode:     { backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderRadius:14, paddingHorizontal:12, paddingVertical:14 },
  err:          { fontSize:12, color:C.red, textAlign:'center', marginBottom:10, fontWeight:'600' },
  otpHint:      { fontSize:12, color:C.gray2, textAlign:'center', marginBottom:14 },
  otpRow:       { flexDirection:'row', gap:8, marginBottom:14 },
  otpBox:       { flex:1, height:52, backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderRadius:12, fontSize:20, fontWeight:'700', color:C.white, textAlign:'center' },

  // Buttons
  btnMain:      { backgroundColor:C.accent, borderRadius:14, paddingVertical:16, alignItems:'center' },
  btnMainTxt:   { color:'#0A1800', fontSize:15, fontWeight:'800', letterSpacing:0.3 },
  btnOutline:   { borderWidth:1.5, borderColor:C.border2, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:10 },
  btnOutlineTxt:{ color:C.white, fontSize:14, fontWeight:'600' },

  // Apply screen
  applyHeader:  { flexDirection:'row', alignItems:'center', gap:14, paddingHorizontal:20, paddingVertical:16, backgroundColor:C.dark, borderBottomWidth:1, borderColor:C.border2 },
  backBtn:      { width:38, height:38, borderRadius:12, backgroundColor:C.card, borderWidth:1, borderColor:C.border2, alignItems:'center', justifyContent:'center' },
  instantBadge: { backgroundColor:'rgba(184,224,0,0.12)', borderWidth:1, borderColor:C.border, borderRadius:100, paddingHorizontal:10, paddingVertical:4 },
  progressStep: { height:3, flex:1, borderRadius:100, backgroundColor:C.border2 },
  stepTitle:    { fontSize:22, fontWeight:'900', color:C.white, marginBottom:5 },
  stepSub:      { fontSize:13, color:C.gray2, marginBottom:22 },
  chip:         { paddingHorizontal:16, paddingVertical:8, borderRadius:100, backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2 },
  chipActive:   { backgroundColor:'rgba(184,224,0,0.12)', borderColor:C.accent },
  chipTxt:      { fontSize:13, fontWeight:'700', color:C.gray2 },
  emiBox:       { backgroundColor:'rgba(184,224,0,0.06)', borderWidth:1, borderColor:C.border, borderRadius:16, padding:16, flexDirection:'row', justifyContent:'space-around', marginBottom:18 },
  selectWrap:   { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:18 },
  selectOpt:    { paddingHorizontal:14, paddingVertical:8, borderRadius:10, backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2 },
  selectOptActive:{ backgroundColor:'rgba(184,224,0,0.1)', borderColor:C.accent },
  selectOptTxt: { fontSize:13, fontWeight:'600', color:C.gray2 },
  infoBox:      { backgroundColor:'rgba(184,224,0,0.04)', borderWidth:1, borderColor:C.border, borderRadius:14, padding:14 },
  feeBox:       { backgroundColor:'rgba(184,224,0,0.08)', borderWidth:1, borderColor:C.border, borderRadius:20, padding:22, alignItems:'center', marginBottom:20 },
  payOpt:       { backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderRadius:16, padding:16, marginBottom:10, flexDirection:'row', alignItems:'center', gap:14 },
  payOptActive: { backgroundColor:'rgba(184,224,0,0.06)', borderColor:C.accent },
  radio:        { width:18, height:18, borderRadius:9, borderWidth:2, borderColor:C.border2, alignItems:'center', justifyContent:'center' },
  radioActive:  { borderColor:C.accent, backgroundColor:C.accent },
  radioDot:     { width:6, height:6, borderRadius:3, backgroundColor:'#0A1800' },
  qrPanel:      { marginTop:16, backgroundColor:C.card, borderWidth:1.5, borderColor:'rgba(184,224,0,0.3)', borderRadius:20, padding:20 },
  upiIdRow:     { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.card2, borderWidth:1, borderColor:C.border, borderRadius:12, padding:10, justifyContent:'center' },
  copyBtn:      { backgroundColor:'rgba(184,224,0,0.1)', paddingHorizontal:8, paddingVertical:3, borderRadius:6 },
  appChip:      { backgroundColor:C.card2, borderWidth:1, borderColor:C.border2, borderRadius:8, paddingHorizontal:10, paddingVertical:5 },
  applyFooter:  { padding:16, paddingBottom:Platform.OS==='ios'?28:16, backgroundColor:C.dark, borderTopWidth:1, borderColor:C.border2 },

  // Dashboard
  homeHeader:   { padding:20, backgroundColor:'rgba(5,8,16,0.98)', flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomWidth:1, borderColor:C.border2 },
  avatar:       { width:42, height:42, borderRadius:21, backgroundColor:'rgba(184,224,0,0.1)', borderWidth:2, borderColor:C.accent, alignItems:'center', justifyContent:'center' },
  activePill:   { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(0,217,126,0.1)', borderWidth:1, borderColor:'rgba(0,217,126,0.25)', borderRadius:100, paddingHorizontal:10, paddingVertical:4 },
  activeDot:    { width:6, height:6, borderRadius:3, backgroundColor:C.green },
  statCard:     { backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderRadius:14, padding:12, alignItems:'center' },
  offerCard:    { backgroundColor:'rgba(184,224,0,0.08)', borderWidth:1.5, borderColor:'rgba(184,224,0,0.35)', borderRadius:20, padding:18, marginBottom:18 },
  offerIcon:    { width:44, height:44, borderRadius:14, backgroundColor:C.accent, alignItems:'center', justifyContent:'center' },
  livePill:     { backgroundColor:'rgba(0,217,126,0.12)', borderWidth:1, borderColor:'rgba(0,217,126,0.3)', borderRadius:100, paddingHorizontal:10, paddingVertical:3 },
  applyNowBtn:  { backgroundColor:C.accent, borderRadius:14, paddingVertical:14, alignItems:'center' },
  sectionTitle: { fontSize:11, fontWeight:'700', color:C.gray2, letterSpacing:0.8, textTransform:'uppercase', marginBottom:12 },
  emptyCard:    { alignItems:'center', padding:30, backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderStyle:'dashed', borderRadius:18 },
  appCard:      { backgroundColor:C.card, borderWidth:1.5, borderColor:C.border2, borderRadius:20, padding:20, marginBottom:14 },

  // Profile
  profileAvatar:{ width:88, height:88, borderRadius:44, backgroundColor:'rgba(184,224,0,0.1)', borderWidth:3, borderColor:C.accent, alignItems:'center', justifyContent:'center' },
  memberBadge:  { marginTop:8, backgroundColor:'rgba(184,224,0,0.1)', borderWidth:1, borderColor:C.border, borderRadius:100, paddingHorizontal:14, paddingVertical:4 },
  profileItem:  { flexDirection:'row', alignItems:'center', gap:14, paddingHorizontal:20, paddingVertical:16, borderBottomWidth:1, borderColor:'rgba(255,255,255,0.04)' },
  profileIconBox:{ width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center' },

  // Bottom Nav
  bottomNav:    { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'rgba(9,12,20,0.97)', borderTopWidth:1, borderColor:'rgba(255,255,255,0.08)', flexDirection:'row', paddingTop:8, paddingBottom:Platform.OS==='ios'?28:12 },
  navItem:      { flex:1, alignItems:'center', gap:3 },
  navLabel:     { fontSize:10, fontWeight:'700', color:C.gray },
  navIndicator: { position:'absolute', bottom:-12, width:20, height:3, backgroundColor:C.accent, borderRadius:2 },
});
