
import LZString from "lz-string";

interface CacheData<T> {
  timestamp: number;
  data: T;
  isEmpty: boolean; 
}

export function useCache<T>(options = {
  expirationTimeMs: 2 * 60 * 60 * 1000,
  emptyDataExpirationTimeMs: 1 * 60 * 1000,
}) {
  const saveToCache = (key: string, data: T): void => {
    try {
      // Verifica se os dados são um array vazio ou um objeto vazio
      const isEmpty = Array.isArray(data) ? data.length === 0 : 
                    typeof data === 'object' && data !== null ? Object.keys(data).length === 0 : false;
      
      const cacheItem: CacheData<T> = {
        timestamp: new Date().getTime(),
        data,
        isEmpty,
      };
      
      const compressed = LZString.compress(JSON.stringify(cacheItem));
      localStorage.setItem(key, compressed);
      console.log(`✅ Dados ${isEmpty ? 'vazios' : ''} salvos no cache: ${key}`);
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  const getFromCache = (key: string, forceRefresh = false): T | null => {
    try {
      // Se forceRefresh for true, ignora o cache
      if (forceRefresh) {
        console.log("🔄 Forçando atualização: ignorando cache");
        return null;
      }
      
      const compressed = localStorage.getItem(key);
      if (!compressed) return null;
      
      const decompressed = LZString.decompress(compressed);
      if (!decompressed) return null;
      
      const cacheItem: CacheData<T> = JSON.parse(decompressed);
      const now = new Date().getTime();
      const timeDiff = now - cacheItem.timestamp;
      
      // Usa tempo de expiração reduzido para dados vazios
      const expirationTime = cacheItem.isEmpty 
        ? options.emptyDataExpirationTimeMs 
        : options.expirationTimeMs;
      
      if (timeDiff < expirationTime) {
        console.log(`✅ Usando dados do cache${cacheItem.isEmpty ? ' (vazios)' : ''}: ${key}`);
        return cacheItem.data;
      }
      
      console.log(`⏰ Cache expirado${cacheItem.isEmpty ? ' (dados vazios)' : ''}: ${key}`);
      return null;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  const invalidateCache = (key: string): void => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Cache invalidado: ${key}`);
    } catch (error) {
      console.error("Error invalidating cache:", error);
    }
  };

  const invalidateAllCache = (): void => {
    try {
      // Remove apenas itens do cache que começam com 'dropi-'
      Object.keys(localStorage)
        .filter(key => key.startsWith('dropi-'))
        .forEach(key => localStorage.removeItem(key));
      
      console.log("🗑️ Todo o cache relacionado à API foi invalidado");
    } catch (error) {
      console.error("Error invalidating all cache:", error);
    }
  };

  return {
    saveToCache,
    getFromCache,
    invalidateCache,
    invalidateAllCache,
  };
}