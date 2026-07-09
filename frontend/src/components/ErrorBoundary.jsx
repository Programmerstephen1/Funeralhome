import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error boundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-6 py-16">
          <div className="max-w-md rounded-[1.5rem] border border-[#E8DFD1] bg-white p-8 text-center shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#A8895C]">Unexpected issue</p>
            <h2 className="mt-3 text-2xl font-serif font-semibold text-[#1F2E27]">Something went wrong</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#3D3530]">
              The page hit an unexpected problem. Refreshing the app usually restores everything quickly.
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 rounded-full bg-[#1F2E27] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A8895C]"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
