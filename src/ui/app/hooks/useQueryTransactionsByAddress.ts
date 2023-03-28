// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiAddress } from '@mysten/sui.js';
import { useQuery } from '@tanstack/react-query';

import { api } from '_redux/store/thunk-extras';

const dedupe = (arr: string[]) => Array.from(new Set(arr));

export function useQueryTransactionsByAddress(address: SuiAddress | null) {
    const rpc = api.instance.fullNode;

    return useQuery(
        ['transactions-by-address', address],
        async () => {
            // combine from and to transactions
            const [txnIds, fromTxnIds] = await Promise.all([
                rpc.queryTransactionBlocks({
                    filter: {
                        ToAddress: address || '',
                    },
                    options: {
                        showBalanceChanges: true,
                        showEffects: true,
                        showEvents: true,
                        showInput: true,
                        showObjectChanges: true,
                    },
                }),
                rpc.queryTransactionBlocks({
                    filter: {
                        FromAddress: address || '',
                    },
                    options: {
                        showBalanceChanges: true,
                        showEffects: true,
                        showEvents: true,
                        showInput: true,
                        showObjectChanges: true,
                    },
                }),
            ]);

            const resp = await rpc.multiGetTransactionBlocks({
                digests: dedupe(
                    [...txnIds.data, ...fromTxnIds.data].map((x) => x.digest)
                ),
                options: {
                    showInput: true,
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                    showBalanceChanges: true,
                },
            });

            return resp.sort(
                // timestamp could be null, so we need to handle
                (a, b) => (b.timestampMs || 0) - (a.timestampMs || 0)
            );
        },
        { enabled: !!address, staleTime: 0, cacheTime: 0 }
    );
}
