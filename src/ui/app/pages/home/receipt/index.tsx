// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
//import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Content } from '_app/shared/bottom-menu-layout';
import ReceiptCard from '_components/receipt-card';
import Loading from '_src/ui/app/components/loading';

import st from './ReceiptPage.module.scss';

// Response pages for all transactions
// use txDigest for the transaction result
function ReceiptPage() {
    const [searchParams] = useSearchParams();
    //const dispatch = useAppDispatch();

    //const navigate = useNavigate();

    //const loading = useAppSelector(({ txresults }) => txresults.loading);
    const loading = false;

    /*useEffect(() => {
        const getTxByAddr = async () => {
            await dispatch(getTransactionsByAddress()).unwrap();
        };

        getTxByAddr();
    }, [dispatch]);*/

    // get tx results from url params
    const txDigest = searchParams.get('txdigest');
    //const transferType = searchParams.get('transfer');
    /*const txResults: TxResultState[] = useAppSelector(
        ({ txresults }) => txresults.latestTx
    );*/

    /*const txnItem = useMemo(() => {
        return txResults.filter((txn) => txn.txId === txDigest)[0];
    //}, [txResults, txDigest]);*/

    /*
    //const linkTo = transferType ? '/nfts' : '/transactions';
*/
    /*if (!loading && (!txDigest || (txResults.length > 0 && !txnItem))) {
        navigate(linkTo);
    }*/

    return (
        <div>
            <Loading loading={loading} big={true}>
                <div className={st.container}>
                    <Content>
                        <ReceiptCard txDigest={txDigest} />
                    </Content>
                </div>
            </Loading>
        </div>
    );
}

export default ReceiptPage;
