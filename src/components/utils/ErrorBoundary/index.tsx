"use client";

import { Component, ErrorInfo, ReactNode } from "react";

import { isNextControlFlowError } from "./nextControlFlow";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Renders `fallback` when its subtree throws.
 *
 * Next's own `notFound()` and `redirect()` are the exception: they are throws
 * the framework is meant to catch, so they are re-thrown rather than shown as a
 * failure. Several of the subtrees this wraps call `notFound()` when the site
 * read comes back empty, and swallowing that renders "Unable to load…" with a
 * 200 where the 404 page belongs.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Guarded as well as in `getDerivedStateFromError`: React still runs this
    // for an error that phase re-threw, and a redirect is not worth logging as
    // a caught failure.
    if (isNextControlFlowError(error)) {
      return;
    }

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
