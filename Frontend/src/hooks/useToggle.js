import { useState, useCallback } from 'react';

export default function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  const set = useCallback(val => setOn(Boolean(val)), []);
  return [on, toggle, set];
}
