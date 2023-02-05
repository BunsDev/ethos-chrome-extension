import type BigNumber from 'bignumber.js';

const mistToSui = (mist: number | BigNumber | undefined): string => {
    return (parseFloat(`${mist || 0}`) * 0.000000001).toString();
};

export default mistToSui;
