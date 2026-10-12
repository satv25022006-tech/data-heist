import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  caption?: string;
  title?: string;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  caption,
  title
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm md:text-base">
              {title || 'High-Resolution Forensic Evidence Inspection'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Open raw image"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Frame */}
        <div className="p-4 md:p-6 overflow-auto flex-1 flex items-center justify-center bg-slate-950">
          <img
            src={imageUrl}
            alt={caption || 'Forensic Exhibit Poster'}
            className="max-h-[75vh] w-auto max-w-full rounded-lg border border-slate-800 shadow-xl object-contain"
          />
        </div>

        {/* Caption bar */}
        {caption && (
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/70 text-xs text-slate-300 font-mono flex items-center justify-between">
            <span>{caption}</span>
            <span className="text-cyan-400 font-bold">CLASSIFIED EXHIBIT</span>
          </div>
        )}
      </div>
    </div>
  );
};
