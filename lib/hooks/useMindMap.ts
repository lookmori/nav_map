import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

interface MindMapData {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  userId: string;
}

export function useMindMap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 保存思维导图
  const saveMindMap = useCallback(async (data: MindMapData) => {
    setLoading(true);
    setError(null);

    try {
      const url = data.id ? `/api/mindmaps/${data.id}` : '/api/mindmaps';
      const method = data.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载思维导图
  const loadMindMap = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mindmaps/${id}`);

      if (!response.ok) {
        throw new Error('加载失败');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取用户的所有思维导图
  const getMindMaps = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mindmaps?userId=${userId}`);

      if (!response.ok) {
        throw new Error('获取列表失败');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取列表失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除思维导图
  const deleteMindMap = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mindmaps/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveMindMap,
    loadMindMap,
    getMindMaps,
    deleteMindMap,
  };
}
