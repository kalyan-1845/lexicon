"use client";
import { useState, useRef, useCallback, DragEvent, useEffect } from "react";
import PDFMetadataModal from "@/components/PDFMetadataModal";
import { showToast } from "@/components/Toast";
import { getApiUrl } from "@/utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DocStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error:format"
  | "error:size"
  | "error:network"
  | "cancelled";

export type Document = {
  /** Unique key for React reconciliation and XHR tracking */
  id: string;
  name: string;
  size: number;
  status: string;
  /** Human-readable DocStatus tag for branch logic */
  statusTag: DocStatus;
  /** Upload progress 0–100 */
  progress: number;
  text?: string;
  thumbnail?: string;
  charCount?: number;
};

type PDFUploaderProps = {
  documents: Document[];
  setDocuments: (action: Document[] | ((prev: Document[]) => Document[])) => void;
  onContextUpdate?: (text: string | null) => void;
  isEmbedded?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE_LABEL = "10MB";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns a display label for each status tag */
function statusLabel(doc: Document): string {
  switch (doc.statusTag) {
    case "queued":      return "Queued…";
    case "uploading":   return `Uploading (${doc.progress}%)…`;
    case "success":     return `Parsed (${doc.charCount?.toLocaleString() ?? 0} chars)`;
    case "error:format":  return "Failed — invalid format (PDF only)";
    case "error:size":    return `Failed — file exceeds ${MAX_FILE_SIZE_LABEL}`;
    case "error:network": return "Failed — network error";
    case "cancelled":     return "Cancelled";
  }
}

/** Colour class for the status label text */
function statusColour(doc: Document): string {
  if (doc.statusTag === "success")   return "text-emerald-500";
  if (doc.statusTag.startsWith("error") || doc.statusTag === "cancelled")
    return "text-red-500/80";
  if (doc.statusTag === "uploading") return "text-indigo-400";
  return "text-[var(--theme-text-muted)]";
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PDFUploader({
  documents,
  setDocuments,
  onContextUpdate,
  isEmbedded,
}: PDFUploaderProps) {
  // ── Local state ──────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [summaryData, setSummaryData] = useState<{
    name: string;
    summary: string;
  } | null>(null);

  // Map of doc.id → XMLHttpRequest for per-file cancellation
  const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map());

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Functional state updater helpers ────────────────────────────────────

  /**
   * Update a single document in the list by id.
   * Uses the `documents` prop directly because setDocuments accepts
   * a plain array (not a functional updater).
   */
  const updateDoc = useCallback(
    (id: string, patch: Partial<Document>) => {
      setDocuments(
        documents.map((d) => (d.id === id ? { ...d, ...patch } : d))
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documents, setDocuments]
  );

  // ── Core upload logic ────────────────────────────────────────────────────

  /**
   * Validate a single file client-side and return an error DocStatus or null.
   */
  function validateFile(file: File): DocStatus | null {
    if (!file.name.endsWith(".pdf") || file.type !== "application/pdf") {
      return "error:format";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "error:size";
    }
    return null;
  }

  /**
   * Upload one file via XHR. Progress, success, error, and abort are all
   * handled in isolation — other files in the queue are unaffected.
   */
  function uploadFile(file: File, doc: Document) {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhrMapRef.current.set(doc.id, xhr);

    // Real-time progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        updateDoc(doc.id, {
          progress: percent,
          status: `Uploading (${percent}%)…`,
        });
      }
    };

    // Upload complete
    xhr.onload = () => {
      xhrMapRef.current.delete(doc.id);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          updateDoc(doc.id, {
            statusTag: "success",
            status: `Parsed (${data.extracted_character_count?.toLocaleString() ?? 0} chars)`,
            progress: 100,
            text: data.full_text,
            thumbnail: data.thumbnail,
            charCount: data.extracted_character_count ?? 0,
          });
          if (onContextUpdate && data.full_text) {
            onContextUpdate(data.full_text);
          }
          showToast(`Parsed: ${file.name}`, "success");
        } catch {
          markNetworkError(doc.id, file.name);
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          const detail: string = errData?.detail ?? "";
          if (detail.toLowerCase().includes("pdf")) {
            updateDoc(doc.id, {
              statusTag: "error:format",
              status: "Failed — invalid format (PDF only)",
              progress: 0,
            });
          } else if (detail.toLowerCase().includes("10mb") || detail.toLowerCase().includes("size")) {
            updateDoc(doc.id, {
              statusTag: "error:size",
              status: `Failed — file exceeds ${MAX_FILE_SIZE_LABEL}`,
              progress: 0,
            });
          } else {
            markNetworkError(doc.id, file.name);
          }
        } catch {
          markNetworkError(doc.id, file.name);
        }
        showToast(`Failed to upload: ${file.name}`, "error");
      }
    };

    // Network failure (isolated — other uploads continue)
    xhr.onerror = () => {
      xhrMapRef.current.delete(doc.id);
      markNetworkError(doc.id, file.name);
      showToast(`Network error: ${file.name}`, "error");
    };

    // User cancelled this specific file
    xhr.onabort = () => {
      xhrMapRef.current.delete(doc.id);
      updateDoc(doc.id, {
        statusTag: "cancelled",
        status: "Cancelled",
        progress: 0,
      });
      showToast(`Cancelled: ${file.name}`, "warning");
    };

    xhr.open("POST", getApiUrl("/api/upload/pdf"));
    xhr.send(formData);
  }

  function markNetworkError(id: string, name: string) {
    updateDoc(id, {
      statusTag: "error:network",
      status: "Failed — network error",
      progress: 0,
    });
    showToast(`Upload failed: ${name}`, "error");
  }

  /**
   * Entry point for a batch of files (from drop or file-picker).
   * Validates each file client-side immediately, then fires parallel XHR
   * requests for valid files. Invalid ones show errors right away.
   */
  function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newDocs: Document[] = fileArray.map((file) => {
      const validationError = validateFile(file);
      const id = generateId();

      if (validationError) {
        // Immediate client-side rejection — no XHR needed
        showToast(
          validationError === "error:format"
            ? `Skipped (not a PDF): ${file.name}`
            : `Skipped (exceeds ${MAX_FILE_SIZE_LABEL}): ${file.name}`,
          "error"
        );
        return {
          id,
          name: file.name,
          size: file.size,
          statusTag: validationError,
          status:
            validationError === "error:format"
              ? "Failed — invalid format (PDF only)"
              : `Failed — file exceeds ${MAX_FILE_SIZE_LABEL}`,
          progress: 0,
        } as Document;
      }

      return {
        id,
        name: file.name,
        size: file.size,
        statusTag: "uploading" as DocStatus,
        status: "Uploading (0%)…",
        progress: 0,
      };
    });

    // Prepend to existing docs (plain array — setDocuments does not accept a functional updater)
    setDocuments([...newDocs, ...documents]);

    // Fire XHR only for valid files
    fileArray.forEach((file, i) => {
      const doc = newDocs[i];
      if (doc.statusTag === "uploading") {
        showToast(`Uploading: ${file.name}`, "info");
        uploadFile(file, doc);
      }
    });
  }

  // ── Cancel a single upload ────────────────────────────────────────────────

  function cancelUpload(id: string) {
    const xhr = xhrMapRef.current.get(id);
    if (xhr) {
      xhr.abort(); // triggers xhr.onabort above
    }
  }

  // ── Drag-and-drop handlers ────────────────────────────────────────────────

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if leaving the outer container (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // ── File input change ─────────────────────────────────────────────────────

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  // ── Export citations ──────────────────────────────────────────────────────

  const handleExportCitations = () => {
    window.open(getApiUrl("/api/citations/export"), "_blank");
  };

  // ── Summarise helper ──────────────────────────────────────────────────────

  const handleSummarize = async (doc: Document) => {
    if (!doc.text) return;
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doc.text }),
      });
      if (!response.ok) throw new Error("Summarization failed");
      const data = await response.json();
      setSummaryData({ name: doc.name, summary: data.summary });
    } catch (err) {
      console.error("Summarization error:", err);
      showToast("Failed to summarize document.", "error");
    }
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      // Abort all pending uploads on unmount
      xhrMapRef.current.forEach((xhr) => xhr.abort());
    };
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeUploadCount = documents.filter(
    (d) => d.statusTag === "uploading"
  ).length;

  // ── Render ────────────────────────────────────────────────────────────────

  const content = (
    <div
      className="flex-1 flex flex-col p-4 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-[12px] text-[var(--theme-text-muted)] uppercase tracking-widest">
          Knowledge Base
        </h2>
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <button
              onClick={handleExportCitations}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition-all"
              title="Export Citations (BibTeX)"
            >
              Export BibTeX
            </button>
          )}
          <span className="text-[11px] font-bold text-[var(--theme-text-muted)] bg-white/[0.02] px-2 py-0.5 rounded border border-[var(--theme-border)]">
            {documents.length}
          </span>
        </div>
      </div>

      {/* ── Drop zone / Upload button ─────────────────────────────────── */}
      <div className="relative shrink-0">
        {/* Hidden file input — allows multiple files */}
        <input
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          id="batch-pdf-input"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center
            justify-center gap-2 transition-all duration-200 group select-none
            ${
              isDragging
                ? "border-indigo-500/70 bg-indigo-500/[0.06] scale-[1.01]"
                : "border-[var(--theme-border)] hover:border-indigo-500/40 hover:bg-white/[0.015]"
            }
          `}
          aria-label="Click or drop PDFs here to upload"
        >
          {/* Upload icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
              ${isDragging ? "bg-indigo-500/20" : "bg-white/[0.03] group-hover:bg-indigo-500/10"}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className={`transition-colors ${isDragging ? "text-indigo-400" : "text-[var(--theme-text-muted)] group-hover:text-indigo-400"}`}
            >
              {isDragging ? (
                <path d="M12 3v12M5 10l7-7 7 7M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
              ) : (
                <>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </>
              )}
            </svg>
          </div>

          <div className="text-center">
            <p
              className={`text-[12px] font-semibold transition-colors ${
                isDragging
                  ? "text-indigo-300"
                  : "text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]"
              }`}
            >
              {isDragging ? "Drop PDFs here" : "Drag & drop or click to add"}
            </p>
            <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5 opacity-70">
              PDF only · max {MAX_FILE_SIZE_LABEL} · multiple files supported
            </p>
          </div>
        </button>

        {/* Active-upload badge */}
        {activeUploadCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] text-indigo-400 font-semibold">
              {activeUploadCount} upload{activeUploadCount > 1 ? "s" : ""} in
              progress
            </span>
          </div>
        )}
      </div>

      {/* ── File queue list ───────────────────────────────────────────── */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-0.5">
        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 opacity-40">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[var(--theme-text-muted)]"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-[11px] text-[var(--theme-text-muted)]">No documents yet</p>
          </div>
        )}

        {documents.map((doc) => {
          const isUploading = doc.statusTag === "uploading";
          const isSuccess   = doc.statusTag === "success";
          const isError     = doc.statusTag.startsWith("error");
          const isCancelled = doc.statusTag === "cancelled";

          return (
            <div
              key={doc.id}
              className={`
                p-3 rounded-xl border flex items-start gap-3 group transition-all duration-200
                ${isUploading ? "bg-indigo-500/[0.04] border-indigo-500/20" : ""}
                ${isSuccess   ? "bg-emerald-500/[0.03] border-emerald-500/10 hover:border-emerald-500/20" : ""}
                ${isError || isCancelled ? "bg-red-500/[0.03] border-red-500/10" : ""}
                ${!isUploading && !isSuccess && !isError && !isCancelled
                  ? "bg-white/[0.01] border-[var(--theme-border)]" : ""}
              `}
            >
              {/* ── File icon ── */}
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5
                  ${isUploading ? "bg-indigo-500/10 border-indigo-500/20" : ""}
                  ${isSuccess   ? "bg-emerald-500/10 border-emerald-500/10" : ""}
                  ${isError || isCancelled ? "bg-red-500/10 border-red-500/10" : ""}
                  ${!isUploading && !isSuccess && !isError && !isCancelled
                    ? "bg-white/[0.03] border-[var(--theme-border)]" : ""}
                `}
              >
                {isUploading ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-indigo-400 animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : isSuccess ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-emerald-500"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isError || isCancelled ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-red-400/70"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-red-500/60"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
              </div>

              {/* ── Info column ── */}
              <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                <span className="text-[12px] font-semibold text-[var(--theme-text)] truncate">
                  {doc.name}
                </span>

                {/* Status label */}
                <span className={`text-[10px] font-semibold mt-0.5 ${statusColour(doc)}`}>
                  {statusLabel(doc)}
                </span>

                {/* File size */}
                <span className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">
                  {formatSize(doc.size)}
                </span>

                {/* Progress bar — only when uploading */}
                {isUploading && (
                  <div className="w-full bg-white/[0.05] rounded-full h-1 mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className="shrink-0 flex gap-1 mt-0.5">
                {/* Cancel button — visible while uploading */}
                {isUploading && (
                  <button
                    onClick={() => cancelUpload(doc.id)}
                    className="w-6 h-6 rounded hover:bg-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-red-400 transition-colors"
                    title="Cancel upload"
                    aria-label={`Cancel upload for ${doc.name}`}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}

                {/* Metadata + Summarise buttons — visible after successful parse */}
                {isSuccess && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Metadata */}
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="w-6 h-6 rounded hover:bg-[var(--theme-border)] flex items-center justify-center"
                      title="View metadata"
                      aria-label={`View metadata for ${doc.name}`}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </button>

                    {/* Summarise */}
                    <button
                      onClick={() => handleSummarize(doc)}
                      className="w-6 h-6 rounded hover:bg-[var(--theme-border)] flex items-center justify-center"
                      title="AI Summarize"
                      aria-label={`Summarize ${doc.name}`}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PDF Metadata modal ───────────────────────────────────────── */}
      {selectedDoc && (
        <PDFMetadataModal
          isOpen={true}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
        />
      )}

      {/* ── AI Summary modal ──────────────────────────────────────────── */}
      {summaryData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                AI Summary
              </h3>
              <button
                onClick={() => setSummaryData(null)}
                className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                aria-label="Close summary"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mb-3">
              {summaryData.name}
            </p>
            <div className="flex-1 overflow-y-auto text-[13px] text-[var(--theme-text)] leading-relaxed whitespace-pre-wrap">
              {summaryData.summary}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSummaryData(null)}
                className="px-4 py-1.5 rounded-lg bg-white/[0.05] border border-[var(--theme-border)] text-[11px] font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) return content;

  return (
    <aside className="w-72 border-l border-[var(--theme-border)] bg-[var(--theme-bg)] h-full flex flex-col shrink-0">
      {content}
    </aside>
  );
}
