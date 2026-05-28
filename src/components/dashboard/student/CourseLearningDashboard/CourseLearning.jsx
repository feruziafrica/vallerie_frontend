import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { api } from '@/api/auth';

import VideoPlayer      from './VideoPlayer';
import VideoEndedNudge  from './VideoEndedNudge';
import ResourceList     from './ResourceList';       // ← was ResourcesList
import ModuleAccordion  from './ModuleAccordion';

const WATCH_REPORT_INTERVAL_MS = 30_000;
const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 };

export default function CourseLearning({ courseData, loading, error, theme }) {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLesson,   setSelectedLesson]   = useState(null);
  const [markingComplete,  setMarkingComplete]   = useState(false);
  const [videoEnded,       setVideoEnded]        = useState(false);

  const videoRef          = useRef(null);
  const iframeRef         = useRef(null);
  const watchIntervalRef  = useRef(null);
  const accMinutesRef     = useRef(0);
  const selectedLessonRef = useRef(null);

  useEffect(() => { selectedLessonRef.current = selectedLesson; }, [selectedLesson]);

  const flushWatchTime = useCallback(() => {
    clearInterval(watchIntervalRef.current);
    const lesson  = selectedLessonRef.current;
    const minutes = Math.round(accMinutesRef.current);
    if (minutes > 0 && lesson) {
      api.patch(`/api/dashboard/lesson-progress/${lesson.id}/`, {
        time_spent_minutes: minutes,
      }).catch(() => {});
      accMinutesRef.current = 0;
    }
  }, []);

  const startWatchTracking = useCallback(() => {
    clearInterval(watchIntervalRef.current);
    watchIntervalRef.current = setInterval(() => {
      accMinutesRef.current += 0.5;
      const lesson = selectedLessonRef.current;
      if (lesson && accMinutesRef.current >= 0.5) {
        api.patch(`/api/dashboard/lesson-progress/${lesson.id}/`, {
          time_spent_minutes: 1,
        }).catch(() => {});
        accMinutesRef.current = 0;
      }
    }, WATCH_REPORT_INTERVAL_MS);
  }, []);

  // YouTube postMessage state listener
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event !== 'onStateChange') return;
        const state = data.info;
        if (state === YT_STATE.PLAYING)                                     { setVideoEnded(false); startWatchTracking(); }
        else if (state === YT_STATE.PAUSED || state === YT_STATE.BUFFERING) { flushWatchTime(); }
        else if (state === YT_STATE.ENDED)                                  { setVideoEnded(true);  flushWatchTime(); }
      } catch { /* non-YouTube postMessage — ignore */ }
    };
    window.addEventListener('message', handleMessage);
    return () => { window.removeEventListener('message', handleMessage); clearInterval(watchIntervalRef.current); };
  }, [startWatchTracking, flushWatchTime]);

  // Flush + reset on lesson change
  const prevLessonIdRef = useRef(null);
  useEffect(() => {
    if (selectedLesson?.id && selectedLesson.id !== prevLessonIdRef.current) {
      flushWatchTime();
      setVideoEnded(false);
      prevLessonIdRef.current = selectedLesson.id;
    }
  }, [selectedLesson?.id, flushWatchTime]);

  // Flush on unmount
  useEffect(() => () => flushWatchTime(), [flushWatchTime]);

  // Initialise completed lessons + resume session
  useEffect(() => {
    if (!courseData) return;
    if (courseData.progress?.completed_lesson_ids) {
      setCompletedLessons(courseData.progress.completed_lesson_ids);
    }
    const sessionLesson = courseData.session?.last_lesson
      ? courseData.modules?.flatMap(m => m.lessons)?.find(l => l.id === courseData.session.last_lesson)
      : null;
    const resumeTarget = sessionLesson || courseData.modules?.[0]?.lessons?.[0];
    if (resumeTarget && !selectedLesson) setSelectedLesson(resumeTarget);
  }, [courseData]);

  const updateSession = useCallback((lesson) => {
    if (!courseData?.slug || !lesson) return;
    api.patch(`/api/dashboard/session/${courseData.slug}/`, {
      last_lesson: lesson.id,
      last_video_position_percent: 0,
    }).catch(() => {});
  }, [courseData?.slug]);

  const handleSelectLesson = useCallback((lesson) => {
    setSelectedLesson(lesson);
    updateSession(lesson);
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [updateSession]);

  const handleMarkComplete = async () => {
    if (!selectedLesson || markingComplete) return;
    setMarkingComplete(true);
    try {
      await api.post('/api/dashboard/mark-lesson-complete/', { lesson_id: selectedLesson.id });
      setCompletedLessons(prev => prev.includes(selectedLesson.id) ? prev : [...prev, selectedLesson.id]);
      setVideoEnded(false);
    } catch (err) {
      if (import.meta.env.DEV) console.debug('[CourseLearning] mark-complete failed:', err.message);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNextLesson = useCallback(() => {
    const allLessons = courseData?.modules?.flatMap(m => m.lessons) || [];
    const idx = allLessons.findIndex(l => l.id === selectedLesson?.id);
    if (idx !== -1 && idx < allLessons.length - 1) handleSelectLesson(allLessons[idx + 1]);
  }, [courseData, selectedLesson, handleSelectLesson]);

  const allLessons  = courseData?.modules?.flatMap(m => m.lessons) || [];
  const currentIdx  = allLessons.findIndex(l => l.id === selectedLesson?.id);
  const hasNext     = currentIdx !== -1 && currentIdx < allLessons.length - 1;
  const isCompleted = completedLessons.includes(selectedLesson?.id);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: `2px solid ${theme.primary}18`,
            borderTopColor: theme.primary, margin: '0 auto 14px',
          }}
        />
        <p style={{ color: theme.textLight, fontSize: '13px', margin: 0, fontWeight: '500' }}>
          Loading course…
        </p>
      </div>
    </div>
  );

  if (error || !courseData) return (
    <div style={{
      padding: '20px', borderRadius: '12px',
      background: theme.lightCream, border: `1px solid ${theme.border}`,
    }}>
      <p style={{ color: theme.text, margin: 0, fontSize: '14px' }}>
        {error || 'No course data available'}
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div ref={videoRef}>
        <VideoPlayer lesson={selectedLesson} theme={theme} iframeRef={iframeRef} />
      </div>

      <AnimatePresence>
        {videoEnded && (
          <VideoEndedNudge
            isCompleted={isCompleted}
            onMarkComplete={handleMarkComplete}
            onNextLesson={handleNextLesson}
            hasNext={hasNext}
            markingComplete={markingComplete}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* ── Lesson meta + action buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: '12px', border: `1px solid ${theme.border}`,
          background: theme.white, padding: '18px 22px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLesson?.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
              >
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: theme.text, margin: '0 0 5px' }}>
                  {selectedLesson?.title || 'Select a lesson'}
                </h2>
                {selectedLesson?.description && (
                  <p style={{ fontSize: '13px', color: theme.textLight, margin: 0, lineHeight: 1.6 }}>
                    {selectedLesson.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={handleMarkComplete}
              disabled={isCompleted || markingComplete || !selectedLesson}
              whileHover={!isCompleted ? { scale: 1.015 } : {}}
              whileTap={!isCompleted ? { scale: 0.975 } : {}}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '9px', border: '1.5px solid',
                borderColor: isCompleted ? `${theme.primary}35` : theme.primary,
                background: isCompleted ? `${theme.primary}08` : theme.primary,
                color: isCompleted ? theme.primary : '#fff',
                fontSize: '12px', fontWeight: '700',
                cursor: isCompleted ? 'default' : 'pointer',
                transition: 'all 0.18s', opacity: markingComplete ? 0.65 : 1,
              }}
            >
              {isCompleted ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Completed
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 8 12 12 14 14"/>
                  </svg>
                  {markingComplete ? 'Saving…' : 'Mark Complete'}
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleNextLesson}
              disabled={!hasNext}
              whileHover={hasNext ? { scale: 1.015 } : {}}
              whileTap={hasNext ? { scale: 0.975 } : {}}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '9px',
                border: `1.5px solid ${theme.border}`,
                background: theme.lightCream,
                color: hasNext ? theme.text : theme.textLight,
                fontSize: '12px', fontWeight: '600',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.18s',
              }}
            >
              Next Lesson
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Resources ── */}
      <ResourceList resources={selectedLesson?.resources} theme={theme} />

      <ModuleAccordion
        modules={courseData?.modules}
        selectedLesson={selectedLesson}
        completedLessons={completedLessons}
        onSelectLesson={handleSelectLesson}
        theme={theme}
      />
    </div>
  );
}

CourseLearning.propTypes = {
  courseData: PropTypes.object,
  loading:    PropTypes.bool,
  error:      PropTypes.string,
  theme:      PropTypes.object.isRequired,
};