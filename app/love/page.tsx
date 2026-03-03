"use client";

import { useRef, useState, useEffect } from "react";
import GallerySection from "../components/GallerySection";

type ToastType = "success" | "error";

type ToastState = {
  type: ToastType;
  message: string;
} | null;

export default function RouteOnePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = '/assets/romantic.jpg';
  }, []);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddMemoryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch("/api/upload/love", {
        method: "POST",
        body: data,
      });

      const payload = await response.json();

      if (!response.ok) {
        showToast("error", payload?.error ?? "Upload failed.");
        return;
      }

      showToast("success", `Memory added: ${payload.path}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.location.reload();
    } catch {
      showToast("error", "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <main className="w-full relative">
      <div className="absolute inset-0 bg-cover bg-top bg-no-repeat bg-fixed transition-opacity duration-500" style={{ backgroundImage: bgLoaded ? 'url(/assets/romantic.jpg)' : 'none', opacity: bgLoaded ? 0.5 : 0 }} />
      <div className="flex flex-col items-start gap-6 md:gap-[55px] max-w-[1354px] mx-auto px-3 md:px-12 py-4 md:py-8 relative z-10">
      <div className="flex flex-row justify-center items-start gap-6 md:gap-[55px] w-full ">
        <div className="flex flex-col items-start gap-4 md:gap-[30px] ">
          <div className="w-[120px] h-[52px] md:w-[192.17px] md:h-[83.05px] "><div className="flex flex-col items-start gap-4 md:gap-[30px]">
          <div className="w-[120px] h-[52px] md:w-[192.17px] md:h-[83.05px] ">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 193 84" fill="none">
                <path d="M118.157 56.759C113.165 44.6869 112.596 34.8759 118.586 23.2492C128.825 3.44784 154.277 -0.572848 174.301 10.3971C193.215 20.7611 195.427 43.4087 177.364 48.595C164.696 52.2332 145.266 47.9629 144.175 37.6969C143.657 32.7676 146.274 27.7216 152.232 26.5681C157.006 25.6617 162.782 27.2512 164.258 30.6488C167.762 38.7536 151.825 39.09 151.825 39.09C151.825 39.09 164.646 44.5246 171.866 37.7764C176.755 33.1907 172.999 27.0548 167.034 23.1442C153.974 14.6148 133.311 23.6475 128.224 39.0093C122.157 57.326 139.784 79.1414 139.784 79.1414C139.784 79.1414 122.795 67.9718 118.157 56.759Z" fill="#EA0029"/>
                <path d="M139.621 34.6204C140.316 33.0239 141.111 31.5305 142.027 30.1C137.767 44.5586 146.401 60.7311 161.739 66.5889C164.167 67.5193 166.64 68.1452 169.077 68.4656C169.797 65.1408 172.945 62.7463 176.912 62.8043C181.632 62.8733 185.731 66.411 186.075 70.7072C186.314 73.802 184.526 76.4401 181.741 77.6399C181.144 78.1193 180.284 78.4931 179.081 78.6992C172.552 79.9257 165.52 79.3754 158.823 76.7353C141.203 69.7663 132.587 50.9095 139.601 34.5997" fill="#EA0029"/>
                <path d="M21.8331 11.9246L21.8553 4.42685L10.7017 4.3949C6.83075 4.38201 2.99281 6.59937 2.97454 10.84L2.90389 33.6175L12.0236 33.6416L12.0789 14.908C12.0858 12.9407 13.2382 11.9082 15.2939 11.9165L21.8331 11.9246Z" fill="#231F20"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M57.233 10.991C57.2522 6.68476 54.8789 4.46401 49.6738 4.45348L33.7747 4.39586C28.4821 4.38404 26.132 6.55757 26.1131 10.8419L26.0676 27.4115C26.0516 31.4991 28.4262 33.6325 33.8718 33.6465L49.7054 33.7032C54.8667 33.7131 57.1715 31.6482 57.191 27.3201L57.2327 11.0128M38.3337 26.1481C36.2561 26.1395 35.137 24.899 35.1461 22.7787L35.1705 15.1279C35.1784 13.095 36.3758 11.9757 38.4315 11.9839L44.4675 12.0066C46.6544 12.0167 48.216 12.914 48.2062 15.078L48.1789 22.9255C48.1692 25.0896 46.7753 26.1841 44.5228 26.173L38.29 26.1474L38.3337 26.1481Z" fill="#231F20"/>
                <path d="M108.77 4.42371L99.7167 4.39557L99.626 33.6853L108.679 33.7134L108.77 4.42371Z" fill="#231F20"/>
                <path d="M57.0238 55.0732C57.0446 50.6577 54.9752 48.5945 50.2074 48.5903L34.9861 48.5426L34.9909 45.2199L57.1013 45.2809L57.1235 37.7831L33.5918 37.7013C28.3211 37.6898 26.0151 39.8421 25.9968 44.0828L25.9825 49.5477C25.9636 53.832 28.3156 56.0088 33.6079 56.0424L48.0858 56.0793L48.08 59.4676L26.5162 59.4145L26.494 66.9123L50.1573 66.9742C54.8591 66.9992 57.0114 64.8884 57.0094 60.5381L57.0238 55.0732Z" fill="#231F20"/>
                <path d="M61.885 72.6108C61.8657 76.917 64.1532 79.0272 69.3142 79.059L85.1478 79.1156C90.5715 79.1294 92.9872 76.9568 92.9843 72.6721L93.0259 56.3648C93.0448 52.0805 90.649 49.9031 85.2256 49.8675L63.3557 49.81L63.3332 57.3297L81.2007 57.3942C82.7969 57.4176 83.9665 58.1998 83.9644 59.8393L83.9413 61.4129L69.1792 61.3719C64.2802 61.3659 61.9051 63.7576 61.8959 68.8728L61.885 72.6108ZM83.9314 69.5667C83.9107 70.9873 82.8531 71.5184 81.5846 71.5217L73.3398 71.4886C72.0934 71.4703 70.8753 71.0153 70.8752 69.5288C70.8998 67.8459 72.0879 67.3605 73.3561 67.379L81.6231 67.3906C82.9351 67.4098 83.9541 68.0149 83.9556 69.414L83.9533 69.567L83.9314 69.5667Z" fill="#231F20"/>
                <path d="M108.688 37.8132L99.6131 37.7881L99.501 79.0358L108.575 79.0358L108.688 37.8132Z" fill="#231F20"/>
                <path d="M71.9493 23.0605L71.9206 19.0378L71.9595 4.41371L70.6475 4.39452C65.3328 4.40424 62.9396 6.53343 62.9217 10.7522L62.88 27.0595C62.8602 31.4094 65.2769 33.6526 70.5694 33.6645L84.9817 33.7004L84.9587 35.274C84.9778 36.9575 83.7213 37.6387 82.081 37.6365L62.8575 37.574L62.8344 45.1374L85.076 45.2003C91.1995 45.2243 94.0132 42.7515 94.0385 38.03L94.1359 4.45383L85.191 4.43232L85.0428 19.0548L85.0261 26.181L75.5346 26.1515C73.3914 26.142 71.9626 25.1374 71.9715 23.039" fill="#231F20"/>
                </svg>     
            </div>
        </div></div>
        </div>
      </div>
      
      <div className="flex flex-row items-end gap-2.5 w-full">
        <div className="flex flex-col items-start gap-2.5 flex-1">
          <h1 className="font-['Playfair_Display'] font-black text-2xl md:text-[56px] leading-[120%] text-[#A50019] w-full ">Royi Sal Digital Inheritance</h1>
          <p className="font-['Kanit'] font-normal text-base md:text-2xl leading-[150%] text-[#171717]">I will remember you forever</p>
          
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*"
        />
        <button 
          className="hidden md:flex flex-row justify-center items-center px-6 py-3 gap-2 bg-[#A50019] rounded-[10px] disabled:opacity-60 cursor-pointer"
          onClick={handleAddMemoryClick}
          disabled={isUploading}
        >
          <span className="font-['Kanit'] font-normal text-sm md:text-2xl leading-[150%] text-[#FFF6F5]">
            {isUploading ? "Adding..." : "Add Memory"}
          </span>
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
            <path d="M2 2H15V9H17V2C17 0.897 16.103 0 15 0H2C0.897 0 0 0.897 0 2V14C0 15.103 0.897 16 2 16H10V14H2V2Z" fill="white"/>
            <path d="M6 8L3 12H14L10 6L7 10L6 8Z" fill="white"/>
            <path d="M17 11H15V14H12V16H15V19H17V16H20V14H17V11Z" fill="white"/>
            </svg>
        </button>
      </div>

      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded px-4 py-3 text-sm text-white shadow-md ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
      <div className="relative overflow-y-auto md:overflow-visible w-full">
        <GallerySection route="love" onAddMemory={handleAddMemoryClick} isUploading={isUploading} />
      </div>
      </div>
    </main>
  );
}
