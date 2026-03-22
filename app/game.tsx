/**
 * TUNNEL RUNNER 3D — Game Screen (WebView edition)
 * ─────────────────────────────────────────────────
 * Replaces expo-gl / expo-three with a WebView running Three.js from CDN.
 * Works in Expo Go — no native build required.
 *
 * Architecture:
 *  • Three.js game runs inside a full-screen WebView (HTML string)
 *  • expo-sensors Gyroscope feeds data in via injectJavaScript every 16 ms
 *  • WebView posts score / collision / wallwarn events back via postMessage
 *  • Native layer handles HUD, lives, haptics, pause, navigation
 */

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Gyroscope } from 'expo-sensors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { DEFAULT_SETTINGS, SETTINGS_KEY, type GameSettings } from './settings';

// ─────────────────────────────────────────────────────────────────────────────
// HTML BUILDER  — bakes difficulty + sensitivity into the page at load time
// ─────────────────────────────────────────────────────────────────────────────
function buildGameHTML(settings: GameSettings): string {
  const { difficulty, gyroSensitivity } = settings;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#000011;overflow:hidden}
  canvas{display:block;width:100vw!important;height:100vh!important}
</style>
</head>
<body>
<script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
<script>
(function(){
  // ── Constants (baked from settings) ──
  var DIFF = '${difficulty}';
  var SENS = ${gyroSensitivity};

  var TUNNEL_RADIUS    = 4.5;
  var SEGMENT_LENGTH   = 90;
  var SEGMENT_COUNT    = 3;
  var OBSTACLE_COUNT   = 18;
  var OBSTACLE_SPACING = 11;
  var INITIAL_SPEED    = 0.055;
  var MAX_OFFSET       = TUNNEL_RADIUS * 0.70;
  var PLAYER_RADIUS    = 0.28;
  var COL_Z_HALF       = 0.75;
  var INVINCIBLE_MS    = 2200;
  var WALL_THRESH      = 0.88;
  var WARN_RATE_MS     = 280;

  var DIFF_CFG = {
    easy  :{ gapAngle: Math.PI*0.56, maxSpeed:0.22, speedScale:0.00009 },
    normal:{ gapAngle: Math.PI*0.48, maxSpeed:0.32, speedScale:0.00012 },
    hard  :{ gapAngle: Math.PI*0.38, maxSpeed:0.42, speedScale:0.00016 },
  };

  var NEON   = [0xff1155,0xff6600,0xcc00ff,0xff0088,0xff3300,0xff9900];
  var STRIPE = [0x00ffff,0xff00ff,0x00ff88,0xff4466,0x4499ff,0xffaa00,0xff00cc,0x44ffcc,0x8800ff,0x00ccff];

  function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }
  function randNeon(){ return NEON[Math.floor(Math.random()*NEON.length)]; }
  function normAngle(a){ while(a>Math.PI)a-=Math.PI*2; while(a<-Math.PI)a+=Math.PI*2; return a; }
  function post(obj){ try{ window.ReactNativeWebView.postMessage(JSON.stringify(obj)); }catch(e){} }

  // ── Mutable state ──
  window._gyro   = {x:0,y:0,z:0};
  window._paused = false;

  var px=0, py=0;
  var speed    = INITIAL_SPEED;
  var score    = 0;
  var zProg    = 0;
  var camZ     = 0;
  var invinc   = false;
  var lastWarn = 0;
  var lastScorePost = 0;

  // ── Renderer ──
  var renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(0x000011,1);
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000011,0.045);

  var cam = new THREE.PerspectiveCamera(78, window.innerWidth/window.innerHeight, 0.1, 90);
  scene.add(cam);

  scene.add(new THREE.AmbientLight(0x0d1133,3.5));
  var fill = new THREE.PointLight(0x00ccff,3.5,18);
  fill.position.set(0,0,1); cam.add(fill);
  var rim = new THREE.PointLight(0xff00cc,2,12);
  rim.position.set(2.5,2.5,-2); cam.add(rim);

  // Player sphere
  var player = new THREE.Mesh(
    new THREE.SphereGeometry(PLAYER_RADIUS,22,22),
    new THREE.MeshPhongMaterial({color:0x00ffff,emissive:0x009999,emissiveIntensity:0.9,shininess:500})
  );
  player.position.set(0,0,-2.2);
  scene.add(player);

  // Glow halo
  player.add(new THREE.Mesh(
    new THREE.SphereGeometry(PLAYER_RADIUS*2.2,16,16),
    new THREE.MeshBasicMaterial({color:0x00ffff,transparent:true,opacity:0.12,side:THREE.BackSide})
  ));

  // Trail ring
  var trailGeo = new THREE.TorusGeometry(0.55,0.055,8,24);
  trailGeo.rotateX(Math.PI/2);
  var trail = new THREE.Mesh(trailGeo,
    new THREE.MeshBasicMaterial({color:0x00ffff,transparent:true,opacity:0.45}));
  trail.position.z = 0.35;
  player.add(trail);

  // ── Tunnel segment builder ──
  function buildTunnel(worldZ){
    var g = new THREE.Group();
    var cyl = new THREE.CylinderGeometry(TUNNEL_RADIUS,TUNNEL_RADIUS,SEGMENT_LENGTH,40,1,true);
    cyl.rotateX(Math.PI/2);
    g.add(new THREE.Mesh(cyl,new THREE.MeshPhongMaterial({
      color:0x080820,side:THREE.BackSide,emissive:0x040410,shininess:60
    })));
    STRIPE.forEach(function(col,s){
      var angle=(s/STRIPE.length)*Math.PI*2, pts=[];
      for(var j=0;j<=22;j++) pts.push(new THREE.Vector3(
        Math.cos(angle)*(TUNNEL_RADIUS-0.06),
        Math.sin(angle)*(TUNNEL_RADIUS-0.06),
        -j*(SEGMENT_LENGTH/22)
      ));
      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.55})
      ));
    });
    for(var r=15;r<SEGMENT_LENGTH;r+=15){
      var rg=new THREE.TorusGeometry(TUNNEL_RADIUS-0.05,0.06,6,36);
      rg.rotateX(Math.PI/2);
      var rm=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:0x1133aa,transparent:true,opacity:0.4}));
      rm.position.z=-r; g.add(rm);
    }
    g.position.z=worldZ; scene.add(g); return g;
  }

  // ── Obstacle ring builder ──
  function buildRing(worldZ){
    var cfg=DIFF_CFG[DIFF], g=new THREE.Group();
    var segs=30, ringR=TUNNEL_RADIUS*0.87;
    var halfGapN=Math.ceil(segs*(cfg.gapAngle/(Math.PI*2))/2);
    var color=randNeon();
    var emissive=new THREE.Color(color).multiplyScalar(0.55);
    for(var i=0;i<segs;i++){
      if(i<halfGapN||i>=segs-halfGapN) continue;
      var mid=((i+0.5)/segs)*Math.PI*2;
      var bw=(2*Math.PI*ringR/segs)*0.82;
      var b=new THREE.Mesh(
        new THREE.BoxGeometry(bw,0.46,0.95),
        new THREE.MeshPhongMaterial({color:color,emissive:emissive,emissiveIntensity:0.75,shininess:250})
      );
      b.position.set(Math.cos(mid)*ringR,Math.sin(mid)*ringR,0);
      b.rotation.z=mid; g.add(b);
    }
    var og=new THREE.TorusGeometry(ringR,0.04,6,40);
    og.rotateX(Math.PI/2);
    g.add(new THREE.Mesh(og,new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:0.35})));
    g.rotation.z=Math.random()*Math.PI*2;
    g.position.z=worldZ;
    g.userData.gapAngle=g.rotation.z;
    scene.add(g); return g;
  }

  // Build world
  var segments=[],obstacles=[];
  for(var i=0;i<SEGMENT_COUNT;i++)  segments.push(buildTunnel(-(i*SEGMENT_LENGTH)));
  for(var i=0;i<OBSTACLE_COUNT;i++) obstacles.push(buildRing(-(9+i*OBSTACLE_SPACING)));

  // Particles
  var ptPos=[];
  for(var p=0;p<300;p++){
    var a=Math.random()*Math.PI*2, r=Math.random()*TUNNEL_RADIUS*0.75;
    ptPos.push(Math.cos(a)*r, Math.sin(a)*r, -(Math.random()*200+5));
  }
  var ptg=new THREE.BufferGeometry();
  ptg.setAttribute('position',new THREE.Float32BufferAttribute(ptPos,3));
  scene.add(new THREE.Points(ptg,new THREE.PointsMaterial({
    color:0xaaccff,size:0.08,sizeAttenuation:true,transparent:true,opacity:0.6
  })));

  // ── Game loop ──
  var last=performance.now();
  function loop(now){
    requestAnimationFrame(loop);
    var dt=clamp((now-last)/16.67,0.1,4);
    last=now;

    if(window._paused){ renderer.render(scene,cam); return; }

    var cfg=DIFF_CFG[DIFF];
    speed=clamp(INITIAL_SPEED+score*cfg.speedScale, INITIAL_SPEED, cfg.maxSpeed);

    // Gyro → position (data injected from native)
    var g=window._gyro;
    px=clamp(px - g.y*SENS*dt, -MAX_OFFSET, MAX_OFFSET);
    py=clamp(py - g.x*SENS*dt, -MAX_OFFSET, MAX_OFFSET);

    var adv=speed*dt;
    camZ-=adv; zProg+=adv;
    cam.position.z=camZ;

    player.position.set(px, py, camZ-2.2);
    trail.rotation.z+=0.06*dt;

    score=Math.floor(zProg*9);
    if(now-lastScorePost>100){
      lastScorePost=now;
      post({type:'score',value:score,speedLv:clamp(1+Math.floor(score/180),1,6)});
    }

    // Recycle tunnel
    for(var si=0;si<segments.length;si++){
      var seg=segments[si];
      if(seg.position.z>camZ+12){
        var minZ=segments.reduce(function(m,s){return Math.min(m,s.position.z);},Infinity);
        seg.position.z=minZ-SEGMENT_LENGTH;
      }
    }

    // Recycle obstacles
    for(var oi=0;oi<obstacles.length;oi++){
      var obs=obstacles[oi];
      if(obs.position.z>camZ+12){
        var minZ=obstacles.reduce(function(m,o){return Math.min(m,o.position.z);},Infinity);
        obs.position.z=minZ-OBSTACLE_SPACING;
        obs.rotation.z=Math.random()*Math.PI*2;
        obs.userData.gapAngle=obs.rotation.z;
      }
    }

    // Collision detection
    if(!invinc){
      var dist=Math.sqrt(px*px+py*py);
      for(var oi=0;oi<obstacles.length;oi++){
        var obs=obstacles[oi];
        if(Math.abs(player.position.z-obs.position.z)<COL_Z_HALF && dist>TUNNEL_RADIUS*0.40){
          var diff=normAngle(Math.atan2(py,px)-obs.userData.gapAngle);
          if(Math.abs(diff)>cfg.gapAngle/2){
            invinc=true;
            post({type:'collision',score:score});
            setTimeout(function(){ invinc=false; },INVINCIBLE_MS);
            break;
          }
        }
      }
    }

    // Wall warning
    var d2=Math.sqrt(px*px+py*py);
    if(d2>MAX_OFFSET*WALL_THRESH && !invinc && now-lastWarn>WARN_RATE_MS){
      lastWarn=now;
      post({type:'wallwarn'});
    }

    player.visible = invinc ? (Math.floor(now/110)%2===0) : true;
    renderer.render(scene,cam);
  }
  requestAnimationFrame(loop);

  window.addEventListener('resize',function(){
    cam.aspect=window.innerWidth/window.innerHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });
})();
</script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function GameScreen() {
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(3);
  const [speedLv,  setSpeedLv]  = useState(1);
  const [paused,   setPaused]   = useState(false);
  const [gameHTML, setGameHTML] = useState<string | null>(null);

  const flashAnim   = useRef(new Animated.Value(0)).current;
  const livesRef    = useRef(3);
  const gsRef       = useRef<'playing' | 'paused' | 'dead'>('playing');
  const scoreRef    = useRef(0);
  const webviewRef  = useRef<WebView>(null);
  const settingsRef = useRef<GameSettings>(DEFAULT_SETTINGS);

  // ── Load settings → build HTML ──────────────────────────────────────────
  useEffect(() => {
    SecureStore.getItemAsync(SETTINGS_KEY).then(v => {
      if (v) {
        const parsed = JSON.parse(v);
        settingsRef.current = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          hapticsEnabled:  parsed.hapticsEnabled === true || parsed.hapticsEnabled === 'true',
          gyroSensitivity: Number(parsed.gyroSensitivity ?? DEFAULT_SETTINGS.gyroSensitivity),
        };
      }
      setGameHTML(buildGameHTML(settingsRef.current));
    });
  }, []);

  // ── Gyroscope → inject into WebView ─────────────────────────────────────
  useEffect(() => {
    if (!gameHTML) return;                   // wait for webview to be mounted
    Gyroscope.setUpdateInterval(16);
    const sub = Gyroscope.addListener(d => {
      webviewRef.current?.injectJavaScript(
        `window._gyro={x:${d.x},y:${d.y},z:${d.z}};true;`
      );
    });
    return () => sub.remove();
  }, [gameHTML]);

  // ── Flash helper ────────────────────────────────────────────────────────
  const triggerFlash = () => {
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 55,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 230, useNativeDriver: true }),
    ]).start();
  };

  // ── Messages from WebView ────────────────────────────────────────────────
  const handleMessage = useCallback((event: any) => {
    let msg: any;
    try { msg = JSON.parse(event.nativeEvent.data); } catch { return; }

    if (msg.type === 'score') {
      scoreRef.current = msg.value;
      setScore(msg.value);
      setSpeedLv(msg.speedLv);
      return;
    }

    if (msg.type === 'collision') {
      if (gsRef.current !== 'playing') return;

      if (settingsRef.current.hapticsEnabled)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      triggerFlash();

      livesRef.current -= 1;
      setLives(livesRef.current);

      if (livesRef.current <= 0) {
        gsRef.current = 'dead';
        webviewRef.current?.injectJavaScript('window._paused=true;true;');
        if (settingsRef.current.hapticsEnabled)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setTimeout(() => {
          router.replace({ pathname: '/gameover', params: { score: scoreRef.current } });
        }, 350);
      }
      return;
    }

    if (msg.type === 'wallwarn') {
      if (settingsRef.current.hapticsEnabled)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pause / quit ────────────────────────────────────────────────────────
  const togglePause = () => {
    const next = gsRef.current === 'paused' ? 'playing' : 'paused';
    gsRef.current = next;
    const p = next === 'paused';
    setPaused(p);
    webviewRef.current?.injectJavaScript(`window._paused=${p};true;`);
  };

  const confirmQuit = () => {
    gsRef.current = 'paused';
    setPaused(true);
    webviewRef.current?.injectJavaScript('window._paused=true;true;');
    Alert.alert('Quit Game', 'Return to the menu? Your score will be lost.', [
      {
        text: 'Cancel', style: 'cancel',
        onPress: () => {
          gsRef.current = 'playing';
          setPaused(false);
          webviewRef.current?.injectJavaScript('window._paused=false;true;');
        },
      },
      { text: 'Quit', style: 'destructive', onPress: () => router.replace('/') },
    ]);
  };

  // ── Speed bar colours ────────────────────────────────────────────────────
  const SPEED_COLS = ['#00ff88','#88ff00','#ffcc00','#ff8800','#ff4400','#ff0000'];

  // Loading state (settings not yet read)
  if (!gameHTML) return <View style={styles.root} />;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* Three.js game in a WebView */}
      <WebView
        ref={webviewRef}
        style={StyleSheet.absoluteFill}
        source={{ html: gameHTML }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mediaPlaybackRequiresUserAction={false}
      />

      {/* Collision flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: flashAnim }]}
      />

      {/* HUD */}
      <View style={styles.hud} pointerEvents="box-none">
        <View style={styles.hudTop}>

          {/* Score */}
          <View>
            <Text style={styles.hudLabel}>SCORE</Text>
            <Text style={styles.hudScore}>{String(score).padStart(6, '0')}</Text>
          </View>

          {/* Speed bars */}
          <View style={styles.speedWrap}>
            <Text style={styles.hudLabel}>SPEED</Text>
            <View style={styles.speedBars}>
              {Array(6).fill(0).map((_, i) => (
                <View
                  key={i}
                  style={[styles.speedBar, { backgroundColor: i < speedLv ? SPEED_COLS[i] : '#1a1a2e' }]}
                />
              ))}
            </View>
          </View>

          {/* Lives */}
          <View style={styles.livesWrap}>
            <Text style={styles.hudLabel}>LIVES</Text>
            <View style={styles.heartsRow}>
              {Array(3).fill(0).map((_, i) => (
                <Text key={i} style={{ opacity: i < lives ? 1 : 0.2, fontSize: 18 }}>❤️</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Control buttons */}
        <View style={styles.hudControls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={togglePause} activeOpacity={0.75}>
            <Text style={styles.ctrlText}>{paused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={confirmQuit} activeOpacity={0.75}>
            <Text style={styles.ctrlText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pause overlay */}
      {paused && (
        <View style={styles.pauseOverlay} pointerEvents="none">
          <Text style={styles.pauseText}>PAUSED</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000011' },

  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff0033',
    pointerEvents: 'none' as any,
  },

  hud: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingTop: Platform.OS === 'ios' ? 52 : 32,
    paddingHorizontal: 16,
  },

  hudTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

  hudLabel: { color: '#445566', fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 3 },
  hudScore:  {
    color: '#00ffff', fontSize: 26, fontWeight: '900', letterSpacing: 2,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },

  speedWrap: { alignItems: 'center' },
  speedBars: { flexDirection: 'row', gap: 3 },
  speedBar:  { width: 11, height: 18, borderRadius: 3 },

  livesWrap: { alignItems: 'flex-end' },
  heartsRow: { flexDirection: 'row', gap: 3 },

  hudControls: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  ctrlBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(0,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,17,0.6)',
  },
  ctrlText: { color: '#00ffff', fontSize: 14 },

  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,17,0.65)',
  },
  pauseText: {
    color: '#00ffff', fontSize: 36, fontWeight: '900', letterSpacing: 10,
    textShadowColor: '#00ffff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24,
  },
});