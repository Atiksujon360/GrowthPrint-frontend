import React, { useState } from 'react';
import { copyToClipboard } from '../../lib/utils.ts';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  title?: string;
}

export function CopyButton({
  value,
  label,
  className = '',
  title = 'Copy to clipboard'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : title}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-colors duration-150 ${
        copied
          ? 'bg-gp-success-soft text-gp-success border border-gp-success/30'
          : 'text-gp-text-secondary hover:text-gp-text hover:bg-gp-surface-secondary border border-transparent'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-gp-success animate-in zoom-in-75" />
          <span>{label ? 'Copied' : 'Copied!'}</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-gp-text-muted" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
