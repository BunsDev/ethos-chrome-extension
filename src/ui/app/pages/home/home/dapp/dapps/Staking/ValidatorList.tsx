import classNames from 'classnames';
import { useCallback, useMemo } from 'react';

import Loading from '_src/ui/app/components/loading';
import truncateMiddle from '_src/ui/app/helpers/truncate-middle';
import { useValidatorsWithApy } from '_src/ui/app/hooks/staking/useValidatorsWithApy';
import Body from '_src/ui/app/shared/typography/Body';

import type { SuiAddress, SuiValidatorSummary } from '@mysten/sui.js';

export interface SuiValidatorSummaryWithApy extends SuiValidatorSummary {
    apy: number;
    isApyApproxZero: boolean;
}

interface ValidatorListProps {
    onSelectValidator: (string: SuiAddress) => void;
    selectedValidator?: SuiAddress;
}

const ValidatorList: React.FC<ValidatorListProps> = ({
    onSelectValidator,
    selectedValidator,
}) => {
    const { isFetching, data: validators } = useValidatorsWithApy();

    const sortedValidators = useMemo(() => {
        if (!validators) return;
        return Object.values(validators).sort((a, b) => b.apy - a.apy);
    }, [validators]);

    return (
        <Loading loading={isFetching} big={true}>
            <div className="flex flex-col">
                {!isFetching &&
                    sortedValidators &&
                    sortedValidators.map((validator, key) => (
                        <ValidatorRow
                            onSelect={onSelectValidator}
                            validator={validator}
                            key={key}
                            isSelected={
                                validator.suiAddress === selectedValidator
                            }
                        />
                    ))}
            </div>
        </Loading>
    );
};

interface ValidatorRowProps {
    validator: SuiValidatorSummaryWithApy;
    onSelect: (suiAddress: SuiAddress) => void;
    isSelected: boolean;
}

const ValidatorRow: React.FC<ValidatorRowProps> = ({
    validator,
    onSelect,
    isSelected,
}) => {
    const onClick = useCallback(() => {
        onSelect(validator.suiAddress);
    }, [onSelect, validator]);

    return (
        <button
            onClick={onClick}
            className={classNames(
                'w-full py-3 px-2 text-left rounded-lg border-b border-ethos-light-text-stroke dark:border-ethos-dark-text-stroke',
                isSelected
                    ? 'border-2 border-b-2 border-ethos-light-primary-light dark:border-ethos-dark-primary-dark'
                    : ''
            )}
        >
            <div className="flex flex-row items-center place-content-center justify-between">
                <div className="flex items-center place-content-center gap-3">
                    {validator.imageUrl ? (
                        <img
                            src={validator.imageUrl}
                            alt={validator.name}
                            className="h-9 w-9 rounded-full"
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-ethos-light-background-secondary dark:bg-ethos-dark-background-secondary" />
                    )}
                    <div className="flex flex-col">
                        <Body isSemibold>{validator.name}</Body>
                        <Body isTextColorMedium>
                            {truncateMiddle(validator.suiAddress)}
                        </Body>
                    </div>
                </div>
                <Body isSemibold>{validator.apy || 0}%</Body>
            </div>
        </button>
    );
};
export default ValidatorList;
