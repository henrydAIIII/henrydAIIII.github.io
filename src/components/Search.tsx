import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 初始化 Fuse 实例
  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      keys: ['title', 'description', 'tags'],
      includeScore: true,
      threshold: 0.3, // 模糊匹配阈值，越低越精确
    });
  }, [searchData]);

  // 加载数据
  useEffect(() => {
    if (isOpen && searchData.length === 0) {
      setIsLoading(true);
      fetch('/api/search.json')
        .then((res) => res.json())
        .then((data) => {
          setSearchData(data);
          setResults(data.slice(0, 5));
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load search index', err);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // 搜索逻辑
  useEffect(() => {
    if (query.trim() === '') {
      setResults(searchData.slice(0, 5));
      return;
    }
    if (fuse) {
      const searchResults = fuse.search(query).map((result) => result.item);
      setResults(searchResults);
      setSelectedIndex(0);
    }
  }, [query, fuse, searchData]);

  // 快捷键监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = `/blog/${results[selectedIndex].slug}`;
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // 自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  // 滚动到选中项
  useEffect(() => {
    if (listRef.current && results.length > 0) {
        const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [selectedIndex, results]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100/50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors duration-200 group"
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 group-hover:text-gray-600"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span className="hidden sm:inline-block">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[70vh]"
            >
              <div className="flex items-center border-b border-gray-100 px-4 py-3">
                <svg
                  className="h-5 w-5 text-gray-400 flex-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="flex-auto bg-transparent px-3 py-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
                />
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded"
                >
                    ESC
                </button>
              </div>

              {isLoading ? (
                <div className="p-10 text-center text-sm text-gray-500">
                  Loading...
                </div>
              ) : results.length > 0 ? (
                <ul ref={listRef} className="flex-1 overflow-y-auto p-2 scroll-py-2">
                  {query === '' && (
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500">Recent</div>
                  )}
                  {results.map((result, index) => (
                    <li key={result.slug}>
                      <a
                        href={`/blog/${result.slug}`}
                        className={`flex flex-col gap-1 rounded-lg px-4 py-3 select-none ${
                          index === selectedIndex
                            ? 'bg-indigo-50 text-indigo-900'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-medium">{result.title}</span>
                        <span className={`text-xs line-clamp-1 ${index === selectedIndex ? 'text-indigo-700' : 'text-gray-500'}`}>
                          {result.description}
                        </span>
                        <div className="flex gap-2 mt-1">
                            {result.tags?.map(tag => (
                                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    index === selectedIndex ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-10 text-center text-sm text-gray-500">
                  No results found for "<span className="font-semibold text-gray-900">{query}</span>"
                </div>
              )}
              
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-500 flex justify-between items-center">
                <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                        <kbd className="font-sans px-1 py-0.5 rounded bg-white border border-gray-200">↵</kbd>
                        to select
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="font-sans px-1 py-0.5 rounded bg-white border border-gray-200">↑↓</kbd>
                        to navigate
                    </span>
                </div>
                <div>
                    Search by Fuse.js
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
