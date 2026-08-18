import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseCrudResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (item: Partial<T>) => Promise<T | null>;
  update: (id: string, item: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useCrud<T extends { id: string }>(
  table: string,
  orderColumn = 'created_at',
  ascending = false
): UseCrudResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from(table)
      .select('*')
      .order(orderColumn, { ascending });
    if (err) {
      setError(err.message);
    } else {
      setData((rows ?? []) as T[]);
    }
    setLoading(false);
  }, [table, orderColumn, ascending]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (item: Partial<T>): Promise<T | null> => {
      const { data: row, error: err } = await supabase
        .from(table)
        .insert(item)
        .select()
        .maybeSingle();
      if (err) {
        setError(err.message);
        return null;
      }
      if (row) {
        setData((prev) => [row as T, ...prev]);
      }
      return row as T | null;
    },
    [table]
  );

  const update = useCallback(
    async (id: string, item: Partial<T>): Promise<T | null> => {
      const { data: row, error: err } = await supabase
        .from(table)
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();
      if (err) {
        setError(err.message);
        return null;
      }
      if (row) {
        setData((prev) => prev.map((r) => (r.id === id ? (row as T) : r)));
      }
      return row as T | null;
    },
    [table]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: err } = await supabase.from(table).delete().eq('id', id);
      if (err) {
        setError(err.message);
        return false;
      }
      setData((prev) => prev.filter((r) => r.id !== id));
      return true;
    },
    [table]
  );

  return { data, loading, error, refetch, create, update, remove };
}
