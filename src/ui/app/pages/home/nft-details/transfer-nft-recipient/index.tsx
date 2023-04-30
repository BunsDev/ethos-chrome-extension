// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SUI_TYPE_ARG, TransactionBlock } from '@mysten/sui.js';
import { Formik } from 'formik';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import TransferNFTForm from './TransferNFTForm';
import { createValidationSchema } from './validation';
import { useAppDispatch, useAppSelector } from '_hooks';
import {
    accountAggregateBalancesSelector,
    accountNftsSelector,
} from '_redux/slices/account';
import { DEFAULT_NFT_TRANSFER_GAS_FEE } from '_redux/slices/sui-objects/Coin';
import { getSigner } from '_src/ui/app/helpers/getSigner';
import { setNftDetails } from '_src/ui/app/redux/slices/forms';
import { FailAlert } from '_src/ui/app/shared/alerts/FailAlert';

import type { SerializedError } from '@reduxjs/toolkit';

import st from './TransferNFTForm.module.scss';

const initialValues = {
    to: '',
    amount: DEFAULT_NFT_TRANSFER_GAS_FEE,
};

export type FormValues = typeof initialValues;

function TransferNFTRecipient() {
    const {
        account: {
            address,
            authentication,
            activeAccountIndex,
            accountInfos,
            passphrase,
        },
    } = useAppSelector((state) => state);
    const formData = useAppSelector(
        ({ forms: { transferNft } }) => transferNft
    );
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const objectId = searchParams.get('objectId');
    const nftCollections = useAppSelector(accountNftsSelector);
    const selectedNFTObj = useMemo(
        () =>
            nftCollections.filter(
                (nftItems) => nftItems.objectId === objectId
            )[0],
        [nftCollections, objectId]
    );

    const aggregateBalances = useAppSelector(accountAggregateBalancesSelector);

    const gasAggregateBalance = useMemo(
        () => aggregateBalances[SUI_TYPE_ARG] || BigInt(0),
        [aggregateBalances]
    );

    const [sendError, setSendError] = useState<string | null>(null);

    const validationSchema = useMemo(
        () =>
            createValidationSchema(
                gasAggregateBalance,
                address || '',
                objectId || ''
            ),
        [gasAggregateBalance, address, objectId]
    );

    const navigate = useNavigate();
    const onHandleSubmit = useCallback(
        async ({ to }: FormValues) => {
            if (objectId === null) {
                return;
            }

            const signer = await getSigner(
                passphrase,
                accountInfos,
                address,
                authentication,
                activeAccountIndex
            );

            if (!signer) return;

            const transactionBlock = new TransactionBlock();
            transactionBlock.add(
                TransactionBlock.Transactions.TransferObjects(
                    [transactionBlock.object(objectId)],
                    transactionBlock.pure(to)
                )
            );

            const signedTx = await signer.dryRunTransactionBlock({
                transactionBlock: transactionBlock,
            });

            const gasFee =
                Number(signedTx.effects.gasUsed.computationCost) +
                (Number(signedTx.effects.gasUsed.storageCost) -
                    Number(signedTx.effects.gasUsed.storageRebate));

            setSendError(null);

            try {
                dispatch(
                    setNftDetails({
                        from: address || 'Wallet',
                        to: to,
                        nftId: objectId,
                        gasFee: `${gasFee} MIST`,
                    })
                );

                navigate(
                    `/nfts/transfer/review?${new URLSearchParams({
                        objectId: objectId,
                    }).toString()}`
                );
            } catch (e) {
                toast(<FailAlert text={'Could not set address'} />);
                setSendError((e as SerializedError).message || null);
            }
        },
        [
            objectId,
            passphrase,
            accountInfos,
            address,
            authentication,
            activeAccountIndex,
            dispatch,
            navigate,
        ]
    );

    const handleOnClearSubmitError = useCallback(() => {
        setSendError(null);
    }, []);

    return (
        <div className={st.container}>
            <div className={'text-left'}>
                <Formik
                    initialValues={{
                        to: formData.to,
                        amount: DEFAULT_NFT_TRANSFER_GAS_FEE,
                    }}
                    validateOnMount={true}
                    validationSchema={validationSchema}
                    onSubmit={onHandleSubmit}
                >
                    <TransferNFTForm
                        nftobj={selectedNFTObj}
                        submitError={sendError}
                        gasBalance={gasAggregateBalance.toString()}
                        onClearSubmitError={handleOnClearSubmitError}
                    />
                </Formik>
            </div>
        </div>
    );
}

export default memo(TransferNFTRecipient);
