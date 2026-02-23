/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AlertIcon } from './Icons';

interface ErrorViewProps {
    message?: string;
}

export default function ErrorView({ message }: ErrorViewProps) {
    return (
        <div className="error-view">
            <div className="error-icon-wrapper">
                <AlertIcon />
            </div>
            <h3>Generation Failed</h3>
            <p>{message || "An unexpected error occurred while generating this component."}</p>
        </div>
    );
}