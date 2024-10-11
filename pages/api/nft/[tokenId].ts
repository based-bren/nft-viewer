import { NextApiRequest, NextApiResponse } from 'next'

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY
const CONTRACT_ADDRESS = '0x1f7979C368c82dc647E075FfD61ed149052e3D6B'
const CHAIN = 'base'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tokenId } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching NFT data:', error)
    res.status(500).json({ message: 'Error fetching NFT data' })
  }
}