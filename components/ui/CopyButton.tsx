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
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md transition-all duration-150 ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-600 animate-in zoom-in-75" />
          <span>{label ? 'Copied' : 'Copied!'}</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-slate-400" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
