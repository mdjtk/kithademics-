
import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Course, Lesson, Enrollment, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Timestamp } from 'firebase/firestore';

interface AdminPortalProps {
  courses: Course[];
  onRefreshCourses: () => void;
  onBack: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ courses, onRefreshCourses, onBack }) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'spotlight'>('courses');
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [spotlightForm, setSpotlightForm] = useState({
    title: '',
    quote: '',
    author: '',
    imageUrl: ''
  });

  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({
    id: '',
    title: '',
    duration: '',
    videoUrl: '',
    description: ''
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
    if (activeTab === 'spotlight') {
      firebaseService.getSpotlight().then(data => data && setSpotlightForm(data));
    }
  }, [activeTab]);

  const loadUsers = async () => {
    const data = await firebaseService.getAllUsers();
    if (data) setUsers(data);
  };

  const handleSaveCourse = async () => {
    if (!editingCourse?.title || !editingCourse?.id) return;
    setIsSaving(true);
    try {
      await firebaseService.saveCourse(editingCourse as Course);
      setEditingCourse(null);
      onRefreshCourses();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = () => {
    if (!lessonForm.title || !lessonForm.videoUrl) return;
    const newLesson: Lesson = {
      id: lessonForm.id || `lesson-${Date.now()}`,
      title: lessonForm.title,
      duration: lessonForm.duration || '0:00',
      isCompleted: false,
      videoUrl: lessonForm.videoUrl,
      description: lessonForm.description || '',
      thumbnail: lessonForm.thumbnail
    };

    setEditingCourse(prev => ({
      ...prev,
      lessons: [...(prev?.lessons || []), newLesson]
    }));
    setLessonForm({ title: '', duration: '', videoUrl: '', description: '', id: '' });
  };

  const handleRemoveLesson = (lessonId: string) => {
    setEditingCourse(prev => ({
      ...prev,
      lessons: (prev?.lessons || []).filter(l => l.id !== lessonId)
    }));
  };

  const handleSaveSpotlight = async () => {
    setIsSaving(true);
    try {
      await firebaseService.saveSpotlight(spotlightForm);
      alert('Spotlight applied successfully!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    await firebaseService.updateUserMembership(userId, role);
    loadUsers();
  };

  const handleSaveEnrollment = async (userId: string, courseId: string, enrollmentData: any) => {
    await firebaseService.updateEnrollment(userId, courseId, enrollmentData);
    loadUsers();
  };

  const formatDate = (ts: any) => {
    if (!ts) return 'N/A';
    if (ts instanceof Timestamp) return ts.toDate().toLocaleDateString();
    if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="bg-emerald-950 text-white pt-10 pb-20 px-8 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', 
          backgroundSize: '20px 20px' 
        }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black serif-font uppercase italic tracking-tighter">Command Center</h1>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-2">Kithademics Global Administration</p>
            </div>
            <button onClick={onBack} className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-xl">
              <i className="fi fi-rr-cross text-xl"></i>
            </button>
          </div>

          <div className="flex bg-emerald-900/40 backdrop-blur-md p-1.5 rounded-3xl border border-white/5 w-fit">
            {(['courses', 'users', 'spotlight'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-emerald-950 shadow-lg' : 'text-emerald-200/60 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-8 -mt-10 relative z-20">
        <AnimatePresence mode="wait">
          {activeTab === 'courses' && (
            <motion.div 
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-emerald-950/5">
                 <div>
                    <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Content Library</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Manage courses and lesson hierarchy</p>
                 </div>
                 <button 
                  onClick={() => setEditingCourse({ id: `course-${Date.now()}`, title: '', lessons: [], isLocked: false, price: '0', instructor: '' })}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                 >
                   Deploy New Course
                 </button>
              </div>

              {editingCourse ? (
                <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-100 shadow-2xl space-y-8">
                   <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                      <h3 className="text-xl font-black text-emerald-950">Editing Course Structure</h3>
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {editingCourse.id}</div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Course Title</label>
                        <input type="text" placeholder="e.g. Intro to Arabic" value={editingCourse.title || ''} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold text-emerald-950 placeholder:text-slate-300 focus:ring-2 ring-emerald-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Instructor Name</label>
                        <input type="text" placeholder="Dr. Ahmed" value={editingCourse.instructor || ''} onChange={e => setEditingCourse({...editingCourse, instructor: e.target.value})} className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold text-emerald-950 placeholder:text-slate-300 focus:ring-2 ring-emerald-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Thumbnail URL</label>
                        <input type="text" placeholder="https://..." value={editingCourse.thumbnail || ''} onChange={e => setEditingCourse({...editingCourse, thumbnail: e.target.value})} className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold text-emerald-950 placeholder:text-slate-300 focus:ring-2 ring-emerald-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Pricing Method</label>
                        <input type="text" placeholder="Free or $99" value={editingCourse.price || ''} onChange={e => setEditingCourse({...editingCourse, price: e.target.value})} className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold text-emerald-950 placeholder:text-slate-300 focus:ring-2 ring-emerald-100" />
                      </div>
                   </div>

                   {/* Lesson Builder */}
                   <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Lesson Curriculum</h4>
                      
                      <div className="bg-white p-6 rounded-[2rem] border border-emerald-100/50 shadow-sm space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Lesson Title" value={lessonForm.title || ''} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="p-4 bg-slate-50 rounded-2xl border-none text-xs font-bold" />
                            <input type="text" placeholder="Duration (e.g. 15:40)" value={lessonForm.duration || ''} onChange={e => setLessonForm({...lessonForm, duration: e.target.value})} className="p-4 bg-slate-50 rounded-2xl border-none text-xs font-bold" />
                         </div>
                         <input type="text" placeholder="YouTube/Video URL" value={lessonForm.videoUrl || ''} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs font-bold" />
                         <button onClick={handleAddLesson} className="w-full bg-emerald-100 text-emerald-700 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors">Attach to Curriculum</button>
                      </div>

                      <div className="space-y-3">
                        {editingCourse.lessons?.map((lesson, idx) => (
                          <div key={idx} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                               <span className="text-[10px] font-black text-slate-300">{idx + 1}</span>
                               <div>
                                  <p className="text-xs font-bold text-emerald-950">{lesson.title}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{lesson.duration}</p>
                               </div>
                            </div>
                            <button onClick={() => handleRemoveLesson(lesson.id)} className="w-8 h-8 rounded-xl opacity-0 group-hover:opacity-100 bg-rose-50 text-rose-500 flex items-center justify-center transition-opacity">
                               <i className="fi fi-rr-trash text-[10px]"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="flex items-center space-x-4 p-6 bg-emerald-50 rounded-[2rem]">
                      <div className="flex items-center space-x-3 flex-1">
                        <input type="checkbox" checked={editingCourse.isLocked} onChange={e => setEditingCourse({...editingCourse, isLocked: e.target.checked})} className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer" />
                        <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Restrict course to paid students only</span>
                      </div>
                   </div>

                   <div className="flex space-x-4 pt-6">
                      <button 
                        onClick={handleSaveCourse} 
                        disabled={isSaving}
                        className="flex-1 bg-emerald-950 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
                      >
                        {isSaving ? 'Syncing with Cloud...' : 'Commit Changes to Database'}
                      </button>
                      <button onClick={() => setEditingCourse(null)} className="px-10 bg-slate-100 text-slate-400 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">
                        Abort
                      </button>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {courses.map(course => (
                    <motion.div 
                      key={course.id} 
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden group border-b-4 border-b-transparent hover:border-b-emerald-400 transition-all"
                    >
                      <div className="relative h-44">
                        <img src={course.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white flex items-center space-x-2">
                           <span className={`w-1.5 h-1.5 rounded-full ${course.isLocked ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                           <span className="text-[9px] font-black text-emerald-950 uppercase tracking-widest">{course.isLocked ? 'Paid' : 'Free'}</span>
                        </div>
                      </div>
                      <div className="p-8">
                        <h4 className="text-base font-black text-emerald-950 serif-font leading-tight mb-2 line-clamp-1">{course.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-6">{course.lessons.length} Modules Curriculum</p>
                        <button 
                          onClick={() => setEditingCourse(course)} 
                          className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          Configure Course
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl max-w-4xl mx-auto flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black text-emerald-950">Student Management</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Authenticate, Enroll, and Monitor {users.length} unique profiles</p>
                 </div>
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <i className="fi fi-rr-users text-xl"></i>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                 {users.map(u => (
                   <motion.div 
                    layout
                    key={u.id} 
                    className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl group hover:shadow-2xl transition-all"
                   >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
                         <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 overflow-hidden ring-4 ring-white shadow-xl">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.displayName}`} className="w-full h-full object-cover" />
                            </div>
                            <div>
                               <h4 className="text-lg font-black text-emerald-950">{u.displayName}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center">
                                 <i className="fi fi-rr-envelope mr-2 text-emerald-500"></i>
                                 {u.email}
                               </p>
                            </div>
                         </div>
                         
                         <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3 mr-1">Rank:</span>
                            <select 
                              value={u.membershipType || 'free'} 
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="text-[10px] font-black uppercase tracking-widest bg-white text-emerald-700 border border-emerald-100 rounded-xl px-4 py-2 focus:ring-0 cursor-pointer shadow-sm"
                            >
                              <option value="free">Standard</option>
                              <option value="pro">Pro Member</option>
                              <option value="admin">System Admin</option>
                            </select>
                         </div>
                      </div>

                      <div className="pt-8">
                         <div className="flex items-center justify-between mb-6 px-1">
                            <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Course Enrollments</h5>
                            <button 
                              onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {selectedUser?.id === u.id ? 'Hide Details' : 'Manage Access'}
                              <i className={`fi fi-rr-angle-small-${selectedUser?.id === u.id ? 'up' : 'down'} ml-2`}></i>
                            </button>
                         </div>

                         {selectedUser?.id === u.id && (
                           <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100/50 space-y-4"
                           >
                              {courses.filter(c => c.isLocked).map(course => {
                                 const enrollment = u.enrollments?.find((e: any) => e.courseId === course.id);
                                 return (
                                   <div key={course.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                                      <div className="flex items-center space-x-4">
                                         <div className={`w-3 h-3 rounded-full ${enrollment?.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-200'}`}></div>
                                         <div>
                                            <p className="text-xs font-bold text-emerald-950">{course.title}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                              {enrollment ? `Expires: ${formatDate(enrollment.expiresAt)}` : 'Not Enrolled'}
                                            </p>
                                         </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-3">
                                         <button 
                                           onClick={() => handleSaveEnrollment(u.id, course.id, {
                                             status: 'active',
                                             enrolledAt: Timestamp.now(),
                                             expiresAt: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
                                           })}
                                           className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95"
                                         >
                                           Activate 1Y
                                         </button>
                                         <button 
                                           onClick={() => handleSaveEnrollment(u.id, course.id, { status: 'expired' })}
                                           className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors"
                                         >
                                           Revoke
                                         </button>
                                      </div>
                                   </div>
                                 );
                              })}
                           </motion.div>
                         )}
                      </div>
                   </motion.div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'spotlight' && (
            <motion.div 
              key="spotlight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-8"
            >
               <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-100 shadow-2xl space-y-10">
                  <div className="flex items-end space-x-6">
                    <div className="w-20 h-20 bg-emerald-950 rounded-3xl flex items-center justify-center text-emerald-400 rotate-12 shadow-xl">
                       <i className="fi fi-rr-magic-wand text-3xl"></i>
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-emerald-950 tracking-tighter serif-font italic italic mb-1 uppercase">Hero Experience</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Customize the main entry point</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Primary Spotlight Headline</label>
                        <input type="text" value={spotlightForm.title} onChange={e => setSpotlightForm({...spotlightForm, title: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] border-none text-sm font-bold text-emerald-950 focus:ring-2 ring-emerald-100" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Wisdom Quote of the Day</label>
                        <textarea value={spotlightForm.quote} onChange={e => setSpotlightForm({...spotlightForm, quote: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2.5rem] border-none text-sm font-bold text-emerald-950 min-h-[140px] focus:ring-2 ring-emerald-100 leading-relaxed" />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Tradition Source (Author)</label>
                           <input type="text" value={spotlightForm.author} onChange={e => setSpotlightForm({...spotlightForm, author: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] border-none text-sm font-bold text-emerald-950 focus:ring-2 ring-emerald-100" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5">Poster Image URL (Unsplash)</label>
                           <input type="text" value={spotlightForm.imageUrl} onChange={e => setSpotlightForm({...spotlightForm, imageUrl: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[2rem] border-none text-sm font-bold text-emerald-950 focus:ring-2 ring-emerald-100" />
                        </div>
                     </div>
                  </div>

                  <div className="pt-6">
                     {/* Preview */}
                     <div className="relative h-40 w-full rounded-[2.5rem] overflow-hidden mb-10 border-4 border-white shadow-xl">
                        <img src={spotlightForm.imageUrl} className="w-full h-full object-cover brightness-50" />
                        <div className="absolute inset-0 flex flex-col justify-center px-8">
                           <h4 className="text-white text-lg font-black serif-font italic line-clamp-1">{spotlightForm.title}</h4>
                           <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-1 line-clamp-1">Live Preview Snapshot</p>
                        </div>
                     </div>

                     <button 
                      onClick={handleSaveSpotlight} 
                      disabled={isSaving}
                      className="w-full bg-emerald-950 text-white py-6 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-black shadow-2xl shadow-emerald-950/40 active:scale-95 disabled:opacity-50 transition-all"
                     >
                       {isSaving ? 'Syncing...' : 'Publish to Production'}
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPortal;
