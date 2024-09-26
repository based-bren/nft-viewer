'use client'

import { useState, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const contractAddress = '0x1f7979C368c82dc647E075FfD61ed149052e3D6B';
const rpcUrl = 'https://base.meowrpc.com';

export default function SynthwaveNftViewer() {
  const [tokenId, setTokenId] = useState('')
  const [status, setStatus] = useState('')
  const svgRef = useRef<HTMLDivElement>(null)

  const fetchAndDisplaySVG = async () => {
    setStatus('Fetching data...')
    if (svgRef.current) svgRef.current.innerHTML = ''

    try {
      const data = {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: contractAddress,
          data: `0xc87b56dd${parseInt(tokenId).toString(16).padStart(64, '0')}`
        }, 'latest']
      };

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      setStatus('Decoding data...');
      const cleanedHex = result.result.slice(2);
      const length = parseInt(cleanedHex.slice(64, 128), 16);
      const dataHex = cleanedHex.slice(128, 128 + length * 2);

      let tokenURI = '';
      for (let i = 0; i < dataHex.length; i += 2) {
        tokenURI += String.fromCharCode(parseInt(dataHex.slice(i, i + 2), 16));
      }

      if (!tokenURI.startsWith('data:application/json;base64,')) {
        throw new Error('Unexpected tokenURI format');
      }

      const jsonData = atob(tokenURI.split(',')[1]);
      const metadata = JSON.parse(jsonData);

      if (metadata.image) {
        const svgimg = atob(metadata.image.replace(/data:image\/svg\+xml;base64,/, ''));
        if (svgRef.current) {
          svgRef.current.innerHTML = svgimg;
        }
        setStatus('Pepe displayed successfully!');
      } else {
        setStatus('No image data found.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-orange-600 text-white p-4 font-['Orbitron'] flex flex-col synthwave-bg">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

        .synthwave-bg {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .neon-text {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de, 0 0 75px #ff00de;
        }

        .neon-border {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de, 0 0 75px #ff00de;
        }

        .svg-container {
          display: inline-block;
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          vertical-align: middle;
          overflow: hidden;
        }

        .svg-content {
          display: inline-block;
          position: absolute;
          top: 0;
          left: 0;
          max-width: 100%;
          max-height: 100%;
          image-rendering: pixelated;
        }

        /* Apply the same styles to the inner SVG content */
        .svg-content svg,
        .svg-content img {
          image-rendering: pixelated;
        }
      `}</style>

      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-4xl mb-4 text-center text-white neon-text">HAM PEPE VIEWER</h1>
        
        <Card className="mb-8 bg-black bg-opacity-50 neon-border rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white neon-text">ENTER TOKEN ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="TOKEN ID"
                className="bg-purple-900 border-pink-500 text-white placeholder-pink-300 rounded"
              />
              <Button onClick={fetchAndDisplaySVG} className="bg-pink-600 hover:bg-pink-500 text-white neon-border rounded">SHOW ME THE FROG</Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-8">{status}</div>

        <Card className="mt-8 bg-black bg-opacity-50 neon-border rounded-lg">
          <CardContent className="p-0">
            <div className="bg-purple-900 neon-border rounded overflow-hidden w-full h-full" style={{maxWidth: '680px', maxHeight: '680px', margin: '0 auto', aspectRatio: '1 / 1'}}>
              <div className="svg-container">
                <svg width="100%" height="100%" viewBox="0 0 640 640" preserveAspectRatio="xMidYMid meet" className="svg-content">
                  <g>
                    <foreignObject width="640" height="640">
                      <div ref={svgRef} style={{
                        width: '100%',
                        height: '100%',
                        imageRendering: 'crisp-edges',
                        ['msInterpolationMode' as string]: 'nearest-neighbor',
                  
                      }}></div>
                    </foreignObject>
                  </g>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-auto pt-8 pb-4">
        <div className="flex justify-center space-x-6">
          <a href="https://twitter.com/BrenOfTheGlen" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://warpcast.com/based-bren" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1000 1000" fill="currentColor" className="w-6 h-6">
              <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/>
              <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
              <path d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
            </svg>
          </a>
          <a href="https://opensea.io/collection/ham-pepes" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" fill="currentColor" className="w-6 h-6">
              <path d="M45 0C20.151 0 0 20.151 0 45C0 69.849 20.151 90 45 90C69.849 90 90 69.849 90 45C90 20.151 69.858 0 45 0ZM22.203 46.512L22.392 46.206L34.101 27.891C34.272 27.63 34.677 27.657 34.803 27.945C36.756 32.328 38.448 37.782 37.656 41.175C37.323 42.57 36.396 44.46 35.352 46.206C35.217 46.458 35.073 46.71 34.911 46.953C34.839 47.061 34.713 47.124 34.578 47.124H22.545C22.221 47.124 22.032 46.773 22.203 46.512ZM74.376 52.812C74.376 52.983 74.277 53.127 74.133 53.19C73.224 53.577 70.119 55.008 68.832 56.799C65.538 61.38 63.027 67.932 57.402 67.932H33.948C25.632 67.932 18.9 61.173 18.9 52.83V52.56C18.9 52.344 19.08 52.164 19.305 52.164H32.373C32.634 52.164 32.823 52.398 32.805 52.659C32.706 53.505 32.868 54.378 33.273 55.17C34.047 56.745 35.658 57.726 37.395 57.726H43.866V52.677H37.467C37.143 52.677 36.945 52.299 37.134 52.029C37.206 51.921 37.278 51.813 37.368 51.687C37.971 50.823 38.835 49.491 39.699 47.97C40.284 46.944 40.851 45.846 41.31 44.748C41.4 44.55 41.472 44.343 41.553 44.145C41.679 43.794 41.805 43.461 41.895 43.137C41.985 42.858 42.066 42.57 42.138 42.3C42.354 41.364 42.444 40.374 42.444 39.348C42.444 38.943 42.426 38.52 42.39 38.124C42.372 37.683 42.318 37.242 42.264 36.801C42.228 36.414 42.156 36.027 42.084 35.631C41.985 35.046 41.859 34.461 41.715 33.876L41.661 33.651C41.553 33.246 41.454 32.868 41.328 32.463C40.959 31.203 40.545 29.97 40.095 28.818C39.933 28.359 39.753 27.918 39.564 27.486C39.294 26.82 39.015 26.217 38.763 25.65C38.628 25.389 38.52 25.155 38.412 24.912C38.286 24.642 38.16 24.372 38.025 24.111C37.935 23.913 37.827 23.724 37.755 23.544L36.963 22.086C36.855 21.888 37.035 21.645 37.251 21.708L42.201 23.049H42.219C42.228 23.049 42.228 23.049 42.237 23.049L42.885 23.238L43.605 23.436L43.866 23.508V20.574C43.866 19.152 45 18 46.413 18C47.115 18 47.754 18.288 48.204 18.756C48.663 19.224 48.951 19.863 48.951 20.574V24.939L49.482 25.083C49.518 25.101 49.563 25.119 49.599 25.146C49.725 25.236 49.914 25.38 50.148 25.56C50.337 25.704 50.535 25.884 50.769 26.073C51.246 26.46 51.822 26.955 52.443 27.522C52.605 27.666 52.767 27.81 52.92 27.963C53.721 28.71 54.621 29.583 55.485 30.555C55.728 30.834 55.962 31.104 56.205 31.401C56.439 31.698 56.7 31.986 56.916 32.274C57.213 32.661 57.519 33.066 57.798 33.489C57.924 33.687 58.077 33.894 58.194 34.092C58.554 34.623 58.86 35.172 59.157 35.721C59.283 35.973 59.409 36.252 59.517 36.522C59.85 37.26 60.111 38.007 60.273 38.763C60.327 38.925 60.363 39.096 60.381 39.258V39.294C60.435 39.51 60.453 39.744 60.471 39.987C60.543 40.752 60.507 41.526 60.345 42.3C60.273 42.624 60.183 42.93 60.075 43.263C59.958 43.578 59.85 43.902 59.706 44.217C59.427 44.856 59.103 45.504 58.716 46.098C58.59 46.323 58.437 46.557 58.293 46.782C58.131 47.016 57.96 47.241 57.816 47.457C57.609 47.736 57.393 48.024 57.168 48.285C56.97 48.555 56.772 48.825 56.547 49.068C56.241 49.437 55.944 49.779 55.629 50.112C55.449 50.328 55.251 50.553 55.044 50.751C54.846 50.976 54.639 51.174 54.459 51.354C54.144 51.669 53.892 51.903 53.676 52.11L53.163 52.569C53.091 52.641 52.992 52.677 52.893 52.677H48.951V57.726H53.91C55.017 57.726 56.07 57.339 56.925 56.61C57.213 56.358 58.482 55.26 59.985 53.604C60.039 53.541 60.102 53.505 60.174 53.487L73.863 49.527C74.124 49.455 74.376 49.644 74.376 49.914V52.812V52.812Z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}