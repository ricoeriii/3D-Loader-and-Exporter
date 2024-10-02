import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

'use client'
import { Suspense, useDeferredValue, useRef, useLayoutEffect } from 'react'
import { Canvas,useLoader } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'
import { useControls } from 'leva'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import tunnel from 'tunnel-rat'

const status = tunnel()

const MODELS = {
  Hand: 'http://localhost:5173/models/hand.obj',
  Arm: 'http://localhost:5173/models/arm.obj',
  Foot: 'http://localhost:5173/models/feet.obj',
  Protohand: 'http://localhost:5173/models/protohand.obj'
}

export default function App() {
  const { model } = useControls({ model: { value: 'Hand', options: Object.keys(MODELS) } })
  const { color } = useControls({ color: "#f00" });
  const x = useControls({ x: 1 })
  const y = useControls({ y: 1 })
  const z = useControls({ z: 1 })
  const ScaleXYZ = [x.x, y.y, z.z]

  const Scene = ({ url, color, ...props }) => {
    const deferred = useDeferredValue(url)
    const obj = useLoader(OBJLoader, deferred);
    useLayoutEffect(() => {
      obj.traverse(child => {
        if (child.isMesh) {
          child.material.color.set(color)
        }
      })
    }, [color])
  
    return (
      <Center back precise>
        <primitive object={obj} {...props} />
      </Center>
    );
  };

  const canvasRef = useRef(null);

  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);

  function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  function saveString(text, filename) {
    save(new Blob([text], { type: "text/plain" }), filename);
  }

  const handleExportGLTF = () => {
    const exporter = new GLTFExporter();
    exporter.parse(canvasRef.current, function (gltfJson) {
      const jsonString = JSON.stringify(gltfJson);
      const blob = new Blob([jsonString], { type: "application/json" });
      saveString(blob, `${model}_${Date.now()}.gltf`);
      console.log("Download requested");
    }, { binary: true});
  };
  const handleExportOBJ = () => {
    const exporter = new OBJExporter();
    const result = exporter.parse(canvasRef.current);
    console.log(result)
    saveString(result, `${model}_${Date.now()}.obj`);
  };

  return (
    <>
    <div className="card   w-3/5 h-5/6 shadow-xl flex-auto relative top-10 text-center bg-slate-300">
      <figure className='h-full'>
        <Canvas>
        <ambientLight intensity={3.14} />
        <spotLight position={[0, 0, 0]} angle={0.5} penumbra={1} decay={0} intensity={0} shadow-mapSize={256} castShadow />
          <group ref={canvasRef}>
            <Suspense fallback={<status.In>Loading ...</status.In>}>
              <Scene scale={ScaleXYZ} url={MODELS[model]} color={color} />
            </Suspense>
          </group>
          <OrbitControls />
        </Canvas>
      </figure>
      <div className="card-body">
        <button className="btn btn-primary" onClick={handleExportGLTF}>Export 3D Object (.GLTF)</button>
        <button className="btn btn-primary" onClick={handleExportOBJ}>Export 3D Object (.OBJ)</button>
      </div>
    </div>
    </>
  )
}
