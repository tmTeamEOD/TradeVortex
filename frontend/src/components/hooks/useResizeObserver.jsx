// src/components/hooks/useResizeObserver.js
import { useState, useEffect } from "react";
import debounce from "lodash/debounce";

const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const handleResize = debounce((entries) => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    }, 200); // 200ms 디바운스

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      handleResize.cancel();
    };
  }, [ref]);

  return dimensions;
};

export default useResizeObserver;
