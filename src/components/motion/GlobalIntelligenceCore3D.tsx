import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Globe, Cpu, Activity, RefreshCw, Zap, Maximize2, ShieldCheck } from "lucide-react";

interface ClusterHub {
  name: string;
  region: string;
  lat: number;
  lng: number;
  hardware: string;
  load: string;
  latency: string;
  model: string;
}

const HUBS: ClusterHub[] = [
  { name: "San Francisco", region: "US-WEST", lat: 37.77, lng: -122.41, hardware: "32,768x NVIDIA H100", load: "94.2%", latency: "14ms", model: "Claude 3.5 Sonnet / GPT-4o" },
  { name: "Tokyo", region: "AP-EAST", lat: 35.67, lng: 139.65, hardware: "8,192x Blackwell B200", load: "88.6%", latency: "22ms", model: "DeepSeek-V3 / Fugaku" },
  { name: "London", region: "EU-WEST", lat: 51.50, lng: -0.12, hardware: "16,384x Google TPU v5p", load: "91.0%", latency: "18ms", model: "Gemini 1.5 Pro / AlphaFold 3" },
  { name: "Bengaluru", region: "IN-SOUTH", lat: 12.97, lng: 77.59, hardware: "4,096x NVIDIA H200", load: "85.7%", latency: "19ms", model: "Sarvam AI / Krutrim" },
  { name: "Zurich", region: "EU-CENTRAL", lat: 47.37, lng: 8.54, hardware: "6,144x AMD MI300X", load: "82.4%", latency: "16ms", model: "Mistral Large / CERN Net" },
];

export function GlobalIntelligenceCore3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeHub, setActiveHub] = useState<ClusterHub>(HUBS[0]);
  const [isRotating, setIsRotating] = useState(true);
  const [activeMode, setActiveMode] = useState<"globe" | "neural" | "quantum">("globe");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for all core elements (tilts with mouse)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 2. Outer Wireframe Geodesic Sphere
    const sphereRadius = 2.4;
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x8a522a,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // 3. Dense Inner Glowing Core
    const coreGeo = new THREE.IcosahedronGeometry(1.15, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xc83e2b,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 4. Particle Cloud (1,400 Compute Nodes)
    const particleCount = 1400;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const amberColor = new THREE.Color(0xf59e0b);
    const redColor = new THREE.Color(0xc83e2b);
    const emeraldColor = new THREE.Color(0x10b981);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const r = sphereRadius + (Math.random() - 0.5) * 0.4;

      positions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const chosen = Math.random() > 0.6 ? emeraldColor : (Math.random() > 0.5 ? amberColor : redColor);
      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleSystem);

    // 5. Hub Pins and Lat/Lng Markers
    const hubMarkers: THREE.Mesh[] = [];
    HUBS.forEach((hub) => {
      // Convert lat/lng to 3D Cartesian coords on sphere
      const latRad = (hub.lat * Math.PI) / 180;
      const lngRad = ((hub.lng + 180) * Math.PI) / 180;
      const x = -(sphereRadius * Math.cos(latRad) * Math.cos(lngRad));
      const z = sphereRadius * Math.cos(latRad) * Math.sin(lngRad);
      const y = sphereRadius * Math.sin(latRad);

      // Glowing Pin
      const pinGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(x, y, z);
      globeGroup.add(pinMesh);
      hubMarkers.push(pinMesh);

      // Radar Pulse Ring around Pin
      const ringGeo = new THREE.RingGeometry(0.12, 0.16, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x * 1.02, y * 1.02, z * 1.02);
      ringMesh.lookAt(x * 2, y * 2, z * 2);
      globeGroup.add(ringMesh);
    });

    // 6. Orbital Connecting Synapse Arcs between Hubs
    const curveMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
    });

    for (let i = 0; i < hubMarkers.length - 1; i++) {
      const start = hubMarkers[i].position;
      const end = hubMarkers[i + 1].position;
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.multiplyScalar(1.35); // pull outward for arc

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(32);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcLine = new THREE.Line(arcGeo, curveMat);
      globeGroup.add(arcLine);
    }

    // 7. Mouse Interaction & Inertia Smoothing
    let targetRotationX = 0.2;
    let targetRotationY = 0;
    let isDragging = false;
    let previousMousePos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePos = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - previousMousePos.x;
        const deltaY = clientY - previousMousePos.y;
        targetRotationY += deltaX * 0.006;
        targetRotationX += deltaY * 0.006;
        previousMousePos = { x: clientX, y: clientY };
      } else {
        // Subtle tilt with mouse hover
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationX = normY * 0.3;
        targetRotationY += normX * 0.001;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    container.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    // 8. Render Animation Loop (Frame-rate independent via delta)
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // Continuous ambient rotation if enabled
      if (isRotating && !isDragging) {
        targetRotationY += dt * 0.25;
      }

      // Smooth lerp toward target rotation
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

      // Pulse inner core scale
      const time = clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(time * 3) * 0.05;
      coreMesh.scale.set(pulse, pulse, pulse);
      coreMesh.rotation.y -= dt * 0.4;
      coreMesh.rotation.x += dt * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Memory Disposal on Unmount
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      sphereGeo.dispose();
      sphereMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      curveMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating, activeMode]);

  return (
    <div className="relative my-6 bg-[#0c0a08] border-2 border-[#2b251d] rounded-2xl overflow-hidden shadow-2xl font-mono select-none">
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#14110d] border-b border-[#2a241b] text-neutral-300">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GLOBAL COMPUTE GRID · LIVE</span>
          </div>
          <span className="text-[10px] text-neutral-400 hidden sm:inline">
            1,400 TFLOPS ORBITAL SYNAPSE
          </span>
        </div>

        {/* Hub Selector Pills */}
        <div className="flex items-center gap-1 text-[9px]">
          {HUBS.map((hub) => (
            <button
              key={hub.name}
              onClick={() => setActiveHub(hub)}
              className={`px-2 py-1 rounded transition-all ${
                activeHub.name === hub.name
                  ? "bg-[#c83e2b] text-white font-bold shadow-md"
                  : "bg-white/5 hover:bg-white/10 text-neutral-400"
              }`}
            >
              {hub.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative h-[320px] sm:h-[360px] w-full cursor-grab active:cursor-grabbing">
        {/* Three.js Canvas Container */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Active Hub Telemetry HUD (Bottom Left) */}
        <div className="absolute bottom-4 left-4 max-w-[280px] bg-[#120f0c]/90 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 shadow-2xl text-[10px] space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="font-bold text-neutral-200 flex items-center gap-1">
              <Globe size={11} className="text-amber-400" /> {activeHub.name} Node
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-1 rounded border border-emerald-800">
              {activeHub.latency}
            </span>
          </div>

          <div className="text-neutral-400 leading-tight">
            <div className="text-[8.5px] uppercase tracking-wider text-amber-500/90 font-bold">Primary Cluster</div>
            <div className="text-neutral-200 font-semibold">{activeHub.hardware}</div>
          </div>

          <div className="flex justify-between items-center text-[8.5px] pt-1">
            <span className="text-neutral-400">Telemetry Load:</span>
            <span className="text-amber-400 font-bold">{activeHub.load}</span>
          </div>

          <div className="text-[8.5px] text-neutral-400 truncate">
            <span className="text-neutral-500">Models:</span> {activeHub.model}
          </div>
        </div>

        {/* Rotation & Interaction Helper Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-lg border text-[10px] flex items-center gap-1 font-bold transition-all ${
              isRotating
                ? "bg-amber-600/20 border-amber-500/40 text-amber-300"
                : "bg-white/5 border-white/10 text-neutral-400"
            }`}
            title="Toggle Continuous Rotation"
          >
            <RefreshCw size={11} className={isRotating ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{isRotating ? "Auto-Orbit" : "Paused"}</span>
          </button>
        </div>

        {/* Subtle Watermark Overlay */}
        <div className="absolute top-3 left-4 text-[9px] uppercase tracking-widest text-amber-500/40 pointer-events-none font-bold">
          [ 3D NEURAL TOPOLOGY · DRAG TO ROTATE ]
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="px-4 py-2 bg-[#080706] border-t border-[#201c15] flex items-center justify-between text-[8.5px] text-neutral-400">
        <div className="flex items-center gap-2 truncate">
          <Zap size={10} className="text-amber-400 flex-shrink-0" />
          <span className="text-neutral-300 font-bold">24H TOPOLOGICAL CONSENSUS:</span>
          <span className="truncate">All 5 global nodes reporting nominal GPU thermal envelopes & zero packet drops.</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-emerald-400 font-bold flex-shrink-0">
          <ShieldCheck size={10} /> VERIFIED AT 06:00 IST
        </div>
      </div>
    </div>
  );
}
