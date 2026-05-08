
import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson } from '../types';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  initialLessonId?: string;
  onProgressUpdate: (lessonId: string, isCompleted: boolean) => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack, initialLessonId, onProgressUpdate }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    if (initialLessonId) {
      const found = course.lessons.find(l => l.id === initialLessonId);
      if (found) return found;
    }
    return course.lessons[0];
  });

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Player state
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Effect to update if prop changes
  useEffect(() => {
    if (initialLessonId) {
       const found = course.lessons.find(l => l.id === initialLessonId);
       if (found) {
         setActiveLesson(found);
         setIsPlaying(false);
       }
    }
  }, [initialLessonId, course]);

  // Handle Play/Pause
  const handlePlayPause = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: command,
        args: []
      }), '*');
      setIsPlaying(!isPlaying);
    }
  };

  // Handle Confirm Action with auto-redirect
  const handleConfirmComplete = async () => {
    setIsAnimating(true);
    
    // Simulate minor delay for UX feeling
    setTimeout(() => {
      onProgressUpdate(activeLesson.id, true);
      
      setActiveLesson(prev => ({
        ...prev,
        isCompleted: true
      }));
      setIsAnimating(false);
      setShowCompleteModal(false);

      // Auto-redirect to next lesson if it exists
      if (nextLesson) {
        setTimeout(() => {
          setActiveLesson(nextLesson);
          setIsPlaying(false);
        }, 800);
      }
    }, 1000);
  };

  // Find next lesson
  const activeLessonIndex = course.lessons.findIndex(l => l.id === activeLesson.id);
  const nextLesson = course.lessons[activeLessonIndex + 1];
  const progressLabel = `${activeLessonIndex + 1} of ${course.lessons.length}`;

  // Construct YouTube URL with origin for API security
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const videoSrc = `https://www.youtube.com/embed/Myr2DVUwaXk?enablejsapi=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&origin=${origin}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1000px] mx-auto h-screen overflow-hidden flex flex-col bg-white shadow-xl shadow-slate-200/50 relative">
        {/* Video Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
            <div className="flex items-center space-x-3">
              <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition-colors">
                <i className="fi fi-rr-angle-left flex items-center justify-center"></i>
              </button>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight text-sm line-clamp-1">{course.title}</h1>
                <p className="text-[10px] text-slate-500 line-clamp-1">{activeLesson.title}</p>
              </div>
            </div>
            <div className="flex items-center bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
               <i className="fi fi-rr-book-open-reader text-emerald-600 text-xs mr-2"></i>
               <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{progressLabel}</span>
            </div>
          </div>

          {/* Player */}
          <div className="w-full bg-black aspect-video relative group shrink-0 overflow-hidden select-none">
            <iframe
              ref={iframeRef}
              className="w-full h-full object-cover pointer-events-none scale-105" 
              src={videoSrc}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            {/* Main Click Overlay - Always present to toggle play/pause */}
            <div 
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={handlePlayPause}
            ></div>

            {/* Centered Play Button (Visible only when paused) */}
            {!isPlaying && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none transition-opacity duration-300"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform animate-in zoom-in duration-300">
                  <i className="fi fi-rr-play text-white text-3xl ml-1 leading-none"></i>
                </div>
              </div>
            )}
            
            {/* Custom Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col space-y-4 transition-all duration-300 z-30 ${isPlaying ? 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100 translate-y-0'}`}>
              {/* Progress Bar (Visual Demo) */}
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress relative" onClick={(e) => e.stopPropagation()}>
                <div className="bg-emerald-500 h-full w-1/3 relative transition-all">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 scale-0 group-hover/progress:scale-100 transition-all"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-5 md:space-x-8">
                  <button onClick={handlePlayPause} className="hover:text-emerald-400 transition-colors focus:outline-none flex items-center">
                    {isPlaying ? (
                       <i className="fi fi-rr-pause text-2xl"></i>
                    ) : (
                       <i className="fi fi-rr-play text-2xl"></i>
                    )}
                  </button>
                  
                  {/* Volume (Mock) */}
                  <div className="group/vol flex items-center space-x-3">
                     <button className="focus:outline-none hover:text-emerald-400 transition-colors"><i className="fi fi-rr-volume-high text-xl"></i></button>
                     <div className="hidden md:block w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                        <div className="h-1 bg-white/30 rounded-full w-20 ml-1">
                           <div className="h-full bg-emerald-500 w-2/3 rounded-full"></div>
                        </div>
                     </div>
                  </div>

                  <span className="text-[10px] md:text-xs font-bold tracking-widest tabular-nums font-mono opacity-80">04:20 / {activeLesson.duration}</span>
                </div>
                
                <div className="flex items-center space-x-5">
                  <button className="text-[10px] font-bold bg-white/10 hover:bg-emerald-600/30 px-3 py-1.5 rounded-lg border border-white/5 transition-all">1.25x</button>
                  <button className="hover:text-emerald-400 transition-transform hover:scale-110 active:scale-95 focus:outline-none">
                    <i className="fi fi-rr-expand text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area below video */}
          <div className="p-6 md:p-10 text-slate-800 max-w-3xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
              <h2 className="serif-font text-2xl md:text-3xl font-bold tracking-tight text-emerald-950">{activeLesson.title}</h2>
              <div className="shrink-0">
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border transition-all duration-500 shadow-sm ${
                    activeLesson.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10'
                  }`}
                >
                  <i className={`fi ${activeLesson.isCompleted ? 'fi-rr-check-circle' : 'fi-rr-circle'} text-lg`}></i>
                  <span className="text-sm font-bold tracking-tight">
                    {activeLesson.isCompleted ? 'Topic Completed' : 'Mark as Complete'}
                  </span>
                </button>
              </div>
            </div>

            <div className="prose max-w-none text-slate-600 leading-relaxed mb-12 text-sm md:text-base">
              <p className="mb-6 opacity-80 font-medium">
                In this segment of the curriculum, we delve into the rigorous methodologies used by traditional scholars. 
                Emphasis is placed on understanding the context of the revelation and its application in contemporary jurisprudence.
              </p>
              
              <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 flex items-start space-x-5 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 text-emerald-100 opacity-50 group-hover:scale-110 transition-transform duration-700">
                    <i className="fi fi-rr-quote-right text-8xl"></i>
                </div>
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/20 z-10">
                   <i className="fi fi-rr-comment-info text-2xl"></i>
                </div>
                <div className="z-10">
                  <h4 className="font-bold text-emerald-900 mb-2 uppercase text-xs tracking-widest">Scholar's Insight</h4>
                  <p className="text-emerald-800 text-sm md:text-base leading-relaxed italic serif-font">
                    "Seeking knowledge is a form of worship. The refinement of one's character through that knowledge is the ultimate fruit of the scholarship."
                  </p>
                </div>
              </div>
            </div>

            {/* Next Video Section */}
            {nextLesson && (
              <div className="mt-6 pt-10 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Up Next</h3>
                </div>
                <button 
                  onClick={() => setActiveLesson(nextLesson)}
                  className="w-full bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-2xl hover:shadow-emerald-600/5 rounded-[2rem] p-5 flex items-center text-left transition-all group overflow-hidden"
                >
                  <div className="w-24 h-16 md:w-40 md:h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img src={nextLesson.thumbnail || course.thumbnail} alt={nextLesson.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                        <i className="fi fi-rr-play text-emerald-600 text-lg ml-0.5"></i>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Topic {activeLessonIndex + 2}</span>
                    <h4 className="font-bold text-slate-900 text-lg md:text-xl group-hover:text-emerald-700 transition-colors truncate mb-1">{nextLesson.title}</h4>
                    <div className="flex items-center text-slate-400 text-xs font-medium">
                        <i className="fi fi-rr-clock-three mr-2 text-[10px]"></i>
                        {nextLesson.duration}
                    </div>
                  </div>
                  <div className="ml-4 hidden md:block">
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                       <i className="fi fi-rr-arrow-right text-xl"></i>
                     </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md transition-opacity" onClick={() => !isAnimating && setShowCompleteModal(false)}></div>
             <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_20px_50px_rgba(26,71,49,0.3)] relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden text-center border border-white/50">
                {isAnimating ? (
                  <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8 relative">
                       <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-[ping_1.5s_infinite] opacity-30"></div>
                       <i className="fi fi-rr-check text-4xl text-emerald-600"></i>
                    </div>
                    <h3 className="serif-font font-bold text-emerald-950 text-2xl mb-2">Excellent Work!</h3>
                    <p className="text-emerald-600/60 text-sm font-bold uppercase tracking-widest">Marking complete...</p>
                  </div>
                ) : (
                  <div>
                     <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                        <i className="fi fi-rr-trophy-star text-3xl text-emerald-600"></i>
                     </div>
                     <h3 className="serif-font font-bold text-slate-900 text-2xl mb-3">Topic Finished?</h3>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-4">
                        Confirm completion to save your progress and unlock your next step in the journey.
                     </p>
                     <div className="flex flex-col space-y-3">
                       <button 
                         onClick={handleConfirmComplete}
                         className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                       >
                         Complete Topic
                       </button>
                       <button 
                         onClick={() => setShowCompleteModal(false)}
                         className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors"
                       >
                         Back to Lesson
                       </button>
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
