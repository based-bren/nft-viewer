import { NextRequest, NextResponse } from 'next/server'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY
const CONTRACT_ADDRESS = '0x1f7979C368c82dc647E075FfD61ed149052e3D6B'
const CHAIN = 'base'

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const { tokenId } = params

  try {
    const response = await fetch(
      `https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${CONTRACT_ADDRESS}/nfts/${tokenId}`,
      {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY || '',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch NFT data')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching NFT data:', error)
    return NextResponse.json({ message: 'Error fetching NFT data' }, { status: 500 })
  }
}