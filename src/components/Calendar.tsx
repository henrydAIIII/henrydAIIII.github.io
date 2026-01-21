import { ActivityCalendar } from 'react-activity-calendar';
import { motion } from 'framer-motion';
import 'react-activity-calendar/tooltips.css';

interface Props {
  data: Array<{
    date: string;
    count: number;
    level: number;
  }>;
}

const Calendar = ({ data }: Props) => {
  // 计算总文章数
  const totalPosts = data.reduce((acc, curr) => acc + curr.count, 0);

  // Apple-style monochrome theme
  // Clean, minimal, high-contrast
  const appleTheme = {
    light: ['#f5f5f7', '#d1d1d6', '#aeaeb2', '#8e8e93', '#1c1c1e'], // San Francisco Grays
    dark: ['#1c1c1e', '#3a3a3c', '#636366', '#8e8e93', '#f5f5f7'],
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Apple-like spring easing
      className="w-full max-w-5xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 sm:p-10"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Activity</h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tighter text-gray-900">{totalPosts}</span>
            <span className="text-lg font-medium text-gray-500">contributions in the last year</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center sm:justify-start w-full overflow-x-auto pb-4 scrollbar-hide">
        <ActivityCalendar
          data={data}
          theme={appleTheme}
          blockRadius={3} // Squircle-ish
          blockSize={14}
          blockMargin={5}
          fontSize={13}
          showWeekdayLabels={true}
          style={{ fontFamily: 'inherit' }}
          labels={{
            legend: {
              less: 'Less',
              more: 'More',
            },
            months: [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            totalCount: '{{count}} posts in {{year}}',
            weekdays: [
              'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
            ]
          }}
        />
      </div>
    </motion.div>
  );
};

export default Calendar;
