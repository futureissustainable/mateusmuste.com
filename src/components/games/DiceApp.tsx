import { useState, useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { sounds } from '@/lib/audio';

interface DiceAppProps {
  onAchievement?: (id: string) => void;
}

export const DiceApp = memo(({ onAchievement }: DiceAppProps) => {
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [, setRollCount] = useState(0);
  const isRollingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer } | null>(null);
  const diceRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number>(0);
  const consecutiveTwenties = useRef(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return;

    const width = 200;
    const height = 200;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-2, -2, -2);
    scene.add(backLight);

    // D20 (Icosahedron)
    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.4,
      flatShading: true
    });
    const dice = new THREE.Mesh(geometry, material);
    scene.add(dice);

    // Edge lines
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    dice.add(wireframe);

    diceRef.current = dice;
    sceneRef.current = { scene, camera, renderer };

    // Initial render
    renderer.render(scene, camera);

    // Idle animation
    const idleAnimate = () => {
      if (!isRollingRef.current) {
        dice.rotation.x += 0.003;
        dice.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(idleAnimate);
    };
    idleAnimate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const rollDice = () => {
    if (isRolling || !diceRef.current || !sceneRef.current) return;
    setIsRolling(true);
    isRollingRef.current = true;
    setResult(null);
    sounds.diceRoll();

    const dice = diceRef.current;
    const { renderer, scene, camera } = sceneRef.current;

    // Random target rotation
    const targetRotX = dice.rotation.x + Math.PI * (4 + Math.random() * 4);
    const targetRotY = dice.rotation.y + Math.PI * (4 + Math.random() * 4);
    const targetRotZ = dice.rotation.z + Math.PI * (2 + Math.random() * 2);

    const startRotX = dice.rotation.x;
    const startRotY = dice.rotation.y;
    const startRotZ = dice.rotation.z;

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing - decelerate
      const eased = 1 - Math.pow(1 - progress, 3);

      dice.rotation.x = startRotX + (targetRotX - startRotX) * eased;
      dice.rotation.y = startRotY + (targetRotY - startRotY) * eased;
      dice.rotation.z = startRotZ + (targetRotZ - startRotZ) * eased;

      renderer.render(scene, camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // After 5 rolls, automatically give a 20
        setRollCount(prev => {
          const newCount = prev + 1;
          const roll = newCount >= 5 ? 20 : Math.floor(Math.random() * 20) + 1;
          setResult(roll);
          setIsRolling(false);
          isRollingRef.current = false;

          if (roll === 20) {
            sounds.diceCrit20();
            consecutiveTwenties.current++;
            onAchievement?.('DIVINE_ROLL');
            if (consecutiveTwenties.current >= 3) {
              onAchievement?.('IMPOSSIBLE');
            }
          } else if (roll === 1) {
            sounds.diceCrit1();
            consecutiveTwenties.current = 0;
          } else {
            consecutiveTwenties.current = 0;
          }
          return newCount;
        });
      }
    };

    animate();
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-white">
        <div className="mb-4" ref={containerRef} style={{ width: 200, height: 200 }} />
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="bg-black text-white px-6 py-2 font-mono text-[10px] tracking-widest hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
        >
          {isRolling ? 'ROLLING' : 'ROLL'}
        </button>
        <div className="h-12 flex items-center justify-center mt-4">
          {result && !isRolling && (
            <div className="font-mono text-[10px] tracking-widest text-center">
              {result === 20 ? '20 SUDO BECOME GOD' : result === 1 ? '1 USELESS' : `RESULT: ${result}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DiceApp.displayName = 'DiceApp';

export default DiceApp;
