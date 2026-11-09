import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export default function ScriptsLoaderPage() {
  const { siteId } = useParams<{ siteId: string }>();

  const paramsOk = useMemo(() => Boolean(siteId), [siteId]);

  const scriptsQuery = useQuery({
    queryKey: ['scriptsUrl', siteId],
    enabled: paramsOk,
    queryFn: async () => {
      return await apiService.getScriptsUrl(siteId!);
    },
  });

  const items = useMemo(() => scriptsQuery.data ?? [], [scriptsQuery.data]);

  useEffect(() => {
    if (items.length === 0) return;

    const elements: HTMLScriptElement[] = [];

    items.forEach((item) => {
      const script = document.createElement('script');
      script.src = item.signedUrl;
      script.async = true;
      script.dataset.params = JSON.stringify(item.params ?? []);
      script.onload = () => {
        console.log('loaded:', item.signedUrl);
      };
      script.onerror = () => {
        console.error('failed:', item.signedUrl);
      };
      document.body.appendChild(script);
      elements.push(script);
    });

    return () => {
      elements.forEach((script) => {
        script.remove();
      });
    };
  }, [items]);

  const state: 'idle' | 'loading' | 'loaded' | 'error' = !paramsOk
    ? 'idle'
    : scriptsQuery.isPending
      ? 'loading'
      : scriptsQuery.isError
        ? 'error'
        : 'loaded';
  const error = scriptsQuery.isError
    ? scriptsQuery.error instanceof Error
      ? scriptsQuery.error.message
      : 'Unknown error'
    : null;

  if (!paramsOk) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Scripts loader</h1>
        <p className="mt-2 text-sm text-gray-600">
          Missing params. Use <code>/scripts/&lt;siteId&gt;/&lt;appCategoryId&gt;</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Scripts loader</h1>
      <p className="mt-2 text-sm text-gray-600">
        Fetching from <code>/scriptsUrl/{siteId}</code>
      </p>

      <div className="mt-4">
        <div className="text-sm">
          <span className="font-medium">Status:</span> {state}
        </div>
        {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium">URLs</div>
        {items.length === 0 ? (
          <div className="mt-2 text-sm text-gray-600">(none)</div>
        ) : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {items.map((it) => (
              <li key={it.url}>
                <div>
                  <div className="text-xs text-gray-500">url</div>
                  <code className="break-all">{it.url}</code>
                </div>
                <div className="mt-1">
                  <div className="text-xs text-gray-500">signedUrl</div>
                  <code className="break-all">{it.signedUrl}</code>
                </div>
                <div className="mt-1">
                  <div className="text-xs text-gray-500">params</div>
                  <code className="break-all">{JSON.stringify(it.params ?? [])}</code>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
