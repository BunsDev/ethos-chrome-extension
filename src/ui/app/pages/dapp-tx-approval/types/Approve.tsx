import { useCallback, useState } from 'react';

import InlineButtonGroup from '_src/ui/app/shared/buttons/InlineButtonGroup';
import LoadingIndicator from '_src/ui/app/components/loading/LoadingIndicator';

export type NextStepProps = {
    disabled?: boolean;
    onApprove: () => void;
    onCancel: () => void;
};

const Approve = ({ disabled, onApprove, onCancel }: NextStepProps) => {
    const [approving, setApproving] = useState(false);

    const approve = useCallback(() => {
        setApproving(true);
        onApprove && onApprove();
    }, [onApprove]);

    const cancel = useCallback(() => {
        onCancel && onCancel();
    }, [onCancel]);

    return (
        <InlineButtonGroup
            onClickButtonPrimary={approve}
            buttonPrimaryTestId="approve"
            buttonPrimaryChildren={
                approving ? <LoadingIndicator /> : <>Approve</>
            }
            isButtonPrimaryDisabled={disabled}
            onClickButtonSecondary={cancel}
            buttonSecondaryTestId="reject"
            buttonSecondaryChildren={<>Cancel</>}
        />
    );
};

export default Approve;
