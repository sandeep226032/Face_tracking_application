'use client';
import { useRef, useState,useEffect } from "react";
import  '@mediapipe/face_mesh';
import  '@mediapipe/camera_utils';



export default function Home() {
   const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const [play,setplay]=useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
     async function loadMediaPipe() {
       const [{ FaceMesh }, { Camera }] = await Promise.all([
      import('@mediapipe/face_mesh'),
      import('@mediapipe/camera_utils'),
    ]);
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          for (const point of landmarks) {
            ctx.beginPath();
            ctx.arc(point.x * canvas.width, point.y * canvas.height, 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        }
      }
    });

    if (typeof window !== 'undefined') {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }
  loadMediaPipe();
   
  }, []);
  
  
  const startrecording=()=>{
     if(play){
  //  const stream=videoRef.current.srcObject;
  const stream= canvasRef.current.captureStream();
   const mediaRecorder = new MediaRecorder(stream);
    const chunks=[];
    mediaRecorder.ondataavailable=(e)=>chunks.push(e.data);   
    mediaRecorder.onstop=()=>{
     const blob = new Blob(chunks, { type: 'video/webm' });
    
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('savedVideo', reader.result); 
        setVideoUrl(reader.result); 
      };
      reader.readAsDataURL(blob);
    
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setplay(!play)
  }else{
       mediaRecorderRef.current.stop();
       setplay(!play)
  }

  }
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('savedVideo');
    if (saved) setVideoUrl(saved);
  };
  return (
    <div className="flex items-center justify-center h-screen ">
      <video ref={videoRef} autoPlay className="hidden" />
        
      <button onClick={startrecording}
  className="px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4 
             bg-gradient-to-r from-indigo-500 to-purple-500 
             text-white text-sm sm:text-base md:text-lg 
             font-semibold rounded-full 
             shadow-md hover:shadow-lg 
             transition duration-300 hover:scale-105 
             m-2  sm:m-4"
>
    {play ? 'Start Recording' : 'Stop Recording'}
</button>
 
      <canvas ref={canvasRef} width="640" height="480" className=" h-auto" />


    </div>
  );
}
