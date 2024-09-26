import dynamic from 'next/dynamic'

const SynthwaveNftViewer = dynamic(() => import('@/components/synthwave-nft-viewer'), { ssr: false })

export default function Home() {
  return <SynthwaveNftViewer />;
}
