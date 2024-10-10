'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const OPENSEA_API_KEY = process.env.NEXT_PUBLIC_OPENSEA_API_KEY;
const CONTRACT_ADDRESS = '0x1f7979C368c82dc647E075FfD61ed149052e3D6B';
const CHAIN = 'base';

const TRAIT_ORDER = ['Skin', 'Pants', 'Shirt', 'Eyes', 'Hat', 'Special'];

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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fetchNftData = async () => {
    setIsLoading(true)
    setError('')
    setTraits({})
    setImageUrl('')

    try {
      const response = await fetch(`https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${CONTRACT_ADDRESS}/nfts/${tokenId}`, {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch NFT data')
      }

      const data = await response.json()
      console.log('NFT data:', data) // Add this log
      const traitObject: Record<string, string> = {}
      data.nft.traits.forEach((trait: Trait) => {
        traitObject[trait.trait_type] = trait.value
      })
      console.log('Traits:', traitObject) // Add this log
      setTraits(traitObject)
    } catch (err) {
      setError('Error fetching NFT data. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('Traits changed:', traits) // Add this log
    if (Object.keys(traits).length > 0) {
      generateImage()
    }
  }, [traits, useHamHat])

  const generateImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load and draw the background
    await drawImage(ctx, '/traits/Back/Green.png')

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

    // Convert canvas to image URL
    const imageUrl = canvas.toDataURL('image/png')
    setImageUrl(imageUrl)
  }

  const drawImage = (ctx: CanvasRenderingContext2D, src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
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
      `}</style>
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-4xl mb-4 text-center text-white neon-text">HAM PEPE FUN TRAITS</h1>
        
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

        {imageUrl && (
          <Card className="mb-8 bg-black bg-opacity-50 neon-border rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-white neon-text">YOUR HAM PEPE</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <img src={imageUrl} alt="Generated Ham Pepe" className="max-w-full h-auto mb-4" />
              <div className="flex flex-col space-y-2 w-full">
                <Button 
                  className="bg-violet-600 hover:bg-violet-500 text-white neon-border rounded"
                  onClick={toggleHamHat}
                >
                  {useHamHat ? 'Remove Ham Hat' : 'Add Ham Hat'}
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
        </div>
      </footer>
    </div>
  )
}