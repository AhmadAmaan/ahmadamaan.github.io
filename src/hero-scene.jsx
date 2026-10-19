import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const NODES = [
  { name: 'ABOUT', id:'about', compact: [-1.8, .05, -.85], open: [-2.65, .12, -1.45], color: '#dbb887' },
  { name: 'WORK', id:'work', compact: [1.8, .05, -.85], open: [2.65, .12, -1.45], color: '#e4a16d' },
  { name: 'RESEARCH', id:'research', compact: [-1.8, .05, 1.15], open: [-2.65, .12, 1.55], color: '#baa5ce' },
  { name: 'WRITING', id:'writing', compact: [1.8, .05, 1.15], open: [2.65, .12, 1.55], color: '#a9b997' },
];

class SceneBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromScene(room, .04);
    scene.environment = target.texture;
    scene.environmentIntensity = .65;
    room.dispose(); generator.dispose();
    return () => { scene.environment = null; target.dispose(); };
  }, [gl, scene]);
  return null;
}

function Architecture({ model, host, hero, stage, isPaused }) {
  const { invalidate, camera, size } = useThree();
  const projected=useMemo(()=>new THREE.Vector3(),[]);
  const rig = useRef();
  const slices = useRef([]);
  const nodes = useRef([]);
  const packets = useRef([]);
  const halo = useRef();
  const time = useRef(0);
  const firstFrame = useRef(true);
  useEffect(()=>{
    camera.zoom=matchMedia('(max-width: 720px)').matches?clamp((size.width-112)/5.3,26,58):clamp(size.width*.105,62,105);
    camera.updateProjectionMatrix();invalidate();
  },[camera,invalidate,size.width]);
  const materials = useMemo(() => ({
    metal: new THREE.MeshStandardMaterial({ color: '#9b7556', metalness: .76, roughness: .29 }),
    side: new THREE.MeshStandardMaterial({ color: '#3d3026', metalness: .6, roughness: .4 }),
    edge: new THREE.MeshStandardMaterial({ color: '#e8b888', metalness: .65, roughness: .24 }),
    chip: new THREE.MeshStandardMaterial({ color: '#edb57c', emissive: '#be6229', emissiveIntensity: .65, metalness: .45, roughness: .28 }),
  }), []);
  const geometry = useMemo(() => ({
    slice: new RoundedBoxGeometry(1.45,.22,1.45,3,.065),
    node: new RoundedBoxGeometry(.72, .18, .72, 3, .07),
    chip: new RoundedBoxGeometry(.66, .07, .66, 2, .03),
    packet: new THREE.SphereGeometry(.035, 10, 8),
  }), []);
  const links = useMemo(() => NODES.map(node => {
    const points = new Float32Array(25 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const mat = new THREE.LineBasicMaterial({ color: node.color, transparent: true, opacity: .44 });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    return line;
  }), []);

  useEffect(() => {
    camera.lookAt(0, .1, 0);
    let timer;
    let active = true;
    const update = () => {
      clearInterval(timer);
      const r = hero.getBoundingClientRect();
      active = !document.hidden && r.bottom > 88 && r.top < innerHeight && !isPaused();
      model.active = active;
      if(!active)window.gsap?.killTweensOf(model);
      if (active) { invalidate(); timer = setInterval(invalidate, 1000 / (matchMedia('(max-width: 720px)').matches?24:30)); }
    };
    const onMotion = () => update();
    const observer = new IntersectionObserver(update, {threshold:0});
    observer.observe(hero);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('portfolio:motion', onMotion);
    const onMove = event => {
      if (!active || (event.pointerType==='mouse' && !matchMedia('(pointer:fine)').matches)) return;
      const r = stage.getBoundingClientRect();
      model.pointerX = clamp((event.clientX-r.left)/r.width-.5,-.5,.5);
      model.pointerY = clamp((event.clientY-r.top)/r.height-.5,-.5,.5);
      invalidate();
    };
    const onLeave = () => { model.pointerX = 0; model.pointerY = 0; invalidate(); };
    stage.addEventListener('pointermove', onMove);stage.addEventListener('pointerleave', onLeave);
    const onTouchEnd=event=>{if(event.pointerType!=='mouse')onLeave();};
    stage.addEventListener('pointerdown',onMove);
    stage.addEventListener('pointerup',onTouchEnd);
    stage.addEventListener('pointercancel',onTouchEnd);
    const nodeLinks=[...stage.querySelectorAll('[data-node-name]')];
    const highlight=event=>{
      const link=event.target.closest('[data-node-name]');
      model.hovered=link?NODES.findIndex(node=>node.name===link.dataset.nodeName):-1;
      invalidate();
    };
    const unhighlight=()=>{model.hovered=-1;invalidate();};
    nodeLinks.forEach(link=>{link.addEventListener('pointerenter',highlight);link.addEventListener('focus',highlight);link.addEventListener('pointerleave',unhighlight);link.addEventListener('blur',unhighlight);});
    const onScroll = () => {
      const rect=hero.getBoundingClientRect();
      const shouldAnimate=!document.hidden && rect.bottom>88 && rect.top<innerHeight && !isPaused();
      if(shouldAnimate!==active)update();
      if (isPaused()) return;
      const value=clamp((88-rect.top)/Math.max(220,hero.offsetHeight-innerHeight),0,1);
      if(rect.bottom<=88 || rect.top>=innerHeight){window.gsap?.killTweensOf(model);model.progress=value;return;}
      if (window.gsap) {
        window.gsap.to(model,{progress:value,duration:.65,overwrite:true,ease:'power2.out',onUpdate:invalidate});
      } else { model.progress=value;invalidate(); }
      host.dataset.phase=value>.65?'distributed':value>.2?'unfolding':'compact';
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    update();onScroll();
    return () => {
      clearInterval(timer);observer.disconnect();
      window.gsap?.killTweensOf(model);
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('portfolio:motion',onMotion);
      document.removeEventListener('visibilitychange',update);
      stage.removeEventListener('pointermove',onMove);stage.removeEventListener('pointerleave',onLeave);
      stage.removeEventListener('pointerdown',onMove);
      stage.removeEventListener('pointerup',onTouchEnd);
      stage.removeEventListener('pointercancel',onTouchEnd);
      nodeLinks.forEach(link=>{link.removeEventListener('pointerenter',highlight);link.removeEventListener('focus',highlight);link.removeEventListener('pointerleave',unhighlight);link.removeEventListener('blur',unhighlight);});
      model.active=false;
    };
  }, [camera, hero, host, invalidate, isPaused, model, stage]);

  useEffect(() => () => {
    Object.values(materials).forEach(material=>material.dispose());
    Object.values(geometry).forEach(geo=>geo.dispose());
    links.forEach(link=>{link.geometry.dispose();link.material.dispose();});
  }, [geometry, links, materials]);

  useFrame((_, delta) => {
    const moving = !isPaused() && model.active;
    if (moving) time.current += Math.min(delta,.05);
    const t=time.current,p=model.progress;
    const damp=moving?.09:1;
    rig.current.rotation.y=lerp(rig.current.rotation.y,model.pointerX*.16,damp);
    rig.current.rotation.x=lerp(rig.current.rotation.x,model.pointerY*.12,damp);
    rig.current.position.y=Math.sin(t*.55)*.045;
    slices.current.forEach((slice,i)=>{if(slice)slice.position.y=(i-1)*(.34+p*.35);});
    nodes.current.forEach((node,i)=>{
      if(!node)return;
      const config=NODES[i];
      node.position.set(...config.compact.map((v,j)=>lerp(v,config.open[j],p)));
      node.position.y+=Math.sin(t*.7+i)*.035;
      node.rotation.y=0;
      const selected=model.hovered===i;
      node.scale.setScalar(selected?1.08:1);
      const tile=node.children[0];
      if(tile?.material)tile.material.emissiveIntensity=selected?.2:0;
      links[i].material.opacity=selected?.95:.35;
      const positions=links[i].geometry.attributes.position;
      for(let k=0;k<25;k++){
        const u=k/24;
        positions.setXYZ(k,node.position.x*u,lerp(-.15,node.position.y-.1,u)+Math.sin(u*Math.PI)*(.15+p*.22),node.position.z*u);
      }
      positions.needsUpdate=true;
      const u=(t*.19+i*.23)%1;
      packets.current[i]?.position.set(node.position.x*u,lerp(-.15,node.position.y-.1,u)+Math.sin(u*Math.PI)*(.15+p*.22),node.position.z*u);
    });
    if(halo.current)halo.current.rotation.z=t*.035;
    rig.current.updateMatrixWorld(true);
    nodes.current.forEach((node,i)=>{
      const label=stage.querySelector(`[data-node-name="${NODES[i].name}"]`);
      if(!node||!label)return;
      node.getWorldPosition(projected);projected.project(camera);
      label.style.left=`${(projected.x*.5+.5)*size.width}px`;
      const labelOffset=matchMedia('(max-width: 720px)').matches?(i<2?-32:32):35;
      label.style.top=`${(-projected.y*.5+.5)*size.height+labelOffset}px`;
      label.classList.toggle('is-active',model.hovered===i);
    });
    model.frames++;
    if(firstFrame.current){
      firstFrame.current=false;
      requestAnimationFrame(()=>{stage.classList.add('scene-ready');document.body.classList.add('has-webgl');host.dataset.scene='ready';});
    }
  });

  return <>
    <Environment />
    <ambientLight intensity={.65} color="#e2c4a7" />
    <directionalLight position={[-3,6,4]} intensity={3} color="#ffe7c8" />
    <directionalLight position={[3,2,-4]} intensity={1.3} color="#dcb4a1" />
    <pointLight position={[0,1,1]} intensity={3.5} color="#e9a46a" distance={7} />
    <group ref={rig}>
      <group rotation={[0,Math.PI/4,0]}>
        {[0,1,2].map(i=><group key={i} ref={node=>{slices.current[i]=node;}}>
          <mesh geometry={geometry.slice} material={materials.metal}/>
          <mesh position={[0,-.115,0]} scale={[.97,.12,.97]} geometry={geometry.slice} material={materials.side}/>
          <mesh position={[0,-.125,0]} scale={[.96,.035,.96]} geometry={geometry.slice} material={materials.edge}/>
          {i===2&&<><mesh position={[0,.13,0]} geometry={geometry.chip} material={materials.side}/><mesh position={[0,.18,0]} scale={[.63,.6,.63]} geometry={geometry.chip} material={materials.chip}/></>}
        </group>)}
      </group>
      {NODES.map((node,i)=><group key={node.name} ref={value=>{nodes.current[i]=value;}}
        onPointerOver={event=>{event.stopPropagation();model.hovered=i;stage.style.cursor='pointer';invalidate();}}
        onPointerOut={()=>{model.hovered=-1;stage.style.cursor='';invalidate();}}
        onClick={event=>{event.stopPropagation();stage.querySelector(`[data-node-name="${node.name}"]`)?.click();}}>
        <mesh geometry={geometry.node}><meshStandardMaterial color="#997556" metalness={.7} roughness={.3} emissive={node.color} emissiveIntensity={0}/></mesh>
        <mesh position={[0,.11,0]} rotation={[-Math.PI/2,0,0]}>
          {i===0?<circleGeometry args={[.105,24]}/>:i===1?<planeGeometry args={[.27,.2]}/>:i===2?<ringGeometry args={[.08,.12,4]}/>:<planeGeometry args={[.17,.25]}/>}
          <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={.12} roughness={.4}/>
        </mesh>
      </group>)}
      {links.map((line,i)=><primitive key={i} object={line}/>)}
      {NODES.map((node,i)=><mesh key={i} ref={value=>{packets.current[i]=value;}} geometry={geometry.packet}><meshBasicMaterial color={node.color}/></mesh>)}
      <mesh ref={halo} rotation={[-Math.PI/2,0,0]} position={[0,-1.1,0]}>
        <ringGeometry args={[3.12,3.125,96]}/><meshBasicMaterial color="#9b785c" transparent opacity={.19} side={THREE.DoubleSide}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.12,0]}><circleGeometry args={[3.1,64]}/><meshBasicMaterial color="#6e4327" transparent opacity={.025}/></mesh>
    </group>
  </>;
}

export function mountHero({ host, stage, hero, isPaused }) {
  const model={progress:0,pointerX:0,pointerY:0,hovered:-1,active:false,frames:0};
  window.__portfolioScene=model;
  const root=createRoot(host);
  const mobile=matchMedia('(max-width: 720px)').matches;
  const onFailure=()=>{stage.classList.remove('scene-ready');document.body.classList.remove('has-webgl');host.dataset.scene='fallback';model.active=false;};
  root.render(<SceneBoundary onFailure={onFailure}><Canvas orthographic camera={{position:[0,6,8],zoom:85,near:.1,far:80}} dpr={[1,mobile?1.15:1.5]} frameloop="demand" gl={{alpha:true,antialias:true,powerPreference:'low-power'}} fallback={null} onCreated={({gl})=>{
    gl.setClearColor(0x000000,0);
    const canvas=gl.domElement;
    canvas.setAttribute('aria-hidden','true');
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onFailure();root.unmount();},{once:true});
  }}><Architecture model={model} host={host} hero={hero} stage={stage} isPaused={isPaused}/></Canvas></SceneBoundary>);
  return ()=>{root.unmount();stage.classList.remove('scene-ready');document.body.classList.remove('has-webgl');host.dataset.scene='fallback';};
}
