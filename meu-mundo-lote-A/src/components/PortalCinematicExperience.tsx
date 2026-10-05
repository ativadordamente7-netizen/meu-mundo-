import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DynamicIcon } from './IconHelper';
import { playInfinityTone, playPortalExpansionSound, playWarmChime } from '../utils/audioChimes';

interface PortalCinematicExperienceProps {
  onEnterApp: () => void;
  childName?: string;
  autoStart?: boolean;
}

type ExperiencePhase =
  | 'calm' // Quase estático, contemplativo e acolhedor
  | 'particles' // Partículas de luz dourada e azul surgem do solo
  | 'floating' // Peças 3D ganham volume, flutuam e revelam profundidade real
  | 'infinity' // Fluxo de luz percorre o ambiente e desenha o símbolo do infinito
  | 'portal' // Luz se expande calorosamente e transiciona para o aplicativo
  | 'completed'; // Entrou no aplicativo

export const PortalCinematicExperience: React.FC<PortalCinematicExperienceProps> = ({
  onEnterApp,
  childName = 'cada criança',
  autoStart = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<ExperiencePhase>('calm');
  const [soundMuted, setSoundMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // References to communicate with Three.js animation loop
  const phaseRef = useRef<ExperiencePhase>('calm');
  phaseRef.current = phase;

  const soundMutedRef = useRef(soundMuted);
  soundMutedRef.current = soundMuted;

  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const deepIndigo = new THREE.Color(0x060919);
    scene.background = deepIndigo;
    scene.fog = new THREE.FogExp2(0x060919, 0.028);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 15.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- 2. MULTI-LAYERED LIGHTING ---
    // Ambient light: warm candle/twilight glow
    const ambientLight = new THREE.AmbientLight(0xffecd2, 1.15);
    scene.add(ambientLight);

    // Key light: warm golden sunlight from upper right
    const keyLight = new THREE.DirectionalLight(0xffdf9e, 2.2);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    // Fill light: celestial cyan rim light from back-left
    const rimLight = new THREE.DirectionalLight(0x48cae4, 1.4);
    rimLight.position.set(-8, -2, -5);
    scene.add(rimLight);

    // Dynamic point light that follows the infinity loop beam
    const infinityLight = new THREE.PointLight(0xffeaa7, 0, 18, 1.5);
    scene.add(infinityLight);

    // Ground bounce soft light
    const groundBounceLight = new THREE.PointLight(0x06d6a0, 0.4, 10);
    groundBounceLight.position.set(0, -4.2, 2);
    scene.add(groundBounceLight);

    // --- 3. 3D SKY DOME & TWINKLING STARS ---
    // Starfield
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starBaseSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const radius = 35 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) - 5; // Mostly upper sky
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      starBaseSizes[i] = 0.2 + Math.random() * 0.4;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    // Star texture
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const sctx = starCanvas.getContext('2d');
    if (sctx) {
      const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 235, 180, 0.8)');
      grad.addColorStop(0.7, 'rgba(100, 200, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 32, 32);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 0.55,
      map: starTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // --- 4. 3D PROCEDURAL GROUND WITH JIGSAW SEAMS ---
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 1024;
    groundCanvas.height = 1024;
    const gctx = groundCanvas.getContext('2d');
    if (gctx) {
      // Background gradient: deep midnight indigo
      const bgGrad = gctx.createRadialGradient(512, 512, 50, 512, 512, 512);
      bgGrad.addColorStop(0, '#101c38');
      bgGrad.addColorStop(0.4, '#090e24');
      bgGrad.addColorStop(1, '#050814');
      gctx.fillStyle = bgGrad;
      gctx.fillRect(0, 0, 1024, 1024);

      // Drawing glowing puzzle interlocking grid lines on terrain
      gctx.lineWidth = 4;
      const step = 96;
      for (let x = step; x < 1024; x += step) {
        for (let y = step; y < 1024; y += step) {
          const dist = Math.hypot(x - 512, y - 512);
          if (dist < 460) {
            // Luminous golden and cyan interlocking seams
            gctx.strokeStyle = (x + y) % (step * 2) === 0 ? 'rgba(255, 209, 102, 0.22)' : 'rgba(72, 202, 228, 0.20)';
            gctx.beginPath();
            gctx.arc(x, y, 16, 0, Math.PI * 2);
            gctx.stroke();

            gctx.strokeStyle = 'rgba(255, 235, 160, 0.12)';
            gctx.strokeRect(x - step / 2, y - step / 2, step, step);
          }
        }
      }

      // Center golden aura where the boy stands
      const centerAura = gctx.createRadialGradient(512, 512, 20, 512, 512, 280);
      centerAura.addColorStop(0, 'rgba(255, 215, 120, 0.35)');
      centerAura.addColorStop(0.5, 'rgba(72, 202, 228, 0.15)');
      centerAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      gctx.fillStyle = centerAura;
      gctx.fillRect(0, 0, 1024, 1024);
    }
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.ClampToEdgeWrapping;
    groundTexture.wrapT = THREE.ClampToEdgeWrapping;

    const groundGeo = new THREE.PlaneGeometry(36, 36, 48, 48);
    // Subtle concentric terrain undulation
    const groundPos = groundGeo.attributes.position;
    for (let i = 0; i < groundPos.count; i++) {
      const gx = groundPos.getX(i);
      const gy = groundPos.getY(i);
      const r = Math.hypot(gx, gy);
      groundPos.setZ(i, Math.sin(r * 0.35) * 0.18 - Math.pow(r / 18, 2) * 1.2);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.5,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -4.5;
    scene.add(groundMesh);

    // Soft contact shadow under the boy's feet
    const shadowGeo = new THREE.PlaneGeometry(3.6, 2.0);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx2 = shadowCanvas.getContext('2d');
    if (sctx2) {
      const grad = sctx2.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(2, 4, 10, 0.85)');
      grad.addColorStop(0.5, 'rgba(4, 7, 18, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sctx2.fillStyle = grad;
      sctx2.fillRect(0, 0, 128, 128);
    }
    const shadowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -4.48, 0.1);
    scene.add(shadowMesh);

    // --- 5. THE INTEGRATED 3D CHARACTER (BOY LOOKING UP WITH OPEN ARMS) ---
    // Curved 3D relief mesh to eliminate any "flat cutout/cardboard" look
    const boyWidth = 6.8;
    const boyHeight = 10.2;
    const boyGeo = new THREE.PlaneGeometry(boyWidth, boyHeight, 36, 36);

    // Convex anatomical 3D curvature: chest protrudes forward, arms spread organically back & outward
    const bPos = boyGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const bx = bPos.getX(i);
      const by = bPos.getY(i);
      // Parabolic curvature in X and gentle volume in Y
      const curveZ = -Math.pow(bx / 3.4, 2) * 0.45 + (1.0 - Math.min(Math.abs(by) / 5.1, 1.0)) * 0.25;
      bPos.setZ(i, curveZ);
    }
    boyGeo.computeVertexNormals();

    const textureLoader = new THREE.TextureLoader();
    const boyGroup = new THREE.Group();
    scene.add(boyGroup);

    let boyMesh: THREE.Mesh | null = null;

    // Load feathered alpha mask and bump map
    textureLoader.load('/assets/boy_feathered.png', (boyTexture) => {
      boyTexture.colorSpace = THREE.SRGBColorSpace;

      textureLoader.load('/assets/boy_bump.png', (bumpTexture) => {
        const boyMat = new THREE.MeshStandardMaterial({
          map: boyTexture,
          bumpMap: bumpTexture,
          bumpScale: 0.08, // Dynamic 3D lighting catches surface depth
          roughness: 0.65,
          metalness: 0.08,
          transparent: true,
          alphaTest: 0.02,
          depthWrite: true,
          side: THREE.DoubleSide,
        });

        boyMesh = new THREE.Mesh(boyGeo, boyMat);
        // Positioned standing on ground (y = -4.5 + half height approx)
        boyMesh.position.set(0, 0.4, 0);
        boyGroup.add(boyMesh);
      });
    });

    // Luminous halo aura directly behind boy
    const auraGeo = new THREE.PlaneGeometry(15, 15);
    const auraCanvas = document.createElement('canvas');
    auraCanvas.width = 256;
    auraCanvas.height = 256;
    const actx = auraCanvas.getContext('2d');
    if (actx) {
      const grad = actx.createRadialGradient(128, 128, 10, 128, 128, 128);
      grad.addColorStop(0, 'rgba(255, 220, 140, 0.45)');
      grad.addColorStop(0.35, 'rgba(72, 202, 228, 0.22)');
      grad.addColorStop(0.7, 'rgba(157, 78, 221, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      actx.fillStyle = grad;
      actx.fillRect(0, 0, 256, 256);
    }
    const auraMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(auraCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.set(0, 0.6, -0.6);
    scene.add(auraMesh);

    // --- 6. PROCEDURAL 3D JIGSAW PUZZLE PIECES (REAL VOLUME, BEVELS & DEPTH) ---
    function createJigsawShape(type: number, size = 1.0) {
      const shape = new THREE.Shape();
      const s = size * 0.5;
      const tabR = size * 0.19;

      shape.moveTo(-s, -s);

      // Bottom edge: tab or blank based on type
      if (type === 0 || type === 1) {
        shape.lineTo(-tabR, -s);
        shape.bezierCurveTo(-tabR, -s - tabR * 1.25, tabR, -s - tabR * 1.25, tabR, -s);
      } else {
        shape.lineTo(-tabR, -s);
        shape.bezierCurveTo(-tabR, -s + tabR * 1.15, tabR, -s + tabR * 1.15, tabR, -s);
      }
      shape.lineTo(s, -s);

      // Right edge: blank or tab
      if (type === 1 || type === 2) {
        shape.lineTo(s, -tabR);
        shape.bezierCurveTo(s + tabR * 1.25, -tabR, s + tabR * 1.25, tabR, s, tabR);
      } else {
        shape.lineTo(s, -tabR);
        shape.bezierCurveTo(s - tabR * 1.15, -tabR, s - tabR * 1.15, tabR, s, tabR);
      }
      shape.lineTo(s, s);

      // Top edge: tab
      shape.lineTo(tabR, s);
      shape.bezierCurveTo(tabR, s + tabR * 1.25, -tabR, s + tabR * 1.25, -tabR, s);
      shape.lineTo(-s, s);

      // Left edge: blank or smooth
      if (type === 3) {
        shape.lineTo(-s, -s); // Flat edge for corner piece
      } else {
        shape.lineTo(-s, tabR);
        shape.bezierCurveTo(-s + tabR * 1.15, tabR, -s + tabR * 1.15, -tabR, -s, -tabR);
        shape.lineTo(-s, -s);
      }

      return shape;
    }

    // Extrusion settings for deep 3D volume and beveled specular highlights
    const extrudeSettings = {
      steps: 1,
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 4,
    };

    const puzzleGeometries = [
      new THREE.ExtrudeGeometry(createJigsawShape(0), extrudeSettings).center(),
      new THREE.ExtrudeGeometry(createJigsawShape(1), extrudeSettings).center(),
      new THREE.ExtrudeGeometry(createJigsawShape(2), extrudeSettings).center(),
      new THREE.ExtrudeGeometry(createJigsawShape(3), extrudeSettings).center(),
    ];

    // Emotional Palette: Esperança, Acolhimento, Amor, Família, Gratidão, Potencial
    const piecePalettes = [
      { color: 0xffb703, name: 'Esperança', glow: 0xffd166 },
      { color: 0x48cae4, name: 'Acolhimento', glow: 0x90e0ef },
      { color: 0x06d6a0, name: 'Amor', glow: 0x70e000 },
      { color: 0xff70a6, name: 'Família', glow: 0xff9770 },
      { color: 0x9d4edd, name: 'Gratidão', glow: 0xc77dff },
      { color: 0x3a86ff, name: 'Potencial', glow: 0x00b4d8 },
    ];

    interface PuzzleEntity {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      floatFreq: number;
      floatAmp: number;
      orbitSpeed: number;
      orbitAngle: number;
      orbitRadius: number;
      targetDepthZ: number;
      isForeground: boolean;
      tier: 'ground' | 'spiral' | 'foreground';
    }

    const puzzleEntities: PuzzleEntity[] = [];
    const puzzleGroup = new THREE.Group();
    scene.add(puzzleGroup);

    // --- A. Spiral Vortex (30 pieces in true 3D coordinates around the boy) ---
    const spiralCount = 30;
    for (let i = 0; i < spiralCount; i++) {
      const geo = puzzleGeometries[i % puzzleGeometries.length];
      const pal = piecePalettes[i % piecePalettes.length];

      const mat = new THREE.MeshPhysicalMaterial({
        color: pal.color,
        roughness: 0.22,
        metalness: 0.08,
        transmission: 0.28,
        transparent: true,
        opacity: 0.94,
        clearcoat: 0.85,
        clearcoatRoughness: 0.15,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const scale = 0.65 + Math.random() * 0.45;
      mesh.scale.set(scale, scale, scale);

      // Logarithmic ascending spiral in 3D:
      // t ranges from 0 (ground) to 1 (high sky)
      const t = i / spiralCount;
      const angle = t * Math.PI * 4.5 + Math.random() * 0.4;
      const radius = 2.8 + t * 4.2;
      const posX = Math.cos(angle) * radius;
      const posY = -3.8 + t * 9.2 + (Math.random() - 0.5) * 0.8;
      // True depth Z: passes both in FRONT of boy (z > 0.8) and BEHIND boy (z < -0.8)
      const depthZ = Math.sin(angle) * 3.6 + (Math.random() - 0.5) * 1.5;

      mesh.position.set(posX, posY, depthZ);
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      puzzleGroup.add(mesh);

      puzzleEntities.push({
        mesh,
        basePos: mesh.position.clone(),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.018,
          (Math.random() - 0.5) * 0.022,
          (Math.random() - 0.5) * 0.016
        ),
        floatFreq: 1.0 + Math.random() * 1.2,
        floatAmp: 0.35 + Math.random() * 0.25,
        orbitSpeed: (0.04 + Math.random() * 0.06) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: angle,
        orbitRadius: radius,
        targetDepthZ: depthZ,
        isForeground: false,
        tier: 'spiral',
      });
    }

    // --- B. Foreground Depth Framing Pieces (Close to camera, z = 7..9) ---
    const fgCoords = [
      { x: -5.2, y: -2.2, z: 8.5, color: 0xffb703, scale: 1.3 },
      { x: 5.5, y: 3.2, z: 7.8, color: 0x48cae4, scale: 1.2 },
      { x: -4.8, y: 3.8, z: 8.0, color: 0xff70a6, scale: 1.1 },
    ];

    fgCoords.forEach((cfg, idx) => {
      const geo = puzzleGeometries[(idx + 1) % puzzleGeometries.length];
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.35,
        transparent: true,
        opacity: 0.88,
        clearcoat: 0.9,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(cfg.scale, cfg.scale, cfg.scale);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.set(0.3, 0.4, 0.2);
      puzzleGroup.add(mesh);

      puzzleEntities.push({
        mesh,
        basePos: mesh.position.clone(),
        rotSpeed: new THREE.Vector3(0.006, 0.008, 0.004),
        floatFreq: 0.7,
        floatAmp: 0.2,
        orbitSpeed: 0.02,
        orbitAngle: idx * 2,
        orbitRadius: 6,
        targetDepthZ: cfg.z,
        isForeground: true,
        tier: 'foreground',
      });
    });

    // --- C. Ground Slabs / Paving Puzzle Pieces ---
    for (let i = 0; i < 8; i++) {
      const geo = puzzleGeometries[i % puzzleGeometries.length];
      const pal = piecePalettes[i % piecePalettes.length];
      const mat = new THREE.MeshStandardMaterial({
        color: pal.color,
        roughness: 0.4,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(0.7, 0.7, 0.7);
      const angle = (i / 8) * Math.PI * 2 + 0.3;
      const rad = 2.5 + Math.random() * 2.2;
      mesh.position.set(Math.cos(angle) * rad, -4.38, Math.sin(angle) * rad);
      mesh.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.1, 0, Math.random() * Math.PI);
      puzzleGroup.add(mesh);

      puzzleEntities.push({
        mesh,
        basePos: mesh.position.clone(),
        rotSpeed: new THREE.Vector3(0, (Math.random() - 0.5) * 0.004, 0),
        floatFreq: 0.6,
        floatAmp: 0.08,
        orbitSpeed: 0,
        orbitAngle: angle,
        orbitRadius: rad,
        targetDepthZ: mesh.position.z,
        isForeground: false,
        tier: 'ground',
      });
    }

    // --- 7. 3D IRIDESCENT BUTTERFLIES (AS IN THE REFERENCE ARTWORK) ---
    interface ButterflyEntity {
      group: THREE.Group;
      leftWing: THREE.Mesh;
      rightWing: THREE.Mesh;
      orbitAngle: number;
      orbitSpeed: number;
      orbitRadius: number;
      heightBase: number;
      wingFlapSpeed: number;
    }

    const butterflies: ButterflyEntity[] = [];
    const butterflyGroup = new THREE.Group();
    scene.add(butterflyGroup);

    function createButterflyWingGeo() {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.2, 0.4, 0.7, 0.8, 0.9, 0.6);
      shape.bezierCurveTo(1.1, 0.3, 0.9, 0.0, 0.5, -0.1);
      shape.bezierCurveTo(0.7, -0.5, 0.5, -0.7, 0.3, -0.6);
      shape.bezierCurveTo(0.1, -0.5, 0.05, -0.2, 0, 0);
      return new THREE.ShapeGeometry(shape);
    }

    const wingGeo = createButterflyWingGeo();
    const butterflyColors = [0x48cae4, 0xffd166, 0xff70a6, 0x06d6a0, 0xc77dff];

    for (let i = 0; i < 6; i++) {
      const bGroup = new THREE.Group();
      const col = butterflyColors[i % butterflyColors.length];

      const wingMat = new THREE.MeshPhysicalMaterial({
        color: col,
        transmission: 0.4,
        roughness: 0.2,
        clearcoat: 1.0,
        side: THREE.DoubleSide,
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.scale.set(0.65, 0.65, 0.65);
      bGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.scale.set(-0.65, 0.65, 0.65);
      bGroup.add(rightWing);

      const angle = (i / 6) * Math.PI * 2;
      const rad = 3.2 + Math.random() * 2.5;
      const hb = -1.5 + Math.random() * 4.5;
      bGroup.position.set(Math.cos(angle) * rad, hb, Math.sin(angle) * rad);

      butterflyGroup.add(bGroup);

      butterflies.push({
        group: bGroup,
        leftWing,
        rightWing,
        orbitAngle: angle,
        orbitSpeed: 0.12 + Math.random() * 0.1,
        orbitRadius: rad,
        heightBase: hb,
        wingFlapSpeed: 12 + Math.random() * 4,
      });
    }

    // --- 8. RISING STARDUST PARTICLES ---
    const pCount = 360;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    const pVelocities: { x: number; y: number; z: number; speed: number }[] = [];

    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 20;
      pPositions[i * 3 + 1] = -4.5 + Math.random() * 12;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      pVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: 0.012 + Math.random() * 0.02, // Gentle ascent
        z: (Math.random() - 0.5) * 0.008,
        speed: 0.8 + Math.random() * 0.6,
      });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.42,
      map: starTexture,
      transparent: true,
      opacity: 0.05, // Starts peaceful, awakens in 'particles'
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);

    // --- 9. 3D ORGANIC INFINITY LOOP (LEMNISCATA WEAVING AROUND THE BOY) ---
    // The curve wraps around the boy:
    // Left loop dips behind his back (z < 0)
    // Crosses at his heart
    // Right loop wraps in front of his open arms (z > 0)
    const infSamples = 200;
    const a = 4.8;
    const b = 3.6;
    const c = 2.4;

    function getInfinityPoint(t: number): THREE.Vector3 {
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (a * Math.cos(t)) / denom;
      const y = (b * Math.sin(t) * Math.cos(t)) / denom + 0.35;
      // True 3D depth weaving:
      const z = c * Math.sin(2 * t);
      return new THREE.Vector3(x, y, z);
    }

    // Dynamic Line & Ribbon for the Infinity
    const infPositions = new Float32Array(infSamples * 3);
    const infColors = new Float32Array(infSamples * 3);

    for (let i = 0; i < infSamples; i++) {
      const pt = getInfinityPoint(0);
      infPositions[i * 3] = pt.x;
      infPositions[i * 3 + 1] = pt.y;
      infPositions[i * 3 + 2] = pt.z;

      // Color transition from golden amber to celestial cyan
      const ratio = i / infSamples;
      infColors[i * 3] = 1.0; // R
      infColors[i * 3 + 1] = 0.85 + ratio * 0.15; // G
      infColors[i * 3 + 2] = 0.35 + ratio * 0.65; // B
    }

    const infGeo = new THREE.BufferGeometry();
    infGeo.setAttribute('position', new THREE.BufferAttribute(infPositions, 3));
    infGeo.setAttribute('color', new THREE.BufferAttribute(infColors, 3));

    const infMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      linewidth: 3,
      blending: THREE.AdditiveBlending,
    });
    const infLine = new THREE.Line(infGeo, infMat);
    scene.add(infLine);

    // Radiant Lead Orb
    const orbGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0xfff3b0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orbMesh);

    // Halo around orb
    const haloGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const haloMat = new THREE.MeshBasicMaterial({
      map: auraMat.map,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // --- 10. MOUSE & TOUCH PARALLAX INTERACTION ---
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = nx * 0.28;
      targetRotX = -ny * 0.18;
    };

    window.addEventListener('pointermove', handlePointerMove);

    // --- 11. MAIN ANIMATION LOOP & TIMELINE ---
    const clock = new THREE.Clock();
    let infinityProgress = 0;
    let portalExpansionScheduled = false;

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentPhase = phaseRef.current;

      // Smooth camera and group parallax
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      camera.position.x = currentRotY * 3.2;
      camera.position.y = 0.5 + currentRotX * 2.2;
      camera.lookAt(0, 0.4, 0);

      // Subtle breathing motion on the boy
      if (boyMesh) {
        boyMesh.position.y = 0.4 + Math.sin(elapsed * 1.3) * 0.06;
      }

      // --- Timeline Phase Management ---
      if (currentPhase === 'calm') {
        pMat.opacity = 0.1;
        infMat.opacity = 0;
        orbMat.opacity = 0;
        haloMat.opacity = 0;
        infinityLight.intensity = 0;
      } else if (currentPhase === 'particles') {
        // Particles awaken and float up
        pMat.opacity = Math.min(pMat.opacity + delta * 0.6, 0.85);
      } else if (currentPhase === 'floating') {
        // Pieces float with full volume & depth
        pMat.opacity = 0.9;
      } else if (currentPhase === 'infinity') {
        // Light draws the 3D infinity loop
        pMat.opacity = 0.95;
        infinityProgress = Math.min(infinityProgress + delta * 0.28, 1.0);
        setProgress(Math.round(infinityProgress * 100));

        const maxPoints = Math.floor(infinityProgress * infSamples);
        const posAttr = infGeo.attributes.position as THREE.BufferAttribute;
        const headT = infinityProgress * Math.PI * 2;
        const headPoint = getInfinityPoint(headT);

        for (let i = 0; i < infSamples; i++) {
          const t = (i / infSamples) * Math.PI * 2;
          if (i <= maxPoints) {
            const pt = getInfinityPoint(t);
            posAttr.setXYZ(i, pt.x, pt.y, pt.z);
          } else {
            posAttr.setXYZ(i, headPoint.x, headPoint.y, headPoint.z);
          }
        }
        posAttr.needsUpdate = true;

        infMat.opacity = Math.min(infMat.opacity + delta * 1.5, 0.98);
        orbMat.opacity = 1.0;
        haloMat.opacity = 0.85;

        orbMesh.position.copy(headPoint);
        haloMesh.position.copy(headPoint);
        infinityLight.position.copy(headPoint);
        infinityLight.intensity = 4.0;

        // When complete, transition smoothly into portal expansion
        if (infinityProgress >= 1.0 && currentPhase === 'infinity' && !portalExpansionScheduled) {
          portalExpansionScheduled = true;
          setTimeout(() => {
            setPhase('portal');
            if (!soundMutedRef.current) {
              playPortalExpansionSound();
            }
          }, 800);
        }
      } else if (currentPhase === 'portal') {
        // Warm light expands smoothly as a portal into the app
        infinityLight.intensity += delta * 18;
        infMat.opacity = Math.max(infMat.opacity - delta * 0.4, 0);
        camera.position.z -= delta * 4.8; // Camera smoothly flies forward into the light

        if (camera.position.z <= 6.0) {
          setPhase('completed');
          onEnterApp();
        }
      }

      // --- Update 3D Puzzle Pieces ---
      puzzleEntities.forEach((p, idx) => {
        if (currentPhase !== 'calm') {
          p.mesh.rotation.x += p.rotSpeed.x;
          p.mesh.rotation.y += p.rotSpeed.y;
          p.mesh.rotation.z += p.rotSpeed.z;

          // Organic bobbing in 3D
          const bob = Math.sin(elapsed * p.floatFreq + idx * 0.5) * p.floatAmp;
          p.mesh.position.y = p.basePos.y + bob;

          if (p.tier === 'spiral') {
            const orbit = p.orbitAngle + elapsed * p.orbitSpeed;
            p.mesh.position.x = Math.cos(orbit) * p.orbitRadius;
            p.mesh.position.z = p.targetDepthZ + Math.sin(orbit) * 0.8;
          }
        } else {
          // In calm state, gentle micro-float
          p.mesh.position.y = p.basePos.y + Math.sin(elapsed * 0.8 + idx) * 0.04;
        }
      });

      // --- Update Butterflies ---
      butterflies.forEach((bf) => {
        const flap = Math.sin(elapsed * bf.wingFlapSpeed) * 0.75;
        bf.leftWing.rotation.y = flap;
        bf.rightWing.rotation.y = -flap;

        if (currentPhase !== 'calm') {
          bf.orbitAngle += delta * bf.orbitSpeed;
          bf.group.position.x = Math.cos(bf.orbitAngle) * bf.orbitRadius;
          bf.group.position.z = Math.sin(bf.orbitAngle) * (bf.orbitRadius * 0.85);
          bf.group.position.y = bf.heightBase + Math.sin(elapsed * 2.0 + bf.orbitAngle) * 0.6;
          bf.group.rotation.y = -bf.orbitAngle + Math.PI / 2;
        }
      });

      // --- Update Stardust Particles ---
      const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pCount; i++) {
        let py = posAttr.getY(i);
        py += pVelocities[i].y;
        if (py > 11) py = -4.5;
        posAttr.setY(i, py);

        let px = posAttr.getX(i);
        px += pVelocities[i].x;
        posAttr.setX(i, px);
      }
      posAttr.needsUpdate = true;

      // Render Scene
      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Sequence Director (Quase estático -> Partículas -> Flutuação 3D -> Infinito -> Portal)
    const timers: NodeJS.Timeout[] = [];
    if (autoStart) {
      // 1. Quase estático (0s to 2.2s)
      timers.push(
        setTimeout(() => {
          setPhase('particles');
          if (!soundMutedRef.current) playWarmChime(440, 1.6, 0.05);
        }, 2200)
      );

      // 2. Levitação & profundidade 3D (4.4s)
      timers.push(
        setTimeout(() => {
          setPhase('floating');
          if (!soundMutedRef.current) playWarmChime(554.37, 1.8, 0.06);
        }, 4400)
      );

      // 3. O Fluxo de Luz e a Criação do Infinito (6.8s)
      timers.push(
        setTimeout(() => {
          setPhase('infinity');
          if (!soundMutedRef.current) playInfinityTone();
        }, 6800)
      );
    }

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      timers.forEach(clearTimeout);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const manualStart = () => {
    setPhase('particles');
    if (!soundMuted) playWarmChime(440, 1.6, 0.05);

    setTimeout(() => {
      setPhase('floating');
      if (!soundMutedRef.current) playWarmChime(554.37, 1.8, 0.06);
    }, 1800);

    setTimeout(() => {
      setPhase('infinity');
      if (!soundMutedRef.current) playInfinityTone();
    }, 3800);
  };

  return (
    <div
      id="portal-cinematic-wrapper"
      className="fixed inset-0 z-50 bg-[#060919] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Three.js 3D Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-transparent to-[#040611]/85" />

      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center backdrop-blur-md shadow-xs">
            <DynamicIcon name="Sparkles" className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-amber-200">
              Ambiente 3D Integrado
            </span>
            <p className="text-[10px] text-slate-300 hidden sm:block">
              Cada mente tem seu próprio universo de infinitas possibilidades
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition backdrop-blur-md text-xs flex items-center gap-1.5"
            title={soundMuted ? 'Ativar harmonia suave' : 'Silenciar áudio'}
          >
            <DynamicIcon name={soundMuted ? 'VolumeX' : 'Volume2'} className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">
              {soundMuted ? 'Mudo' : 'Som suave'}
            </span>
          </button>

          {/* Skip directly into application */}
          <button
            onClick={onEnterApp}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition backdrop-blur-md flex items-center gap-1.5 shadow-sm"
          >
            <span>Entrar no aplicativo</span>
            <DynamicIcon name="ChevronRight" className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bottom Subtitles, Emotion Badges & Progress */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-7 px-4 pointer-events-none">
        {/* Value Badges: Amor, Família, Acolhimento, Esperança, Gratidão */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {[
            { word: 'Amor', color: 'border-emerald-400/40 text-emerald-200 bg-emerald-950/40' },
            { word: 'Acolhimento', color: 'border-sky-400/40 text-sky-200 bg-sky-950/40' },
            { word: 'Família', color: 'border-rose-400/40 text-rose-200 bg-rose-950/40' },
            { word: 'Esperança', color: 'border-amber-400/40 text-amber-200 bg-amber-950/40' },
            { word: 'Gratidão', color: 'border-purple-400/40 text-purple-200 bg-purple-950/40' },
          ].map((item, idx) => (
            <span
              key={item.word}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-700 ${
                item.color
              } ${
                phase === 'calm'
                  ? 'opacity-45 translate-y-1'
                  : 'opacity-100 translate-y-0 shadow-md'
              }`}
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              • {item.word}
            </span>
          ))}
        </div>

        {/* Phase Narrative Subtitles */}
        <div className="text-center max-w-lg mx-auto space-y-2">
          {phase === 'calm' && (
            <div className="space-y-3">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                O infinito universo de {childName}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
                Um ambiente 3D onde cada detalhe é acolhido com respeito, afeto e possibilidades.
              </p>
              <div className="pt-1 pointer-events-auto flex items-center justify-center gap-2">
                <button
                  onClick={manualStart}
                  className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <DynamicIcon name="Sparkles" className="w-4 h-4 text-slate-900" />
                  <span>Acelerar Jornada 3D</span>
                </button>
              </div>
            </div>
          )}

          {phase === 'particles' && (
            <div className="space-y-1 animate-fadeIn">
              <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">
                1. Despertar da Luz
              </span>
              <p className="text-xs sm:text-sm text-slate-200">
                Partículas de acolhimento e calor sobem suavemente pelo espaço...
              </p>
            </div>
          )}

          {phase === 'floating' && (
            <div className="space-y-1 animate-fadeIn">
              <span className="text-[11px] uppercase tracking-widest text-sky-300 font-bold">
                2. Profundidade Real & Flutuação
              </span>
              <p className="text-xs sm:text-sm text-slate-200">
                Peças com volume e bordas tridimensionais encontram harmonia em diferentes planos.
              </p>
            </div>
          )}

          {phase === 'infinity' && (
            <div className="space-y-1 animate-fadeIn">
              <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold flex items-center justify-center gap-1.5">
                <DynamicIcon name="Sparkles" className="w-3.5 h-3.5" />
                <span>3. O Símbolo do Infinito (∞)</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-100 font-medium">
                O fluxo de luz envolve o menino e tece o infinito particular de sua mente.
              </p>
              {/* Progress bar */}
              <div className="w-44 h-1.5 bg-white/15 rounded-full mx-auto overflow-hidden mt-2">
                <div
                  className="h-full bg-linear-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {phase === 'portal' && (
            <div className="space-y-1 animate-fadeIn">
              <h2 className="text-base font-bold text-amber-200">
                Entrando no Meu Mundo...
              </h2>
              <p className="text-xs text-slate-300">
                A luz se expande como um portal acolhedor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Drag & Parallax Hint */}
      <footer className="relative z-20 pb-4 text-center pointer-events-none">
        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1.5 bg-black/40 px-3.5 py-1 rounded-full border border-white/10 backdrop-blur-xs">
          <DynamicIcon name="Move" className="w-3.5 h-3.5 text-amber-300" />
          <span>Mova o mouse ou incline o aparelho para explorar a profundidade tridimensional</span>
        </span>
      </footer>

      {/* Smooth Warm Transition Bloom Layer */}
      {phase === 'portal' && (
        <div className="absolute inset-0 bg-linear-to-t from-amber-100 via-white to-amber-50 pointer-events-none transition-opacity duration-1000 opacity-90" />
      )}
    </div>
  );
};
