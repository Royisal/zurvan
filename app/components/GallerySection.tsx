"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type FileType = "all" | "image" | "video" | "audio";

interface GalleryFile {
  name: string;
  path: string;
  type: FileType;
}

interface GallerySectionProps {
  route: "love" | "passion" | "kindness";
  onAddMemory?: () => void;
  isUploading?: boolean;
}

const getFileType = (fileName: string): FileType => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return "image";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "aac", "m4a", "flac", "ogg"].includes(ext))
    return "audio";
  return "all";
};

export default function GallerySection({ route, onAddMemory, isUploading }: GallerySectionProps) {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [filter, setFilter] = useState<FileType>("all");
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<GalleryFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 4 rows x 3 columns

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(`/api/delete/${route}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      // Remove from state
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
      
      // Close lightbox if deleted file was open
      if (selectedFile?.name === fileName) {
        setSelectedFile(null);
      }

      setDeleteConfirm(null);
      showToast("File deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("Failed to delete file", "error");
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/gallery/${route}`);
        if (!response.ok) throw new Error("Failed to fetch files");

        const data: string[] = await response.json();
        const galleryFiles: GalleryFile[] = data.map((fileName) => ({
          name: fileName,
          path: `/api/files/${route}/${fileName}`,
          type: getFileType(fileName),
        }));

        setFiles(galleryFiles);
      } catch (error) {
        console.error("Error fetching gallery files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [route]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedFile(null);
    };

    if (selectedFile) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedFile]);

  const filtered =
    filter === "all" ? files : files.filter((f) => f.type === filter);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filterOptions: { value: FileType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "audio", label: "Audio" },
  ];

  return (
    <section className="w-[100%] md:min-h-[60vh]">
      <div className="mb-6 flex flex-row justify-between items-center w-full mx-auto ">
        <div className="hidden md:flex flex-row items-center gap-[5px] ">
           <svg xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21" fill="none">
            <path d="M21.25 1.25H1.25L9.25 10.71V17.25L13.25 19.25V10.71L21.25 1.25Z" stroke="#1E1E1E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          <span className="font-['Kanit'] font-normal text-xl leading-[30px] text-[#161616] ">
           
            Filters
            
        </span>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-1.5 md:gap-5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex flex-row justify-center cursor-pointer items-center py-1 px-2 md:py-[15px] md:px-[30px] gap-1 md:gap-2 rounded-[10px] border font-['Kanit'] font-normal text-xs md:text-xl leading-[30px] transition-colors ${
                filter === opt.value
                  ? "bg-[#FFF6F5] border-[#A50019] text-[#A50019]"
                  : "bg-white border-[#171717] text-[#171717] hover:bg-[#FFF6F5] hover:border-[#A50019] hover:text-[#A50019]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-[100%] ">
          <div className="grid grid-cols-3 auto-rows-fr gap-[5px] w-full mx-auto ">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div
                key={i}
                className="w-full aspect-square animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No files found in this category.
        </div>
      ) : (
        <div className="w-full min-h-0">
          <div className="grid grid-cols-3 gap-[5px] w-full  auto-rows-fr">
            {paginatedFiles.map((file) => (
              <div
                key={file.path}
                className="group relative overflow-hidden bg-white cursor-pointer w-full aspect-square select-none touch-manipulation"
                onClick={() => setSelectedFile(file)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {file.type === "image" ? (
                  <div className="relative w-full h-full overflow-hidden bg-gray-200">
                    <Image
                      src={file.path}
                      alt={file.name}
                      fill
                      className="object-cover transition group-hover:scale-105 group-active:scale-105 group-focus-within:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      unoptimized
                      placeholder="empty"
                    />
                </div>
              ) : file.type === "video" ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    <source src={`${file.path}#t=0.5`} />
                  </video>
                  <div className="absolute inset-0 md:inset-0 bottom-12 md:bottom-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 group-active:bg-black/50 group-focus-within:bg-black/50 transition-colors">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-[#A50019] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : file.type === "audio" ? (
                <div className="relative w-full h-full bg-gradient-to-br from-white via-[#FFF6F5] to-[#A50019] flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/5"></div>
                  <div className="relative z-10 text-center pb-12 md:pb-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 md:w-24 md:h-24 mx-auto mb-2 md:mb-4 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center border-2 border-[#A50019]/20">
                      <svg
                        className="w-6 h-6 md:w-12 md:h-12 text-[#A50019]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2.5a1 1 0 00-.804.98V13a3 3 0 100 2v-7.22l8-2V11a3 3 0 100 2V3z" />
                      </svg>
                    </div>
                    <div className="px-2 md:px-4 hidden md:block">
                      <p className="text-[#171717] font-['Kanit'] font-bold text-sm md:text-lg mb-1">Audio File</p>
                      <p className="text-[#171717]/70 text-xs md:text-sm truncate max-w-[150px] md:max-w-[200px] mx-auto">{file.name.replace(/\.[^/.]+$/, "")}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus-within:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-[#A50019] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-white p-3 transition-all duration-300 ease-out group-hover:translate-y-0 md:translate-y-full md:group-hover:translate-y-0">
                <p className="truncate font-['Kanit'] text-xs md:text-base text-black flex-1 pr-2">
                  {file.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(file.name);
                  }}
                  className="flex-shrink-0 text-black hover:text-red-500 transition-colors"
                >
                  <svg className="w-3 h-3 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            ))}
          </div>

          {/* Mobile Add Memory Button */}
          {onAddMemory && (
            <div className="md:hidden flex justify-end  mt-6">
              <button 
                className="flex items-center justify-center w-12 h-12 bg-[#A50019] rounded-[10px] disabled:opacity-60 cursor-pointer shadow-lg"
                onClick={onAddMemory}
                disabled={isUploading}
                aria-label={isUploading ? "Adding memory" : "Add memory"}
              >
                <span className="sr-only">
                  {isUploading ? "Adding..." : "Add Memory"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
                  <path d="M2 2H15V9H17V2C17 0.897 16.103 0 15 0H2C0.897 0 0 0.897 0 2V14C0 15.103 0.897 16 2 16H10V14H2V2Z" fill="white"/>
                  <path d="M6 8L3 12H14L10 6L7 10L6 8Z" fill="white"/>
                  <path d="M17 11H15V14H12V16H15V19H17V16H20V14H17V11Z" fill="white"/>
                </svg>
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-row justify-center items-center gap-2 mt-8 mb-6 ">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-[10px] border border-[#171717] text-[#171717] font-['Kanit'] font-normal text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFF6F5] transition-colors"
              >
                ← Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-[5px] font-['Kanit'] font-normal text-sm transition-colors ${
                      currentPage === page
                        ? "bg-[#A50019] text-white"
                        : "border border-[#171717] text-[#171717] hover:bg-[#FFF6F5]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-[10px] border border-[#171717] text-[#171717] font-['Kanit'] font-normal text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFF6F5] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {selectedFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFile.type === "image" ? (
              <div className="relative w-full">
                <div className="relative aspect-video w-full">
                  <Image
                    src={selectedFile.path}
                    alt={selectedFile.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            ) : selectedFile.type === "video" ? (
              <div className="relative w-full max-w-3xl mx-auto">
                <video
                  className="w-full h-auto object-contain rounded-lg"
                  controls
                  autoPlay
                  controlsList="nodownload"
                >
                  <source src={selectedFile.path} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : selectedFile.type === "audio" ? (
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-white via-[#FFF6F5] to-[#A50019] rounded-lg overflow-hidden p-12">
                  <div className="absolute inset-0 bg-black/5"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                    <div className="w-32 h-32 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center border-4 border-[#A50019]/30">
                      <svg
                        className="w-16 h-16 text-[#A50019]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2.5a1 1 0 00-.804.98V13a3 3 0 100 2v-7.22l8-2V11a3 3 0 100 2V3z" />
                      </svg>
                    </div>
                    <div className="text-center px-4">
                      <h3 className="text-[#171717] font-['Playfair_Display'] font-black text-3xl mb-2">Now Playing</h3>
                      <p className="text-[#171717]/80 font-['Kanit'] text-lg mb-6 max-w-md truncate">{selectedFile.name}</p>
                    </div>
                    <audio controls autoPlay className="w-full max-w-md">
                      <source src={selectedFile.path} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            ) : null}

            <p className="mt-2 text-center text-white text-sm truncate">
              {selectedFile.name}
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-[10px] p-8 max-w-md w-full shadow-2xl animate-[scale-in_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <svg className="w-8 h-8 text-[#A50019]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-['Playfair_Display'] font-black text-2xl text-center text-[#171717] mb-2">
              Delete File?
            </h3>
            <p className="font-['Kanit'] font-normal text-base text-center text-[#171717] mb-6">
              Are you sure you want to delete <span className="font-bold">"{deleteConfirm}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 px-6 rounded-[10px] border border-[#171717] bg-white text-[#171717] font-['Kanit'] font-normal text-base hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 px-6 rounded-[10px] bg-[#A50019] text-white font-['Kanit'] font-normal text-base hover:bg-[#8a0015] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-[slide-in_0.3s_ease-out]">
          <div
            className={`flex items-center gap-3 py-4 px-6 rounded-[10px] shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-['Kanit'] font-normal text-base">{toast.message}</span>
          </div>
        </div>
      )}
    </section>
  );
}
