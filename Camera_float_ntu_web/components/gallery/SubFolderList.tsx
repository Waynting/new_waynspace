"use client";

import { useRouter } from "next/navigation";

interface SubFolderListProps {
  parentFolder: string;
  subFolders: string[];
}

export function SubFolderList({ parentFolder, subFolders }: SubFolderListProps) {
  const router = useRouter();

  if (subFolders.length === 0) {
    return null;
  }

  // 自然排序函数，支持数字格式（如 1.1, 1.2, 1.10, 1.11, 1.12）
  const naturalSort = (a: string, b: string): number => {
    try {
      // 提取数字部分进行排序
      const extractNumbers = (str: string): number[] => {
        // 使用更精确的正则表达式匹配数字（包括小数）
        // 匹配模式：整数部分.小数部分，例如 "1.1" -> [1, 1], "1.10" -> [1, 10]
        const parts: number[] = [];
        const regex = /(\d+)(?:\.(\d+))?/g;
        let match;
        let iterations = 0;
        const maxIterations = 1000; // 防止无限循环
        
        while ((match = regex.exec(str)) !== null && iterations < maxIterations) {
          iterations++;
          // match[1] 是整数部分，match[2] 是小数部分（如果有）
          const intPart = parseInt(match[1], 10);
          if (!isNaN(intPart)) {
            parts.push(intPart);
          }
          if (match[2]) {
            const decPart = parseInt(match[2], 10);
            if (!isNaN(decPart)) {
              parts.push(decPart);
            }
          }
        }
        
        return parts;
      };

      const aNumbers = extractNumbers(a);
      const bNumbers = extractNumbers(b);
      
      // 如果都没有数字，使用字符串比较
      if (aNumbers.length === 0 && bNumbers.length === 0) {
        return a.localeCompare(b);
      }
      
      // 如果只有一个有数字，有数字的排在前面
      if (aNumbers.length === 0) return 1;
      if (bNumbers.length === 0) return -1;
      
      // 比较每个数字部分
      const minLength = Math.min(aNumbers.length, bNumbers.length);
      for (let i = 0; i < minLength; i++) {
        if (aNumbers[i] !== bNumbers[i]) {
          return aNumbers[i] - bNumbers[i];
        }
      }
      
      // 如果数字部分相同，比较长度（数字部分更多的排在后面）
      return aNumbers.length - bNumbers.length;
    } catch (error) {
      console.error('Error in naturalSort:', error);
      // 如果排序出错，回退到字符串比较
      return a.localeCompare(b);
    }
  };

  // 对子文件夹进行排序
  const sortedSubFolders = [...subFolders].sort(naturalSort);

  const handleSubFolderClick = (subFolder: string) => {
    const path = parentFolder ? `${parentFolder}/${subFolder}` : subFolder;
    router.push(`/folder/${path}`);
  };

  return (
    <div className="mb-8">
      {/* Section label */}
      <div className="border-b border-border pb-3 mb-0">
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          子資料夾 · {subFolders.length}
        </span>
      </div>
      {sortedSubFolders.map((subFolder) => (
        <button
          key={subFolder}
          onClick={() => handleSubFolderClick(subFolder)}
          className="w-full border-b border-border/50 py-4 flex items-baseline justify-between group text-left hover:opacity-60 transition-opacity"
        >
          <span className="text-sm font-medium">{subFolder}</span>
          <span className="text-xs text-muted-foreground">→</span>
        </button>
      ))}
    </div>
  );
}

