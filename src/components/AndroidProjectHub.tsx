import React, { useState } from 'react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../androidCodeBundle';
import { sound } from '../audio/soundSystem';

interface AndroidProjectHubProps {
  onClose: () => void;
}

export const AndroidProjectHub: React.FC<AndroidProjectHubProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>(ANDROID_PROJECT_FILES[0].path);
  const [activeTab, setActiveTab] = useState<'files' | 'guide'>('files');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const activeEntry = ANDROID_PROJECT_FILES.find((f) => f.path === selectedFile) || ANDROID_PROJECT_FILES[0];

  const handleDownloadZip = async () => {
    sound.playPowerUp();
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('SkylineRush-Android');

      for (const file of ANDROID_PROJECT_FILES) {
        rootFolder?.file(file.path, file.content);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SkylineRush-RiftRunner-Android.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP archive', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(activeEntry.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Native Android Studio Project Hub"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none"
    >
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#0A0D14] border border-cyan-500/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#121824] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-lg font-bold text-white font-['Orbitron'] flex items-center gap-2">
                NATIVE ANDROID PROJECT HUB
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono rounded">
                  SDK 35 · Compose · Unity Ads
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Package: <code className="text-cyan-400">com.aizoid.skylinerush</code> · 100% Native Kotlin
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>⬇</span>
              {isExporting ? 'Generating ZIP...' : 'Download Project (.ZIP)'}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 py-2.5 bg-[#0f1420] border-b border-white/10 flex items-center space-x-6 text-xs">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('files');
            }}
            className={`pb-1 font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SOURCE CODE INSPECTOR ({ANDROID_PROJECT_FILES.length} FILES)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('guide');
            }}
            className={`pb-1 font-bold tracking-wider transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            APK BUILD & INSTALLATION GUIDE
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'files' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar File Tree */}
            <div className="w-80 bg-[#0d121c] border-r border-white/10 overflow-y-auto p-3 space-y-1 text-xs font-mono">
              <div className="text-[11px] text-gray-500 font-bold px-2 py-1 uppercase tracking-wider">
                Android Project Tree
              </div>
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = file.path === selectedFile;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      sound.playClick();
                      setSelectedFile(file.path);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg truncate transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-xs">
                      {file.category === 'gradle' ? '🐘' : file.category === 'kotlin' ? '🔷' : file.category === 'manifest' ? '📄' : '🧪'}
                    </span>
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col bg-[#070a10] overflow-hidden">
              <div className="px-4 py-2 bg-[#121824] border-b border-white/10 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="text-cyan-400">{activeEntry.path}</span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-cyan-300 rounded border border-cyan-500/30 transition-all cursor-pointer"
                >
                  {copySuccess ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-gray-300 leading-relaxed">
                <code>{activeEntry.content}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8 overflow-y-auto bg-[#070a10] text-gray-300 space-y-6 text-sm">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              ⚠️ <strong>Note:</strong> An AI Studio web preview runs in an HTML5/React sandbox for immediate testing and is not proof of a native APK build or live ad impressions. Follow the steps below to compile and run on your physical Android device.
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-cyan-400 font-['Orbitron']">
                Step-by-Step Android Studio Build Instructions
              </h3>

              <ol className="list-decimal list-inside space-y-3 leading-relaxed text-xs">
                <li>
                  <strong className="text-white">Download & Extract:</strong> Click the{' '}
                  <span className="text-cyan-400">"Download Project (.ZIP)"</span> button above and extract the zip archive into your projects directory.
                </li>
                <li>
                  <strong className="text-white">Open in Android Studio:</strong> Launch Android Studio (Ladybug 2024.2+ recommended), choose{' '}
                  <em>Open an existing project</em>, and select the extracted <code className="text-cyan-300">SkylineRush-Android</code> folder.
                </li>
                <li>
                  <strong className="text-white">Gradle Sync:</strong> Android Studio will automatically resolve Gradle 8.7.3, Kotlin 2.0.21, Jetpack Compose BOM, and the official <code className="text-cyan-300">com.unity3d.ads:unity-ads:4.12.5</code> dependency.
                </li>
                <li>
                  <strong className="text-white">Configure Unity Ads Identifiers:</strong> Open{' '}
                  <code className="text-cyan-300">app/src/main/java/com/aizoid/skylinerush/core/config/AdConfiguration.kt</code>.
                  Replace <code className="text-amber-300">UNITY_ANDROID_GAME_ID = "5565465"</code> with your production Game ID from the Unity Monetization dashboard when publishing.
                </li>
                <li>
                  <strong className="text-white">Build Debug APK:</strong> In Android Studio menu, click{' '}
                  <code className="text-gray-200">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</code>.
                  Alternatively, in the terminal run: <code className="text-cyan-400">./gradlew assembleDebug</code>.
                </li>
                <li>
                  <strong className="text-white">Locate the APK:</strong> Your output APK is generated at:{' '}
                  <code className="text-cyan-300">app/build/outputs/apk/debug/app-debug.apk</code>.
                </li>
                <li>
                  <strong className="text-white">Install on Android Device:</strong> Connect your Android device with USB Debugging enabled and run:{' '}
                  <code className="text-cyan-400">adb install -r app/build/outputs/apk/debug/app-debug.apk</code>.
                </li>
                <li>
                  <strong className="text-white">Test Controls & Ads:</strong> Play through 3-lane runs, trigger swipes and jumps, test the Rewarded Revive dialog, and verify that test ads load with genuine Unity Ads callbacks.
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
