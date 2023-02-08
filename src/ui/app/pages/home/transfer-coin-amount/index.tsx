// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// import { getTransactionDigest } from '@mysten/sui.js';

import { Formik } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { Coin as CoinAPI } from '@mysten/sui.js';

import TransferCoinAmountForm from './TransferCoinAmountForm';
import { createTokenValidation } from './validation';
import { useAppDispatch, useAppSelector } from '_hooks';
import {
    accountAggregateBalancesSelector,
    accountCoinsSelector,
} from '_redux/slices/account';
import {
    Coin,
    DEFAULT_GAS_BUDGET_FOR_PAY,
    GAS_TYPE_ARG,
} from '_redux/slices/sui-objects/Coin';
import truncateString from '_src/ui/app/helpers/truncate-string';
import { getSendTokenFee } from '_redux/slices/transactions';
import {
    formatBalance,
    useCoinDecimals,
    useFormatCoin,
} from '_src/ui/app/hooks/useFormatCoin';
import { setSuiAmount } from '_src/ui/app/redux/slices/forms';

import type { SerializedError } from '@reduxjs/toolkit';
import type { FormikHelpers } from 'formik';
import { SuiMoveObject } from '@mysten/sui.js';
import { api, thunkExtras } from '_src/ui/app/redux/store/thunk-extras';
import BigNumber from 'bignumber.js';

const initialValues = {
    amount: '',
};

export type FormValues = typeof initialValues;

// TODO: show out of sync when sui objects locally might be outdated
function TransferCoinAmountPage() {
    const [searchParams] = useSearchParams();
    const coinType = searchParams.get('type');
    const formState = useAppSelector(({ forms: { sendSui } }) => sendSui);
    const state = useAppSelector((state) => state);
    const activeAccountIndex = useAppSelector(
        ({ account }) => account.activeAccountIndex
    );
    const aggregateBalances = useAppSelector(accountAggregateBalancesSelector);

    const coinBalance = useMemo(
        () => (coinType && aggregateBalances[coinType]) || BigInt(0),
        [coinType, aggregateBalances]
    );
    const [formattedBalance] = useFormatCoin(
        coinBalance,
        coinType || GAS_TYPE_ARG
    );

    const gasAggregateBalance = useMemo(
        () => aggregateBalances[GAS_TYPE_ARG] || BigInt(0),
        [aggregateBalances]
    );

    const coinSymbol = useMemo(
        () => (coinType && Coin.getCoinSymbol(coinType)) || '',
        [coinType]
    );

    const [sendError, setSendError] = useState<string | null>(null);

    const [coinDecimals] = useCoinDecimals(coinType);
    const [gasDecimals] = useCoinDecimals(GAS_TYPE_ARG);
    const allCoins = useAppSelector(accountCoinsSelector);

    const allCoinsOfSelectedTypeArg = useMemo(
        () =>
            allCoins.filter(
                (aCoin) => coinType && Coin.getCoinTypeArg(aCoin) === coinType
            ),
        [coinType, allCoins]
    );
    const [amountToSend] = useState(BigInt(0));
    const gasBudget = useMemo(
        () =>
            Coin.computeGasBudgetForPay(
                allCoinsOfSelectedTypeArg,
                amountToSend
            ),
        [allCoinsOfSelectedTypeArg, amountToSend]
    );

    const validationSchema = useMemo(
        () =>
            createTokenValidation(
                coinType || '',
                coinBalance,
                coinSymbol,
                gasAggregateBalance,
                coinDecimals,
                gasDecimals,
                gasBudget
            ),
        [
            coinType,
            coinBalance,
            coinSymbol,
            gasAggregateBalance,
            coinDecimals,
            gasDecimals,
            gasBudget,
        ]
    );

    const gasFee = `${formatBalance(gasBudget, gasDecimals)} ${truncateString(
        coinSymbol,
        8
    )}`;

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const onHandleSubmit = useCallback(
        async (
            { amount }: FormValues,
            { resetForm }: FormikHelpers<FormValues>
        ) => {
            if (coinType === null) {
                return;
            }

            const bigIntAmount = BigInt(
                new BigNumber(amount)
                    .shiftedBy(coinDecimals)
                    .integerValue()
                    .toString()
            );

            const checkForFee = await dispatch(
                getSendTokenFee({
                    tokenTypeArg: coinType,
                    amount: bigIntAmount,
                    recipientAddress: formState.to,
                })
            );

            console.log('check for fee', checkForFee);

            dispatch(
                setSuiAmount({
                    amount: amount,
                    gasFee: gasFee,
                })
            );
            setSendError(null);
            try {
                resetForm();
                const reviewUrl = `/send/review?${new URLSearchParams({
                    type: coinType,
                }).toString()}`;
                navigate(reviewUrl);
            } catch (e) {
                setSendError((e as SerializedError).message || null);
            }
        },
        [dispatch, navigate, coinType, gasFee]
    );
    const handleOnClearSubmitError = useCallback(() => {
        setSendError(null);
    }, []);

    const initialValues = {
        amount: formState.amount,
    };

    if (formState.to === '') {
        return <Navigate to={'/tokens'} />;
    }

    return (
        <>
            <Formik
                initialValues={initialValues}
                validateOnMount={true}
                validationSchema={validationSchema}
                onSubmit={onHandleSubmit}
            >
                <TransferCoinAmountForm
                    submitError={sendError}
                    coinBalance={formattedBalance.toString()}
                    coinSymbol={coinSymbol}
                    gasBudget={gasBudget}
                    onClearSubmitError={handleOnClearSubmitError}
                />
            </Formik>
        </>
    );
}

export default TransferCoinAmountPage;
