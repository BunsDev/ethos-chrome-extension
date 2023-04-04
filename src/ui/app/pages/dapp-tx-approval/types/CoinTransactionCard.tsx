import { Costs, Gains } from './Amount';
import CardRow from './CardRow';
import From from './From';
import Gas from './Gas';
import SendCoinImage from './SendCoinImage';
import Total from './Total';
import TransactionBody from './TransactionBody';
import BodyLarge from '_src/ui/app/shared/typography/BodyLarge';

import type { StepInformation } from './SimpleCoinTransfer';

const CoinTransactionCard = ({
    stepInformation,
}: {
    stepInformation: StepInformation;
}) => {
    const { formatted, iconUrl, symbol, dollars, to, analysis } =
        stepInformation;

    return (
        <TransactionBody>
            <div className="w-full rounded-xl bg-[#F8F5FF] flex flex-col divide-y divide-color-ethos-light-purple overflow-hidden">
                <div className="p-6 flex-col justify-center items-center text-center">
                    <div className="pb-1 inline-block">
                        <SendCoinImage iconUrl={iconUrl} symbol={symbol} />
                    </div>
                    <BodyLarge>You are about to send</BodyLarge>
                    <div className="text-lg flex justify-center gap-6">
                        <BodyLarge isSemibold>
                            {formatted} {symbol}
                        </BodyLarge>
                        <BodyLarge
                            isSemibold
                            className="text-[#74777C] text-xl"
                        >
                            ≈ {dollars}
                        </BodyLarge>
                    </div>
                </div>
                <From />
                {to && <CardRow title="To" value={to} />}
                <Costs balanceReductions={analysis.balanceReductions} />
                <Gains balanceAdditions={analysis.balanceAdditions} />
                <Gas gasSummary={analysis.gas} />
                <Total analysis={analysis} />
            </div>
        </TransactionBody>
    );
};

export default CoinTransactionCard;
