import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  postsByDate: Record<string, Array<{ title: string; slug: string }>>;
}

const Calendar = ({ postsByDate }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  // Reset to today
  const goToToday = () => {
    const now = new Date();
    setDirection(now > currentDate ? 1 : -1);
    setCurrentDate(now);
  };

  const prevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setDirection(1);
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  // Handle wheel scroll with throttling
  const [isScrolling, setIsScrolling] = useState(false);
  
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault(); // Prevent page scroll when hovering calendar
    
    if (isScrolling) return;

    if (Math.abs(e.deltaY) > 30) {
      setIsScrolling(true);
      if (e.deltaY > 0) {
        nextMonth();
      } else {
        prevMonth();
      }
      
      // Reset scrolling lock after animation duration
      setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    }
  }, [isScrolling, nextMonth, prevMonth]);

  // Attach wheel listener to a ref container
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use non-passive listener to be able to preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Prepare grid cells
  const days = [];
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // Check if a day is today
  const isToday = (d: number) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Get posts for a specific day
  const getPostsForDay = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return postsByDate[dateStr] || [];
  };

  return (
    <div 
      ref={containerRef}
      className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">
          {year}年{month + 1}月
        </h2>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                aria-label="Previous month"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button 
                onClick={goToToday}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 rounded-lg transition-colors"
            >
                今天
            </button>
            <button 
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                aria-label="Next month"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="relative overflow-hidden h-[750px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
                key={`${year}-${month}`}
                custom={direction}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -50, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-7 h-full absolute inset-0"
            >
                {days.map((day, index) => {
                    // Empty cell
                    if (day === null) {
                        return <div key={`empty-${index}`} className="border-b border-r border-gray-100 bg-gray-50/30" />;
                    }

                    const posts = getPostsForDay(day);
                    const today = isToday(day);

                    return (
                        <div 
                            key={day} 
                            className={`
                                min-h-[100px] p-2 border-b border-r border-gray-100 hover:bg-gray-50 transition-colors relative group
                                ${today ? 'bg-blue-50/30' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span 
                                    className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${today ? 'bg-red-500 text-white' : 'text-gray-700'}
                                    `}
                                >
                                    {day}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                {posts.map(post => (
                                    <a 
                                        key={post.slug}
                                        href={`/blog/${post.slug}/`}
                                        className="block text-xs truncate py-1 px-1.5 rounded hover:bg-blue-100 text-gray-600 hover:text-blue-700 transition-colors"
                                        title={post.title}
                                    >
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 align-middle"></span>
                                        <span className="align-middle">{post.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {/* Fill remaining cells to complete the grid visually if needed */}
                {Array.from({ length: 42 - days.length }).map((_, i) => (
                     <div key={`fill-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30" />
                ))}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Calendar;
