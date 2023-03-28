import NftGridItem from './NftGridItem';

import type { SuiObjectData } from '@mysten/sui.js';

interface NftGridProps {
    nfts: SuiObjectData[];
}

const NftGrid = ({ nfts }: NftGridProps) => {
    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 px-6 pb-6">
            {(nfts || []).map((nft, key) => (
                <NftGridItem nft={nft} key={key} />
            ))}
        </div>
    );
};

export default NftGrid;
