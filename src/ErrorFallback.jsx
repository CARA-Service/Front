import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-fallback">
      <p>⚠️ 문제가 발생했습니다:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}
