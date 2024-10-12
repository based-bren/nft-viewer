'use client'

import Link from 'next/link'
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from 'next/image'

const TRAIT_ORDER = ['Skin', 'Pants', 'Shirt', 'Eyes', 'Hat', 'Special']
const BACKGROUND_COLORS = ['Blue', 'Green', 'Grey', 'Mint', 'Pink', 'Purple', 'Yellow', 'Transparent']

interface Trait {
  trait_type: string;
  value: string;
}

export default function DripNftViewer() {
  const [tokenId, setTokenId] = useState('')
  const [traits, setTraits] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [useHamHat, setUseHamHat] = useState(false)
  const [useGham, setUseGham] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedBackground, setSelectedBackground] = useState('Green');

  const fetchNftData = async () => {
    setIsLoading(true)
    setError('')
    setTraits({})
    setImageUrl('')

    try {
      const response = await fetch(`/api/nft/${tokenId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch NFT data')
      }

      const data = await response.json()
      console.log('NFT data:', data)
      const traitObject: Record<string, string> = {}
      data.nft.traits.forEach((trait: Trait) => {
        traitObject[trait.trait_type] = trait.value
      })
      console.log('Traits:', traitObject)
      setTraits(traitObject)
    } catch (err) {
      setError('Error fetching NFT data. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Traits changed:', traits)
    if (Object.keys(traits).length > 0) {
      generateImage()
    }
  }, [traits, useHamHat, useGham, selectedBackground])

  const generateImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load and draw the background
    if (selectedBackground !== 'Transparent') {
      await drawImage(ctx, `/traits/Back/${selectedBackground}.png`)
    }

    // Load and draw the base
    await drawImage(ctx, '/traits/Skin/Base.png')

    // Draw trait layers in order
    for (const traitType of TRAIT_ORDER) {
      if (traitType === 'Hat' && useHamHat) {
        await drawImage(ctx, '/traits/Hat/Ham hat.png')
      } else {
        const traitValue = traits[traitType]
        if (traitValue) {
          await drawImage(ctx, `/traits/${traitType}/${traitValue}.png`)
        }
      }
    }

    // If useHamHat is true and there was no original hat, add the ham hat
    if (useHamHat && !traits['Hat']) {
      await drawImage(ctx, '/traits/Hat/Ham hat.png')
    }

    // Add the G'ham layer if useGham is true
    if (useGham) {
      await drawImage(ctx, '/images/gham.png')
    }

    // Convert canvas to image URL
    const imageUrl = canvas.toDataURL('image/png')
    setImageUrl(imageUrl)
  }

  const drawImage = (ctx: CanvasRenderingContext2D, src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  const toggleHamHat = () => {
    setUseHamHat(!useHamHat)
  }

  const toggleGham = () => {
    setUseGham(!useGham)
  }

  const downloadPng = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `ham_pepe_${tokenId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const ColorButton = ({ color, isSelected, onClick }: { color: string; isSelected: boolean; onClick: () => void }) => (
    <button
      className={`w-8 h-8 border-2 ${isSelected ? 'border-white' : 'border-transparent'} relative flex items-center justify-center`}
      style={{ 
        backgroundColor: color === 'Transparent' ? 'transparent' : 
                         color === 'Mint' ? '#98ff98' : color.toLowerCase(),
        boxShadow: `0 0 10px 2px ${color === 'Transparent' ? 'rgba(255, 255, 255, 0.5)' : 
                                   color === 'Mint' ? '#98ff98' : color.toLowerCase()}`,
      }}
      onClick={onClick}
    >
      {color === 'Transparent' && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-200"></span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-violet-600 text-white p-4 font-['Orbitron'] flex flex-col drip-bg">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

        .drip-bg {
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .neon-text {
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #8b00ff, 0 0 35px #8b00ff, 0 0 40px #8b00ff, 0 0 50px #8b00ff, 0 0 75px #8b00ff;
        }

        .neon-border {
          box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #8b00ff, 0 0 35px #8b00ff, 0 0 40px #8b00ff, 0 0 50px #8b00ff, 0 0 75px #8b00ff;
        }

        .nav-link {
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          text-shadow: 0 0 10px #8b00ff, 0 0 20px #8b00ff, 0 0 30px #8b00ff;
          transform: scale(1.1);
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="mb-8">
        <ul className="flex justify-center space-x-8">
          <li>
            <Link href="/" className="text-xl neon-text nav-link">
              Home
            </Link>
          </li>
          <li>
            <a href="https://memes.hampepes.xyz" target="_blank" rel="noopener noreferrer" className="text-xl neon-text nav-link">
              Memes
            </a>
          </li>
        </ul>
      </nav>

      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-4xl mb-4 text-center text-white neon-text">HAM PEPE DRIP</h1>
        
        <Card className="mb-8 bg-black bg-opacity-50 neon-border rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white neon-text">ENTER TOKEN ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && !isNaN(parseInt(value)))) {
                    setTokenId(value);
                  }
                }}
                placeholder="TOKEN ID"
                className="bg-indigo-900 border-purple-500 text-white placeholder-purple-300 rounded"
              />
              <Button 
                className="bg-violet-600 hover:bg-violet-500 text-white neon-border rounded"
                onClick={fetchNftData}
                disabled={isLoading}
              >
                {isLoading ? 'LOADING...' : 'SHOW ME THE PEPE'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 bg-red-900 bg-opacity-50 neon-border rounded-lg">
            <CardContent>
              <p className="text-center text-white">{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="mb-8 bg-black bg-opacity-50 neon-border rounded-lg">
            <CardContent className="flex flex-col items-center">
              <Image
                src="/Running Pepe 2X transp.gif"
                alt="Loading..."
                width={200}
                height={200}
              />
              <p className="text-center text-white mt-4">Loading your Ham Pepe...</p>
            </CardContent>
          </Card>
        )}

        {imageUrl && !isLoading && (
          <Card className="mb-8 bg-black bg-opacity-50 neon-border rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-white neon-text">YOUR HAM PEPE</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <img src={imageUrl} alt="Generated Ham Pepe" className="max-w-full h-auto mb-4" />
              <div className="flex justify-center space-x-3 mb-4">
                {BACKGROUND_COLORS.map((color) => (
                  <ColorButton
                    key={color}
                    color={color}
                    isSelected={selectedBackground === color}
                    onClick={() => {
                      setSelectedBackground(color);
                      generateImage();
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col space-y-2 w-full">
                <Button 
                  className="bg-violet-600 hover:bg-violet-500 text-white neon-border rounded"
                  onClick={toggleHamHat}
                >
                  {useHamHat ? 'Remove Ham Hat' : 'Add Ham Hat'}
                </Button>
                <Button 
                  className="bg-violet-600 hover:bg-violet-500 text-white neon-border rounded"
                  onClick={toggleGham}
                >
                  {useGham ? 'Remove G\'ham' : 'Add G\'ham'}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-500 text-white neon-border rounded"
                  onClick={downloadPng}
                >
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} width="500" height="500" style={{ display: 'none' }} />
      </div>

      <footer className="mt-auto pt-8 pb-4">
        <div className="flex justify-center space-x-6">
          <a href="https://twitter.com/BrenOfTheGlen" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://warpcast.com/based-bren" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1000 1000" fill="currentColor" className="w-6 h-6">
              <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/>
              <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
              <path d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
            </svg>
          </a>
          <a href="https://opensea.io/collection/ham-pepes" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" fill="currentColor" className="w-6 h-6">
              <path d="M45 0C20.151 0 0 20.151 0 45C0 69.849 20.151 90 45 90C69.849 90 90 69.849 90 45C90 20.151 69.858 0 45 0ZM22.203 46.512L22.392 46.206L34.101 27.891C34.272 27.63 34.677 27.657 34.803 27.945C36.756 32.328 38.448 37.782 37.656 41.175C37.323 42.57 36.396 44.46 35.352 46.206C35.217 46.458 35.073 46.71 34.911 46.953C34.839 47.061 34.713 47.124 34.578 47.124H22.545C22.221 47.124 22.032 46.773 22.203 46.512ZM74.376 52.812C74.376 52.983 74.277 53.127 74.133 53.19C73.224 53.577 70.119 55.008 68.832 56.799C65.538 61.38 63.027 67.932 57.402 67.932H33.948C25.632 67.932 18.9 61.173 18.9 52.83V52.56C18.9 52.344 19.08 52.164 19.305 52.164H32.373C32.634 52.164 32.823 52.398 32.805 52.659C32.706 53.505 32.868 54.378 33.273 55.17C34.047 56.745 35.658 57.726 37.395 57.726H43.866V52.677H37.467C37.143 52.677 36.945 52.299 37.134 52.029C37.206 51.921 37.278 51.813 37.368 51.687C37.971 50.823 38.835 49.491 39.699 47.97C40.284 46.944 40.851 45.846 41.31 44.748C41.4 44.55 41.472 44.343 41.553 44.145C41.679 43.794 41.805 43.461 41.895 43.137C41.985 42.858 42.066 42.57 42.138 42.3C42.354 41.364 42.444 40.374 42.444 39.348C42.444 38.943 42.426 38.52 42.39 38.124C42.372 37.683 42.318 37.242 42.264 36.801C42.228 36.414 42.156 36.027 42.084 35.631C41.985 35.046 41.859 34.461 41.715 33.876L41.661 33.651C41.553 33.246 41.454 32.868 41.328 32.463C40.959 31.203 40.545 29.97 40.095 28.818C39.933 28.359 39.753 27.918 39.564 27.486C39.294 26.82 39.015 26.217 38.763 25.65C38.628 25.389 38.52 25.155 38.412 24.912C38.286 24.642 38.16 24.372 38.025 24.111C37.935 23.913 37.827 23.724 37.755 23.544L36.963 22.086C36.855 21.888 37.035 21.645 37.251 21.708L42.201 23.049H42.219C42.228 23.049 42.228 23.049 42.237 23.049L42.885 23.238L43.605 23.436L43.866 23.508V20.574C43.866 19.152 45 18 46.413 18C47.115 18 47.754 18.288 48.204 18.756C48.663 19.224 48.951 19.863 48.951 20.574V24.939L49.482 25.083C49.518 25.101 49.563 25.119 49.599 25.146C49.725 25.236 49.914 25.38 50.148 25.56C50.337 25.704 50.535 25.884 50.769 26.073C51.246 26.46 51.822 26.955 52.443 27.522C52.605 27.666 52.767 27.81 52.92 27.963C53.721 28.71 54.621 29.583 55.485 30.555C55.728 30.834 55.962 31.104 56.205 31.401C56.439 31.698 56.7 31.986 56.916 32.274C57.213 32.661 57.519 33.066 57.798 33.489C57.924 33.687 58.077 33.894 58.194 34.092C58.554 34.623 58.86 35.172 59.157 35.721C59.283 35.973 59.409 36.252 59.517 36.522C59.85 37.26 60.111 38.007 60.273 38.763C60.327 38.925 60.363 39.096 60.381 39.258V39.294C60.435 39.51 60.453 39.744 60.471 39.987C60.543 40.752 60.507 41.526 60.345 42.3C60.273 42.624 60.183 42.93 60.075 43.263C59.958 43.578 59.85 43.902 59.706 44.217C59.427 44.856 59.103 45.504 58.716 46.098C58.59 46.323 58.437 46.557 58.293 46.782C58.131 47.016 57.96 47.241 57.816 47.457C57.609 47.736 57.393 48.024 57.168 48.285C56.97 48.555 56.772 48.825 56.547 49.068C56.241 49.437 55.944 49.779 55.629 50.112C55.449 50.328 55.251 50.553 55.044 50.751C54.846 50.976 54.639 51.174 54.459 51.354C54.144 51.669 53.892 51.903 53.676 52.11L53.163 52.569C53.091 52.641 52.992 52.677 52.893 52.677H48.951V57.726H53.91C55.017 57.726 56.07 57.339 56.925 56.61C57.213 56.358 58.482 55.26 59.985 53.604C60.039 53.541 60.102 53.505 60.174 53.487L73.863 49.527C74.124 49.455 74.376 49.644 74.376 49.914V52.812Z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}