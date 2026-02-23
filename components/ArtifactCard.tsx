/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { Artifact } from '../types';
import ErrorView from './ErrorView';
import { RefreshIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onRegenerate: (e: React.MouseEvent) => void;
    theme: 'dark' | 'light';
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    onClick,
    onRegenerate,
    theme
}: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Auto-scroll logic for this specific card
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [artifact.html]);

    // Inject Theme Styles into Iframe
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const updateTheme = () => {
            const doc = iframe.contentDocument;
            if (doc && doc.documentElement) {
               doc.documentElement.setAttribute('data-theme', theme);
               // Inject style if not present to handle automatic inversion for light mode
               if (!doc.getElementById('theme-style')) {
                   const style = doc.createElement('style');
                   style.id = 'theme-style';
                   // Smart Invert: Invert HTML but re-invert media to preserve original colors
                   style.textContent = `
                       html { transition: filter 0.3s ease; }
                       html[data-theme="light"] { filter: invert(1) hue-rotate(180deg); }
                       html[data-theme="light"] img, 
                       html[data-theme="light"] video, 
                       html[data-theme="light"] picture,
                       html[data-theme="light"] svg { filter: invert(1) hue-rotate(180deg); }
                   `;
                   doc.head.appendChild(style);
               }
            }
        };

        // Apply theme immediately if loaded, or wait for load
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            updateTheme();
        }
        iframe.addEventListener('load', updateTheme);
        return () => iframe.removeEventListener('load', updateTheme);
    }, [theme, artifact.html]);

    const isBlurring = artifact.status === 'streaming';
    const isError = artifact.status === 'error';

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${isBlurring ? 'generating' : ''} ${isError ? 'error-state' : ''}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                <span className="artifact-style-tag">{artifact.styleName}</span>
                {isFocused && (
                    <button 
                        className="regenerate-btn" 
                        onClick={onRegenerate}
                        title="Regenerate this specific variation"
                        aria-label="Regenerate"
                    >
                        <RefreshIcon />
                    </button>
                )}
            </div>
            <div className="artifact-card-inner">
                {isError ? (
                    <ErrorView message={artifact.errorMessage} />
                ) : (
                    <>
                        {isBlurring && (
                            <div className="generating-overlay">
                                <pre ref={codeRef} className="code-stream-preview">
                                    {artifact.html}
                                </pre>
                            </div>
                        )}
                        <iframe 
                            ref={iframeRef}
                            srcDoc={artifact.html} 
                            title={artifact.id} 
                            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                            className="artifact-iframe"
                        />
                    </>
                )}
            </div>
        </div>
    );
});

export default ArtifactCard;