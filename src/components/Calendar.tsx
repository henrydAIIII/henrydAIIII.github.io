import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  postsByDate: Record<string, Array<{ title: string; slug: string }>>;
}

const Calendar = ({ postsByDate }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const detailsRef = useRef<HTMLDivElement>(null);

  // Auto scroll to details when selected
  useEffect(() => {
    if (selectedDate && detailsRef.current) {
        setTimeout(() => {
            detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  }, [selectedDate]);

  // Reset to today
  const goToToday = () => {
    const now = new Date();
    setDirection(now > currentDate ? 1 : -1);
    setCurrentDate(now);
    setSelectedDate(null);
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

  // Check if a day is in the future
  const isFuture = (d: number) => {
    const today = new Date();
    // Reset time part for accurate comparison
    const checkDate = new Date(year, month, d);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate > todayDate;
  };

  // Get posts for a specific day
  const getPostsForDay = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return postsByDate[dateStr] || [];
  };

  const isSelected = (d: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return selectedDate === dateStr;
  }

  const handleDateClick = (d: number) => {
      if (isFuture(d)) return;
      
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (selectedDate === dateStr) {
          setSelectedDate(null); // Toggle off
      } else {
          setSelectedDate(dateStr);
      }
  }

  return (
    <div className="flex flex-col gap-6">
        <div 
        className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden select-none"
        >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative group">
                    <select 
                        value={year}
                        onChange={(e) => {
                            const newYear = parseInt(e.target.value);
                            setDirection(newYear > year ? 1 : -1);
                            setCurrentDate(new Date(newYear, month, 1));
                        }}
                        className="appearance-none bg-transparent text-lg sm:text-xl font-bold text-gray-900 pr-5 sm:pr-6 py-1 cursor-pointer outline-none hover:text-blue-600 transition-colors"
                    >
                        {Array.from({ length: new Date().getFullYear() + 2 - 2020 }, (_, i) => 2020 + i).map(y => (
                            <option key={y} value={y}>{y}年</option>
                        ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div className="relative group">
                    <select 
                        value={month}
                        onChange={(e) => {
                            const newMonth = parseInt(e.target.value);
                            setDirection(newMonth > month ? 1 : -1);
                            setCurrentDate(new Date(year, newMonth, 1));
                        }}
                        className="appearance-none bg-transparent text-lg sm:text-xl font-bold text-gray-900 pr-5 sm:pr-6 py-1 cursor-pointer outline-none hover:text-blue-600 transition-colors"
                    >
                        {Array.from({ length: 12 }, (_, i) => i).map(m => (
                            <option key={m} value={m}>{m + 1}月</option>
                        ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900"
                    aria-label="Previous month"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button 
                    onClick={goToToday}
                    className="px-2 sm:px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                    今天
                </button>
                <button 
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900"
                    aria-label="Next month"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {weekDays.map(day => (
            <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {day}
            </div>
            ))}
        </div>

        {/* Days Grid */}
        <div className="relative overflow-hidden aspect-[7/6] sm:h-[420px] sm:aspect-auto">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                    key={`${year}-${month}`}
                    custom={direction}
                    initial={{ x: direction * 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -50, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="grid grid-cols-7 grid-rows-6 h-full absolute inset-0"
                >
                    {days.map((day, index) => {
                        // Empty cell
                        if (day === null) {
                            return <div key={`empty-${index}`} className="border-b border-r border-gray-50/50 bg-gray-50/20" />;
                        }

                        const posts = getPostsForDay(day);
                        const hasPosts = posts.length > 0;
                        const today = isToday(day);
                        const future = isFuture(day);
                        const selected = isSelected(day);

                        return (
                            <div 
                                key={day} 
                                onClick={() => handleDateClick(day)}
                                className={`
                                    relative border-b border-r border-gray-50 transition-all duration-200
                                    flex flex-col items-center justify-start pt-2 sm:pt-3
                                    ${future 
                                        ? 'bg-gray-50/50 cursor-not-allowed' 
                                        : 'cursor-pointer hover:bg-gray-50 group'
                                    }
                                    ${selected ? 'bg-blue-50/50' : ''}
                                `}
                            >
                                <span 
                                    className={`
                                        text-xs sm:text-sm font-medium w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all
                                        ${today 
                                            ? 'bg-red-500 text-white shadow-md shadow-red-200' 
                                            : selected 
                                                ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                                                : future
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700 group-hover:bg-white group-hover:shadow-sm'
                                        }
                                    `}
                                >
                                    {day}
                                </span>
                                
                                {/* Indicators */}
                                {!future && (
                                    <div className="mt-1 sm:mt-2 flex gap-0.5 sm:gap-1 justify-center flex-wrap px-1 sm:px-2 h-1.5 sm:h-auto">
                                        {posts.slice(0, 3).map((_, i) => (
                                            <span 
                                                key={i} 
                                                className={`
                                                    w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full 
                                                    ${today || selected ? 'bg-current opacity-60' : 'bg-blue-400'}
                                                    ${selected ? 'text-blue-500' : ''}
                                                    ${today ? 'text-red-500' : ''}
                                                `} 
                                            />
                                        ))}
                                        {posts.length > 3 && (
                                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-300" />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {/* Fill remaining cells */}
                    {Array.from({ length: 42 - days.length }).map((_, i) => (
                        <div key={`fill-${i}`} className="border-b border-r border-gray-50/50 bg-gray-50/20" />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
        </div>

        {/* Selected Date Details */}
        <AnimatePresence mode="wait">
            {selectedDate && (
                <motion.div
                    ref={detailsRef}
                    key={selectedDate}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                            {selectedDate.split('-')[1]}月{selectedDate.split('-')[2]}日的文章
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500">
                            共 {postsByDate[selectedDate]?.length || 0} 篇
                        </span>
                    </div>

                    {postsByDate[selectedDate]?.length > 0 ? (
                        <div className="grid gap-2 sm:gap-3">
                            {postsByDate[selectedDate].map(post => (
                                <a 
                                    key={post.slug}
                                    href={`/blog/${post.slug}/`}
                                    className="block p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                                            {post.title}
                                        </span>
                                        <span className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2">
                                            →
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 sm:py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm sm:text-base">
                            <p>这一天没有发布文章</p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default Calendar;
