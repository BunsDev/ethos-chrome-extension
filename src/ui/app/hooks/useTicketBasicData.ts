// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isSuiMoveObject, getObjectId, getObjectFields } from '@mysten/sui.js';

import useFileExtentionType from './useFileExtentionType';
import useMediaUrl from './useMediaUrl';

import type { SuiObject } from '@mysten/sui.js';

export default function useTicketBasicData(ticketObj: SuiObject) {
    const ticketObjectID = getObjectId(ticketObj.reference);
    const filePath = useMediaUrl(ticketObj.data, 'cover_image');
    const ticketFields = isSuiMoveObject(ticketObj.data)
        ? getObjectFields(ticketObj.data)
        : null;
    const fileExtentionType = useFileExtentionType(filePath || '');
    return {
        ticketObjectID,
        filePath,
        ticketFields,
        fileExtentionType,
    };
}
