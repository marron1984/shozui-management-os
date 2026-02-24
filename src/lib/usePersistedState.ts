"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useState と同じインターフェースで、localStorage に自動永続化するフック。
 * SSR セーフ：初回は initialValue を返し、マウント後に localStorage を読み込む。
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const prefixedKey = `shozui_${key}`;

  // 初期値: SSR安全にinitialValueを使う
  const [state, setState] = useState<T>(initialValue);
  const initialized = useRef(false);

  // マウント時にlocalStorageから読み込み
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const stored = localStorage.getItem(prefixedKey);
      if (stored !== null) {
        setState(JSON.parse(stored));
      }
    } catch {
      // パースエラー時はinitialValueのまま
    }
  }, [prefixedKey]);

  // state変更時にlocalStorageに書き込み（初期化完了後のみ）
  useEffect(() => {
    if (!initialized.current) return;
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(state));
    } catch {
      // 容量オーバー等は無視
    }
  }, [prefixedKey, state]);

  // リセット関数: localStorageをクリアしてinitialValueに戻す
  const reset = useCallback(() => {
    localStorage.removeItem(prefixedKey);
    setState(initialValue);
  }, [prefixedKey, initialValue]);

  return [state, setState, reset];
}
