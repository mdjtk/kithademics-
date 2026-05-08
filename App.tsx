
import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import CourseCard from './components/CourseCard';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AdminPortal from './pages/AdminPortal';
import { COURSES as INITIAL_COURSES } from './constants';
import { Course, UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [user, setUser] = useState<any>({
    uid: 'demo-user-123',
    displayName: 'Ammar Ahmed',
    email: 'scholar@kithademics.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ammar'
  });
  const [isAdmin, setIsAdmin] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [recentlyWatchedId, setRecentlyWatchedId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [allProgress, setAllProgress] = useState<Record<string, string[]>>({});
  const [spotlightData, setSpotlightData] = useState<any>({
    title: "The Path of Knowledge",
    quote: "He who treads a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    author: "Prophet Muhammad (ﷺ)",
    imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop"
  });

  // Sync state when progress changes (Local Only Logic)
  useEffect(() => {
    if (Object.keys(allProgress).length > 0) {
      setCourses(prevCourses => prevCourses.map(course => {
        const completedIds = allProgress[course.id] || [];
        const lessons = course.lessons.map(lesson => ({
          ...lesson,
          isCompleted: completedIds.includes(lesson.id)
        }));
        const progressPercent = lessons.length > 0 
          ? Math.round((lessons.filter(l => l.isCompleted).length / lessons.length) * 100)
          : 0;
        
        return {
          ...course,
          lessons,
          progress: progressPercent
        };
      }));
    }
  }, [allProgress]);

  const handleLogout = async () => {
    setUser(null);
    setShowLanding(true);
    setRecentlyWatchedId(null);
    setIsAdmin(false);
    setActiveTab('home');
  };

  const handleRefreshCourses = async () => {
    // Local refresh (no-op for demo)
  };

  const handleCourseClick = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;

    if (course.isLocked) {
      const message = `Assalamu Alaikum, I am interested in purchasing the course: "${course.title}". Please assist me.`;
      const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    setSelectedCourseId(id);
    setActiveTab('course-detail');
  };

  const handlePlayLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab('player');
    
    if (selectedCourseId && user) {
      setRecentlyWatchedId(selectedCourseId);
    }
  };

  const handleContinueCourse = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    
    if (course.isLocked) {
        handleCourseClick(id);
        return;
    }

    setSelectedCourseId(id);
    const lessonToPlay = course.lessons.find(l => !l.isCompleted) || course.lessons[0];
    handlePlayLesson(lessonToPlay.id);
  };

  const handleBackToDashboard = () => {
    setSelectedCourseId(null);
    setActiveTab('home');
  };

  const handleBackToDetail = () => {
    setActiveTab('course-detail');
  };

  const handleSeeMoreCourses = () => {
    setActiveTab('courses');
  };

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  if (showLanding && !user) {
    return <Landing onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  const recentlyWatchedCourse = recentlyWatchedId 
    ? courses.find(c => c.id === recentlyWatchedId) 
    : null;

  // Header Component
  const Header = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-cream/90 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-emerald-900/5">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center cursor-pointer" 
        onClick={() => setActiveTab('home')}
      >
        <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center rotate-45 group transition-all duration-500 hover:rotate-[225deg]">
          <i className="fi fi-rr-star text-white text-xs -rotate-45 group-hover:rotate-[135deg] transition-all duration-500"></i>
        </div>
        <span className="ml-3 serif-font font-bold text-lg text-emerald-900 tracking-tight">Kithademics</span>
      </motion.div>
      <div className="flex items-center">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('profile')}
          className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-emerald-800' : 'text-emerald-dark opacity-60'}`}
        >
          <i className="fi fi-rr-user text-xl"></i>
        </motion.button>
      </div>
    </header>
  );

  // Bottom Navigation
  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 px-12 flex items-center justify-between z-50">
      {[
        { id: 'home', label: 'Home', icon: 'fi-rr-home' },
        { id: 'courses', label: 'Courses', icon: 'fi-rr-book-open-reader' },
        { id: 'profile', label: 'Profile', icon: 'fi-rr-user' }
      ].map(item => (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="flex flex-col items-center justify-center space-y-1 group flex-1 relative"
        >
          <motion.div 
            animate={{ 
              scale: activeTab === item.id ? 1.1 : 1,
              y: activeTab === item.id ? -2 : 0
            }}
            className={`p-1 transition-colors ${activeTab === item.id ? 'text-emerald-800' : 'text-slate-400'}`}
          >
            <i className={`fi ${item.icon} text-lg`}></i>
          </motion.div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === item.id ? 'text-emerald-800' : 'text-slate-300'}`}>
            {item.label}
          </span>
          {activeTab === item.id && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -top-1 w-1 h-1 bg-emerald-800 rounded-full"
            />
          )}
        </button>
      ))}
    </nav>
  );

  const ProfileView = () => {
    const myCourses = courses.filter(c => !c.isLocked);
    const completedLessonsCount = myCourses.reduce((acc, course) => acc + course.lessons.filter(l => l.isCompleted).length, 0);
    
    // Static demo profile
    const profile = {
      membershipType: 'admin',
      studyTimeHours: 42,
      streak: 12
    };

    const mainEnrollment = {
      expiresAt: { seconds: 1800000000 } // Far in the future
    };

    const membershipLabel = "System Administrator (Demo)";

    return (
      <div className="min-h-full flex flex-col bg-slate-50">
        <div className="bg-white p-8 pb-10 rounded-b-[3.5rem] shadow-xl mb-8 border-b border-emerald-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-50 rounded-full -ml-12 -mb-12 opacity-50"></div>
          
          <div className="flex flex-col items-center space-y-5 pt-4 relative z-10">
            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center border-4 border-emerald-50 shadow-2xl overflow-hidden group">
              <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Ahmed'}`} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            </div>
            <div className="text-center">
              <h2 className="serif-font text-3xl font-black text-emerald-950 tracking-tighter">{user?.displayName || 'Student'}</h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${profile?.membershipType === 'free' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700'}`}>
                  {membershipLabel}
                </span>
                <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest">ID: #{user?.uid.slice(0, 4).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-sm mx-auto">
            <div className="bg-white p-4 rounded-3xl text-center shadow-lg shadow-emerald-950/5 border border-slate-50">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-2">
                <i className="fi fi-rr-book-alt text-xs"></i>
              </div>
              <p className="text-xl font-black text-emerald-950 tracking-tighter">{myCourses.length}</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Library</p>
            </div>
            <div className="bg-white p-4 rounded-3xl text-center shadow-lg shadow-emerald-950/5 border border-slate-50">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mx-auto mb-2">
                <i className="fi fi-rr-trophy text-xs"></i>
              </div>
              <p className="text-xl font-black text-emerald-950 tracking-tighter">{completedLessonsCount}</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Mastery</p>
            </div>
            <div className="bg-white p-4 rounded-3xl text-center shadow-lg shadow-emerald-950/5 border border-slate-50">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-2">
                <i className="fi fi-rr-time-watched text-xs"></i>
              </div>
              <p className="text-xl font-black text-emerald-950 tracking-tighter">{profile?.studyTimeHours || 0}h</p>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Studied</p>
            </div>
          </div>
        </div>

        <div className="px-8 space-y-10 pb-20 flex-1">
          {/* Subscription Section */}
          {(profile?.membershipType === 'pro' || profile?.membershipType === 'admin') && (
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Access Status</h3>
              <div className="bg-emerald-950 text-white p-8 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-emerald-950/40 group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-800/20 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.4em] mb-2 text-glow">Premium Entitlement</p>
                          <h4 className="text-2xl font-black serif-font italic italic tracking-tight">Kithademics Unlimited</h4>
                      </div>
                      <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 px-4 py-1.5 rounded-full flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                        <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="space-y-px">
                          <p className="text-[10px] text-emerald-200/50 font-bold uppercase tracking-widest">Protection Period</p>
                          <p className="text-sm font-bold text-emerald-100">Expires: {mainEnrollment ? new Date(mainEnrollment.expiresAt.seconds * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Dec 31, 2026'}</p>
                       </div>
                       <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95">Support Portal</button>
                    </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* My Learning Section */}
          <section>
            <div className="flex items-center justify-between mb-6 ml-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Records</h3>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Enrolled in {myCourses.length} Academy{myCourses.length !== 1 && 's'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {myCourses.map(course => (
                 <motion.div 
                    key={course.id} 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleCourseClick(course.id)} 
                    className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-emerald-950/5 transition-all flex items-center space-x-4 cursor-pointer group"
                 >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-slate-50 shadow-inner">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                       <h4 className="text-sm font-black text-emerald-950 line-clamp-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{course.title}</h4>
                       <div className="flex items-center justify-between mt-3 mb-1.5">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{course.progress}% Intellectual Progress</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-emerald-500 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          />
                       </div>
                    </div>
                    <div className="pr-2">
                       <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-slate-100">
                         <i className="fi fi-rr-angle-small-right text-xl"></i>
                       </div>
                    </div>
                 </motion.div>
              ))}
              {myCourses.length === 0 && (
                 <div className="text-center py-16 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed group hover:border-emerald-200 transition-colors">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-300 transition-colors">
                       <i className="fi fi-rr-document-signed text-2xl"></i>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zero Academic Records Found</p>
                    <button onClick={() => setActiveTab('courses')} className="mt-4 text-emerald-600 text-[10px] font-black uppercase underline tracking-widest">Apply for Enrollment</button>
                 </div>
              )}
            </div>
          </section>

          {/* System Access Section */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden mb-10 border-b-8 border-b-emerald-950">
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className="w-full px-10 py-7 flex items-center justify-between hover:bg-emerald-50 transition-all border-b border-slate-50 group text-left active:bg-emerald-100"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-all group-hover:bg-emerald-950 group-hover:text-white shadow-inner group-hover:rotate-12">
                    <i className="fi fi-rr-rectangle-list text-2xl"></i>
                  </div>
                  <div>
                    <span className="block text-base font-black text-emerald-950 tracking-tight uppercase italic italic">Control Dashboard</span>
                    <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Administrative Privileges Active</span>
                  </div>
                </div>
                <i className="fi fi-rr-arrow-right text-emerald-200 group-hover:text-emerald-600 transition-all text-xl"></i>
              </button>
            )}
            
            <button className="w-full px-10 py-7 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 group text-left">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shadow-inner">
                  <i className="fi fi-rr-settings text-2xl"></i>
                </div>
                <div>
                  <span className="block text-base font-black text-slate-800 tracking-tight uppercase">Account Authority</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Parameters & Preferences</span>
                </div>
              </div>
              <i className="fi fi-rr-arrow-right text-slate-200 group-hover:text-emerald-600 transition-all text-xl"></i>
            </button>

            <button onClick={handleLogout} className="w-full px-10 py-7 flex items-center justify-between hover:bg-rose-50 transition-colors group text-left">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors shadow-inner">
                  <i className="fi fi-rr-exit text-2xl"></i>
                </div>
                <div>
                  <span className="block text-base font-black text-rose-600 tracking-tight uppercase">Secure Sign Out</span>
                  <span className="text-[9px] font-bold text-rose-400/60 uppercase tracking-widest">End Current Session</span>
                </div>
              </div>
              <i className="fi fi-rr-power text-rose-200 group-hover:text-rose-600 transition-all text-xl"></i>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const CoursesView = () => {
    const myCourses = courses.filter(c => !c.isLocked);
    const paidCourses = courses.filter(c => c.isLocked);

    return (
      <div className="min-h-full flex flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-end justify-between mb-8">
             <h1 className="serif-font text-2xl text-emerald-dark font-bold">Course Library</h1>
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{courses.length} Total</span>
          </div>
          
          {/* Purchased Courses */}
          <section className="mb-10">
             <div className="flex items-center space-x-3 mb-5">
                <h2 className="text-sm font-bold text-slate-800">My Learning</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{myCourses.length}</span>
             </div>
             {myCourses.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myCourses.map(course => (
                     <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
                  ))}
               </div>
             ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                   <p className="text-xs text-slate-400">You haven't enrolled in any courses yet.</p>
                </div>
             )}
          </section>

          {/* Suppression / Divider */}
          <div className="relative py-6 mb-10">
             <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
             </div>
             <div className="relative flex justify-center">
                <span className="bg-cream px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Explore Catalog</span>
             </div>
          </div>

          {/* Paid Courses */}
          <section>
             <div className="flex items-center space-x-3 mb-5">
                <h2 className="text-sm font-bold text-slate-800">Premium Courses</h2>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{paidCourses.length}</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paidCourses.map(course => (
                   <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
                ))}
             </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  };

  // Hide nav/header for player and course-detail view
  const showNav = activeTab !== 'player' && activeTab !== 'course-detail' && activeTab !== 'admin';

  return (
    <div className="flex flex-col h-screen bg-cream overflow-hidden">
      {showNav && <Header />}
      
      <main className={`flex-1 overflow-y-auto ${showNav ? 'pt-16 pb-20' : ''}`}>
        {activeTab === 'home' && (
          <Dashboard 
            onCourseClick={handleContinueCourse} 
            onCourseSelect={handleCourseClick}
            onSeeMore={handleSeeMoreCourses}
            recentlyWatched={recentlyWatchedCourse} 
            spotlightData={spotlightData}
            courses={courses}
          />
        )}
        
        {activeTab === 'courses' && <CoursesView />}

        {activeTab === 'admin' && (
          <AdminPortal 
            courses={courses} 
            onRefreshCourses={handleRefreshCourses}
            onBack={() => setActiveTab('home')} 
          />
        )}

        {activeTab === 'course-detail' && selectedCourseId && (
          <CourseDetail
            course={courses.find(c => c.id === selectedCourseId)!}
            onBack={handleBackToDashboard}
            onPlayLesson={handlePlayLesson}
          />
        )}
        
        {activeTab === 'profile' && <ProfileView />}
        
        {activeTab === 'player' && selectedCourseId && (
          <CoursePlayer 
            course={courses.find(c => c.id === selectedCourseId)!} 
            onBack={handleBackToDetail} 
            initialLessonId={selectedLessonId}
            onProgressUpdate={(lessonId, isCompleted) => {
              setAllProgress(prev => {
                const current = prev[selectedCourseId] || [];
                const next = isCompleted 
                  ? [...new Set([...current, lessonId])]
                  : current.filter(id => id !== lessonId);
                return { ...prev, [selectedCourseId]: next };
              });
            }}
          />
        )}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
};

export default App;
